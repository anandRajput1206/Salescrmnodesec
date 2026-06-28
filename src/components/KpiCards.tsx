import { formatCurrency, formatPercent } from '../lib/dateUtils'
import type { DashboardStats } from '../lib/types'

export function KpiCards({ stats }: { stats: DashboardStats }) {
  return (
    <section className="stats-grid">
      <article className="stat-card">
        <span>Meetings Conducted</span>
        <strong>{stats.totalMeetings}</strong>
      </article>
      <article className="stat-card">
        <span>Demos Conducted</span>
        <strong>{stats.totalDemos}</strong>
      </article>
      <article className="stat-card">
        <span>Pipeline Value</span>
        <strong>{formatCurrency(stats.totalPipelineValue)}</strong>
      </article>
      <article className="stat-card">
        <span>Weighted Pipeline</span>
        <strong>{formatCurrency(stats.totalWeightedPipeline)}</strong>
      </article>
      <article className="stat-card">
        <span>Revenue Closed</span>
        <strong>{formatCurrency(stats.totalRevenueClosed)}</strong>
      </article>
      <article className="stat-card">
        <span>Win Rate</span>
        <strong>{formatPercent(stats.winRate)}</strong>
      </article>
    </section>
  )
}
