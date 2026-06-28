import { useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { FilterBar } from './FilterBar'
import { KpiCards } from './KpiCards'
import { SalesTeamCharts } from './charts/SalesTeamCharts'
import { ManagerCharts } from './charts/ManagerCharts'
import { useAuth } from '../context/AuthContext'
import { canViewAllData } from '../lib/auth'
import { fetchDashboardData, getStorageMode } from '../lib/dataService'
import { filterEntries, getDashboardStats, getPeriodOptions, getRegionOptions } from '../lib/chartUtils'
import { checkDatabaseSetup } from '../lib/supabase'
import type { DashboardData, DashboardFilters } from '../lib/types'

const EMPTY: DashboardData = { entries: [], uploads: [] }

export function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dbStatus, setDbStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const [filters, setFilters] = useState<DashboardFilters>({
    timePeriod: 'monthly',
    periodValue: 'all',
    region: 'all',
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
      setDbStatus(setup)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [user?.id])

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
  const isManagerView = user ? canViewAllData(user) : false

  if (!user) return null

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">{isManagerView ? 'Manager Analytics' : 'My Performance'}</p>
          <h3>{isManagerView ? 'Team Comparative Dashboard' : 'Personal Sales Dashboard'}</h3>
          <p className="muted">
            {getStorageMode() === 'supabase'
              ? dbStatus?.message ?? 'Supabase connected'
              : 'Local browser storage'}
          </p>
        </div>
        <button type="button" className="secondary-btn" onClick={() => void loadData()}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      {dbStatus && !dbStatus.ok ? (
        <div className="setup-banner">
          <strong>Database setup required</strong>
          <p>{dbStatus.message}</p>
        </div>
      ) : null}

      <FilterBar
        filters={filters}
        periodOptions={periodOptions}
        regionOptions={regionOptions}
        showRegionFilter={user.role === 'admin'}
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
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {data.uploads.slice(0, 8).map((upload) => (
                  <tr key={upload.id}>
                    {isManagerView ? <td>{upload.userName}</td> : null}
                    <td>{upload.fileName}</td>
                    <td>{upload.rowCount}</td>
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
