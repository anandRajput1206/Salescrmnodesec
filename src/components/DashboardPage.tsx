import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Trash2, X } from 'lucide-react'
import { FilterBar } from './FilterBar'
import { KpiCards } from './KpiCards'
import { SalesTeamCharts } from './charts/SalesTeamCharts'
import { ManagerCharts } from './charts/ManagerCharts'
import { useAuth } from '../context/AuthContext'
import { canManageUploads, canViewAllData, fetchAllUsers } from '../lib/auth'
import { deleteUpload, fetchDashboardData, getActiveUploadByUser } from '../lib/dataService'
import { filterEntries, getDashboardStats, getPeriodOptions } from '../lib/chartUtils'
import { checkDatabaseSetup } from '../lib/supabase'
import {
  dashboardEmptyMessage,
  dashboardEyebrow,
  dashboardSubtitle,
  dashboardTitle,
  deleteUploadConfirm,
  uploadHistoryTitle,
} from '../lib/uiCopy'
import type { DashboardData, DashboardFilters, UploadMeta } from '../lib/types'

const EMPTY: DashboardData = { entries: [], uploads: [] }

export function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData>(EMPTY)
  const [teamUsers, setTeamUsers] = useState<Awaited<ReturnType<typeof fetchAllUsers>>>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ type: 'error' | 'info'; title: string; message: string } | null>(
    null,
  )
  const [filters, setFilters] = useState<DashboardFilters>({
    timePeriod: 'monthly',
    periodValue: 'all',
    region: 'all',
    employeeId: 'all',
  })

  async function loadData() {
    if (!user) return
    setLoading(true)
    setError('')

    try {
      const [nextData, setup] = await Promise.all([
        fetchDashboardData(user),
        checkDatabaseSetup(),
      ])

      setData(nextData)
      if (!setup.ok) {
        setToast({ type: 'error', title: 'Connection issue', message: setup.message })
      }

      if (canViewAllData(user)) {
        const users = await fetchAllUsers()
        setTeamUsers(users.filter((member) => member.role === 'sales_team'))
      }
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load dashboard'
      setError(message)
      setToast({ type: 'error', title: 'Load failed', message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [user?.id])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 6000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const filteredEntries = useMemo(
    () => filterEntries(data.entries, filters),
    [data.entries, filters],
  )

  const periodOptions = useMemo(
    () => getPeriodOptions(data.entries, filters.timePeriod),
    [data.entries, filters.timePeriod],
  )
  const stats = useMemo(() => getDashboardStats(filteredEntries), [filteredEntries])
  const activeUploads = useMemo(() => getActiveUploadByUser(data.uploads), [data.uploads])

  const historyUploads = useMemo(() => {
    if (!user || !canViewAllData(user)) return data.uploads

    return data.uploads.filter((upload) => {
      return filters.employeeId === 'all' || upload.userId === filters.employeeId
    })
  }, [data.uploads, filters.employeeId, user])

  if (!user) return null

  const activeUpload = activeUploads.get(user.id)
  const isManagerView = canViewAllData(user)
  const canDeleteSheets = canManageUploads(user)

  async function handleDeleteUpload(upload: UploadMeta) {
    if (!user || !canDeleteSheets) return

    if (!window.confirm(deleteUploadConfirm(upload))) return

    setDeletingId(upload.id)
    try {
      const result = await deleteUpload(user, upload.id)
      setToast({ type: 'info', title: 'Sheet deleted', message: result.message })
      await loadData()
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Delete failed'
      setToast({ type: 'error', title: 'Delete failed', message })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page-shell">
      {toast ? (
        <div className={`app-toast app-toast-${toast.type}`} role="status">
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button type="button" className="app-toast-close" onClick={() => setToast(null)} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      ) : null}

      <header className="page-header">
        <div>
          <p className="eyebrow">{dashboardEyebrow(user.role)}</p>
          <h3>{dashboardTitle(user.role)}</h3>
          {!isManagerView && activeUpload ? (
            <p className="muted">
              {dashboardSubtitle(user.role)} Active file: <strong>{activeUpload.fileName}</strong>
            </p>
          ) : (
            <p className="muted">{dashboardSubtitle(user.role)}</p>
          )}
        </div>
        <button type="button" className="secondary-btn" onClick={() => void loadData()}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      <FilterBar
        filters={filters}
        periodOptions={periodOptions}
        teamUsers={teamUsers}
        showEmployeeFilter={isManagerView}
        onChange={setFilters}
      />

      <KpiCards stats={stats} />

      {loading ? <p className="status-text">Loading dashboard...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading && filteredEntries.length === 0 ? (
        <div className="empty-state">
          <h3>No data available</h3>
          <p>{dashboardEmptyMessage(user.role)}</p>
        </div>
      ) : (
        <section className="charts-grid">
          {isManagerView ? (
            <ManagerCharts entries={filteredEntries} />
          ) : (
            <SalesTeamCharts entries={filteredEntries} />
          )}
        </section>
      )}

      {historyUploads.length > 0 ? (
        <section className="upload-history">
          <h3>{uploadHistoryTitle(user.role)}</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {isManagerView ? <th>Employee</th> : null}
                  <th>File</th>
                  <th>Rows</th>
                  <th>Type</th>
                  <th>Uploaded</th>
                  {canDeleteSheets ? <th>Action</th> : null}
                </tr>
              </thead>
              <tbody>
                {historyUploads.map((upload) => (
                  <tr key={upload.id}>
                    {isManagerView ? <td>{upload.userName}</td> : null}
                    <td>{upload.fileName}</td>
                    <td>{upload.rowCount}</td>
                    <td>
                      <span className={`upload-status-badge upload-status-${upload.status}`}>
                        {upload.status === 'latest'
                          ? 'Latest'
                          : upload.status === 'duplicate'
                            ? 'Duplicate'
                            : 'Previous'}
                      </span>
                    </td>
                    <td>{new Date(upload.uploadedAt).toLocaleString()}</td>
                    {canDeleteSheets ? (
                      <td>
                        <button
                          type="button"
                          className="danger-btn"
                          disabled={deletingId === upload.id}
                          onClick={() => void handleDeleteUpload(upload)}
                          title="Delete incorrect upload"
                        >
                          <Trash2 size={14} />
                          {deletingId === upload.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}
