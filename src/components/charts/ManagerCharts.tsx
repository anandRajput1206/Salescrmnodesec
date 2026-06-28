import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  achievementByEmployee,
  leaderboard,
  pocConversionByEmployee,
  regionRevenue,
  revenueByEmployee,
  topCustomersByPipeline,
  weightedPipelineByEmployee,
  winRateByEmployee,
} from '../../lib/chartUtils'
import { formatCurrency, formatPercent } from '../../lib/dateUtils'
import type { SalesEntry } from '../../lib/types'

const COLORS = ['#1d4ed8', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626']

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <article className="chart-card">
      <header>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </header>
      <div className="chart-body">{children}</div>
    </article>
  )
}

function Empty({ message }: { message: string }) {
  return <div className="empty-chart">{message}</div>
}

export function ManagerCharts({ entries }: { entries: SalesEntry[] }) {
  const revenueEmployees = revenueByEmployee(entries)
  const weightedEmployees = weightedPipelineByEmployee(entries)
  const winRates = winRateByEmployee(entries)
  const pocRates = pocConversionByEmployee(entries)
  const regionData = regionRevenue(entries)
  const topCustomers = topCustomersByPipeline(entries)
  const achievements = achievementByEmployee(entries)
  const board = leaderboard(entries)

  return (
    <>
      <ChartCard title="Revenue Closed by Employee" subtitle="Clustered column comparison">
        {revenueEmployees.length === 0 ? (
          <Empty message="No employee revenue data" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueEmployees}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => formatCurrency(Number(v))} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="value" name="Revenue Closed" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Weighted Pipeline by Employee" subtitle="Horizontal bar comparison">
        {weightedEmployees.length === 0 ? (
          <Empty message="No weighted pipeline data" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weightedEmployees} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(v) => formatCurrency(Number(v))} />
              <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="value" fill="#7c3aed" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Win Rate Comparison" subtitle="Won opportunities vs total per employee">
        {winRates.length === 0 ? (
          <Empty message="No win rate data" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={winRates}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis unit="%" />
              <Tooltip formatter={(v) => formatPercent(Number(v))} />
              <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="POC Conversion Rate" subtitle="POCs initiated vs demos conducted">
        {pocRates.length === 0 ? (
          <Empty message="No POC conversion data" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pocRates}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis unit="%" />
              <Tooltip formatter={(v) => formatPercent(Number(v))} />
              <Bar dataKey="value" fill="#0891b2" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Region-wise Revenue" subtitle="Stacked bar by region and zone">
        {regionData.data.length === 0 ? (
          <Empty message="No regional revenue data" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={regionData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="region" />
              <YAxis tickFormatter={(v) => formatCurrency(Number(v))} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              {regionData.zones.map((zone: string, index: number) => (
                <Bar key={zone} dataKey={zone} stackId="region" fill={COLORS[index % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Top Customers by Pipeline" subtitle="Highest pipeline value customers">
        {topCustomers.length === 0 ? (
          <Empty message="No customer pipeline data" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topCustomers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(v) => formatCurrency(Number(v))} />
              <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="value" fill="#d97706" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Revenue vs Weighted Pipeline" subtitle="Achievement proxy by employee">
        {achievements.length === 0 ? (
          <Empty message="No achievement data" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={achievements}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => formatCurrency(Number(v))} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue Closed" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Weighted Pipeline" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Leaderboard Ranking" subtitle="Sorted by revenue closed">
        {board.length === 0 ? (
          <Empty message="No leaderboard data" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={board} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(v) => formatCurrency(Number(v))} />
              <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="value" fill="#dc2626" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </>
  )
}
