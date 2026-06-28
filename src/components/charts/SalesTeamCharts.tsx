import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  industryPipeline,
  leadSourceDistribution,
  pipelineVsRevenueMonthly,
  salesFunnel,
  stageDistribution,
  weightedPipelineTrend,
} from '../../lib/chartUtils'
import { formatCurrency } from '../../lib/dateUtils'
import type { SalesEntry } from '../../lib/types'

const COLORS = ['#1d4ed8', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#6366f1']

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

export function SalesTeamCharts({ entries }: { entries: SalesEntry[] }) {
  const trend = pipelineVsRevenueMonthly(entries)
  const funnel = salesFunnel(entries)
  const leadSource = leadSourceDistribution(entries)
  const stages = stageDistribution(entries)
  const industries = industryPipeline(entries)
  const weightedTrend = weightedPipelineTrend(entries)

  return (
    <>
      <ChartCard title="Pipeline vs Revenue Closed" subtitle="Monthly trend line chart">
        {trend.length === 0 ? (
          <Empty message="No monthly data" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => formatCurrency(Number(v))} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Line type="monotone" dataKey="pipeline" name="Weighted Pipeline" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="revenue" name="Revenue Closed" stroke="#059669" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Sales Funnel" subtitle="Meetings → Demo → POC → Proposal → Won">
        {funnel.every((item: { count: number }) => item.count === 0) ? (
          <Empty message="No funnel data" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnel}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="stage" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Lead Source Distribution" subtitle="Pipeline value by lead source">
        {leadSource.length === 0 ? (
          <Empty message="No lead source data" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={leadSource} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={95} label>
                {leadSource.map((item: { label: string }, index: number) => (
                  <Cell key={item.label} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Opportunity Stage Distribution" subtitle="Doughnut chart by sales stage">
        {stages.length === 0 ? (
          <Empty message="No stage data" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stages} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={55} outerRadius={95} label>
                {stages.map((item: { label: string }, index: number) => (
                  <Cell key={item.label} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Industry-wise Pipeline" subtitle="Horizontal bar by industry">
        {industries.length === 0 ? (
          <Empty message="No industry data" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={industries} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(v) => formatCurrency(Number(v))} />
              <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="value" fill="#0891b2" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Weighted Pipeline Trend" subtitle="Monthly weighted pipeline trend">
        {weightedTrend.length === 0 ? (
          <Empty message="No pipeline trend data" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weightedTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(v) => formatCurrency(Number(v))} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </>
  )
}
