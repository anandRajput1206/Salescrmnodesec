import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { FilterBar } from './FilterBar'
import { KpiCards } from './KpiCards'
import { SalesTeamCharts } from './charts/SalesTeamCharts'
import { ManagerCharts } from './charts/ManagerCharts'
import { useAuth } from '../context/AuthContext'
import { canViewAllData, fetchAllUsers } from '../lib/auth'
import { fetchDashboardData, getActiveUploadByUser } from '../lib/dataService'
import { filterEntries, getDashboardStats, getPeriodOptions, getRegionOptions } from '../lib/chartUtils'
import { checkDatabaseSetup } from '../lib/supabase'
import type { DashboardData, DashboardFilters, User } from '../lib/types'

const EMPTY: DashboardData = { entries: [], uploads: [] }

export function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData>(EMPTY)
  const [teamUsers, setTeamUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<string | null>(null)
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
      if (!setup.ok) setToast(setup.message)

      if (canViewAllData(user)) {
        const users = await fetchAllUsers()
        setTeamUsers(users.filter((member) => member.role === 'sales_team'))
      }
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load dashboard'
      setError(message)
      setToast(message)
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
  const regionOptions = useMemo(() => getRegionOptions(data.entries), [data.entries])
  const stats = useMemo(() => getDashboardStats(filteredEntries), [filteredEntries])
  const activeUploads = useMemo(() => getActiveUploadByUser(data.uploads), [data.uploads])

  if (!user) return null

  const activeUpload = activeUploads.get(user.id)
  const isManagerView = canViewAllData(user)

  return (
    <div className="page-shell">
      {toast ? (
        <div className="app-toast app-toast-error" role="status">
          <div>
            <strong>Connection issue</strong>
            <p>{toast}</p>
          </div>
          <button type="button" className="app-toast-close" onClick={() => setToast(null)} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      ) : null}

      <header className="page-header">
        <div>
          <p className="eyebrow">{isManagerView ? 'Manager Analytics' : 'My Performance'}</p>
          <h3>{isManagerView ? 'Team Comparative Dashboard' : 'Personal Sales Dashboard'}</h3>
          {!isManagerView && activeUpload ? (
            <p className="muted">
              Dashboard shows data from your latest real sheet: <strong>{activeUpload.fileName}</strong>
            </p>
          ) : isManagerView ? (
            <p className="muted">Charts use each employee&apos;s latest real sheet only — duplicates are excluded.</p>
          ) : null}
        </div>
        <button type="button" className="secondary-btn" onClick={() => void loadData()}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      <FilterBar
        filters={filters}
        periodOptions={periodOptions}
        regionOptions={regionOptions}
        teamUsers={teamUsers}
        showRegionFilter={user.role === 'admin'}
        showEmployeeFilter={isManagerView}
        onChange={setFilters}
      />

      <KpiCards stats={stats} />

      {loading ? <p className="status-text">Loading dashboard...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading && filteredEntries.length === 0 ? (
        <div className="empty-state">
          <h3>No data available</h3>
          <p>
            {isManagerView
              ? 'Sales team members need to upload their Excel files first.'
              : 'Upload the CyberSecurity Sales template from the Upload page.'}
          </p>
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

      {data.uploads.length > 0 ? (
        <section className="upload-history">
          <h3>{isManagerView ? 'Team Upload History' : 'Your Upload History'}</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {isManagerView ? <th>Employee</th> : null}
                  <th>File</th>
                  <th>Rows</th>
                  <th>Type</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {data.uploads.map((upload) => (
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
