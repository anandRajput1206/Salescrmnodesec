import type { DashboardFilters, DashboardStats, SalesEntry } from './types'
import { formatMonthLabel } from './dateUtils'

/** Closed Won / Won opportunities — excludes Lost */
export function isWonOpportunity(entry: SalesEntry): boolean {
  const status = entry.status.toLowerCase().trim()
  const stage = entry.salesStage.toLowerCase().trim()

  if (status.includes('lost') || stage.includes('lost')) return false
  if (status.includes('won') || stage.includes('won')) return true

  // Revenue closed with a closed status counts as won
  if (entry.revenueClosedInr > 0 && (status.includes('closed') || stage.includes('closed'))) {
    return true
  }

  return false
}

export function filterEntries(entries: SalesEntry[], filters: DashboardFilters): SalesEntry[] {
  return entries.filter((entry) => {
    const regionMatch =
      filters.region === 'all' ||
      entry.region.toLowerCase() === filters.region.toLowerCase()

    const employeeMatch =
      filters.employeeId === 'all' || entry.userId === filters.employeeId

    if (!regionMatch || !employeeMatch) return false
    if (filters.periodValue === 'all') return true

    if (filters.timePeriod === 'weekly') {
      return entry.weekKey === filters.periodValue
    }
    if (filters.timePeriod === 'monthly') {
      return entry.monthKey === filters.periodValue
    }
    return entry.quarter === filters.periodValue
  })
}

export function getPeriodOptions(
  entries: SalesEntry[],
  timePeriod: DashboardFilters['timePeriod'],
): string[] {
  const values = new Set<string>()

  entries.forEach((entry) => {
    if (timePeriod === 'weekly' && entry.weekKey) values.add(entry.weekKey)
    if (timePeriod === 'monthly' && entry.monthKey) values.add(entry.monthKey)
    if (timePeriod === 'quarterly' && entry.quarter) values.add(entry.quarter)
  })

  return Array.from(values).sort()
}

export function getRegionOptions(entries: SalesEntry[]): string[] {
  const values = new Set(entries.map((entry) => entry.region).filter(Boolean))
  return Array.from(values).sort()
}

export function formatPeriodLabel(value: string, timePeriod: DashboardFilters['timePeriod']): string {
  if (value === 'all') return 'All periods'
  if (timePeriod === 'monthly') return formatMonthLabel(value)
  if (timePeriod === 'quarterly') return value.replace('-Q', ' Q')
  return value.replace('-W', ' Week ')
}

export function getDashboardStats(entries: SalesEntry[]): DashboardStats {
  const totalDemos = entries.reduce((sum, row) => sum + row.demosConducted, 0)
  const totalPocs = entries.reduce((sum, row) => sum + row.pocsInitiated, 0)
  const wonCount = entries.filter(isWonOpportunity).length

  return {
    totalMeetings: entries.reduce((sum, row) => sum + row.meetingsConducted, 0),
    totalDemos,
    totalPocs,
    totalProposals: entries.reduce((sum, row) => sum + row.proposalSubmitted, 0),
    totalPipelineValue: entries.reduce((sum, row) => sum + row.opportunityValueInr, 0),
    totalWeightedPipeline: entries.reduce((sum, row) => sum + row.weightedPipelineInr, 0),
    totalRevenueClosed: entries.reduce((sum, row) => sum + row.revenueClosedInr, 0),
    winRate: entries.length ? (wonCount / entries.length) * 100 : 0,
    pocConversionRate: totalDemos ? (totalPocs / totalDemos) * 100 : 0,
  }
}

function groupSumBy(
  entries: SalesEntry[],
  keyFn: (entry: SalesEntry) => string,
  valueFn: (entry: SalesEntry) => number,
): Array<{ label: string; value: number }> {
  const map = new Map<string, number>()
  entries.forEach((entry) => {
    const key = keyFn(entry).trim() || 'Unknown'
    map.set(key, (map.get(key) ?? 0) + valueFn(entry))
  })
  return Array.from(map.entries()).map(([label, value]) => ({ label, value }))
}

export function pipelineVsRevenueMonthly(entries: SalesEntry[]) {
  const map = new Map<string, { pipeline: number; revenue: number }>()
  entries.forEach((entry) => {
    const key = entry.monthKey || 'Unknown'
    const current = map.get(key) ?? { pipeline: 0, revenue: 0 }
    current.pipeline += entry.weightedPipelineInr
    current.revenue += entry.revenueClosedInr
    map.set(key, current)
  })
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      label: key === 'Unknown' ? 'Unknown' : formatMonthLabel(key),
      pipeline: value.pipeline,
      revenue: value.revenue,
    }))
}

/** Funnel: Lead (opportunities) → Demo → POC → Proposal → Won */
export function salesFunnel(entries: SalesEntry[]) {
  return [
    { stage: 'Lead', count: entries.length },
    { stage: 'Demo', count: entries.reduce((s, r) => s + r.demosConducted, 0) },
    { stage: 'POC', count: entries.reduce((s, r) => s + r.pocsInitiated, 0) },
    { stage: 'Proposal', count: entries.reduce((s, r) => s + r.proposalSubmitted, 0) },
    { stage: 'Won', count: entries.filter(isWonOpportunity).length },
  ]
}

export function leadSourceDistribution(entries: SalesEntry[]) {
  return groupSumBy(entries, (e) => e.leadSource, (e) => e.opportunityValueInr)
    .sort((a, b) => b.value - a.value)
}

export function stageDistribution(entries: SalesEntry[]) {
  return groupSumBy(entries, (e) => e.salesStage, () => 1).sort((a, b) => b.value - a.value)
}

export function partnerCompanyPipeline(entries: SalesEntry[]) {
  return groupSumBy(
    entries.filter((entry) => (entry.partnerCompany || entry.partnerName).trim()),
    (entry) => entry.partnerCompany || entry.partnerName,
    (entry) => entry.opportunityValueInr,
  )
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
}

export function industryPipeline(entries: SalesEntry[]) {
  return groupSumBy(entries, (e) => e.industry, (e) => e.opportunityValueInr)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
}

export function weightedPipelineTrend(entries: SalesEntry[]) {
  const map = new Map<string, number>()
  entries.forEach((entry) => {
    const key = entry.monthKey || 'Unknown'
    map.set(key, (map.get(key) ?? 0) + entry.weightedPipelineInr)
  })
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({
      label: key === 'Unknown' ? 'Unknown' : formatMonthLabel(key),
      value,
    }))
}

export function revenueByEmployee(entries: SalesEntry[]) {
  return groupSumBy(entries, (e) => e.userName, (e) => e.revenueClosedInr).sort(
    (a, b) => b.value - a.value,
  )
}

export function weightedPipelineByEmployee(entries: SalesEntry[]) {
  return groupSumBy(entries, (e) => e.userName, (e) => e.weightedPipelineInr).sort(
    (a, b) => b.value - a.value,
  )
}

export function winRateByEmployee(entries: SalesEntry[]) {
  const map = new Map<string, { total: number; won: number }>()
  entries.forEach((entry) => {
    const current = map.get(entry.userName) ?? { total: 0, won: 0 }
    current.total += 1
    if (isWonOpportunity(entry)) current.won += 1
    map.set(entry.userName, current)
  })
  return Array.from(map.entries())
    .map(([label, value]) => ({
      label,
      value: value.total ? (value.won / value.total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)
}

export function pocConversionByEmployee(entries: SalesEntry[]) {
  const map = new Map<string, { demos: number; pocs: number }>()
  entries.forEach((entry) => {
    const current = map.get(entry.userName) ?? { demos: 0, pocs: 0 }
    current.demos += entry.demosConducted
    current.pocs += entry.pocsInitiated
    map.set(entry.userName, current)
  })
  return Array.from(map.entries())
    .map(([label, value]) => ({
      label,
      value: value.demos ? (value.pocs / value.demos) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value)
}

export function regionRevenue(entries: SalesEntry[]) {
  const map = new Map<string, Map<string, number>>()
  entries.forEach((entry) => {
    const region = entry.region || 'Unknown'
    if (!map.has(region)) map.set(region, new Map())
    const zoneMap = map.get(region)!
    const zone = entry.zone || 'Unknown'
    zoneMap.set(zone, (zoneMap.get(zone) ?? 0) + entry.revenueClosedInr)
  })

  const zones = new Set<string>()
  map.forEach((zoneMap) => zoneMap.forEach((_, zone) => zones.add(zone)))

  return {
    zones: Array.from(zones).sort(),
    data: Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([region, zoneMap]) => {
        const row: Record<string, string | number> = { region }
        zones.forEach((zone) => {
          row[zone] = zoneMap.get(zone) ?? 0
        })
        return row
      }),
  }
}

export function topCustomersByPipeline(entries: SalesEntry[]) {
  return groupSumBy(entries, (e) => e.customerName, (e) => e.opportunityValueInr)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)
}

/** Target vs Achievement: Revenue Closed vs Opportunity Value (pipeline target proxy) */
export function achievementByEmployee(entries: SalesEntry[]) {
  const map = new Map<string, { revenue: number; target: number }>()
  entries.forEach((entry) => {
    const current = map.get(entry.userName) ?? { revenue: 0, target: 0 }
    current.revenue += entry.revenueClosedInr
    current.target += entry.opportunityValueInr
    map.set(entry.userName, current)
  })
  return Array.from(map.entries())
    .map(([label, value]) => ({
      label,
      revenue: value.revenue,
      target: value.target,
      achievement: value.target ? (value.revenue / value.target) * 100 : 0,
    }))
    .sort((a, b) => b.achievement - a.achievement)
}

export function leaderboard(entries: SalesEntry[]) {
  return revenueByEmployee(entries)
}
