export type UserRole = 'admin' | 'manager' | 'sales_team'
export type TimePeriod = 'weekly' | 'monthly' | 'quarterly'

export interface User {
  id: string
  email: string
  password: string
  name: string
  firstName: string
  role: UserRole
  region: string
  zone: string
}

export interface UploadMeta {
  id: string
  userId: string
  userName: string
  fileName: string
  rowCount: number
  uploadedAt: string
}

export interface DashboardFilters {
  timePeriod: TimePeriod
  periodValue: string
  region: string
}

export interface SalesEntry {
  id: string
  userId: string
  userName: string
  uploadId: string
  uploadedAt: string
  month: string
  weekNumber: number
  date: string
  monthKey: string
  quarter: string
  weekKey: string
  region: string
  zone: string
  regionZone: string
  leadSource: string
  customerName: string
  industry: string
  contactPerson: string
  designation: string
  opportunityId: string
  opportunityName: string
  opportunityType: string
  opportunityValueInr: number
  probabilityPct: number
  weightedPipelineInr: number
  salesStage: string
  status: string
  meetingsConducted: number
  demosConducted: number
  pocsInitiated: number
  proposalSubmitted: number
  expectedCloseDate: string
  expectedCloseMonthKey: string
  expectedCloseQuarter: string
  revenueClosedInr: number
  competitor: string
  partnerName: string
  renewalUpsell: string
  nextAction: string
  remarks: string
}

export interface ParsedSalesRow {
  month: string
  weekNumber: number
  date: string
  monthKey: string
  quarter: string
  weekKey: string
  region: string
  zone: string
  regionZone: string
  leadSource: string
  customerName: string
  industry: string
  contactPerson: string
  designation: string
  opportunityId: string
  opportunityName: string
  opportunityType: string
  opportunityValueInr: number
  probabilityPct: number
  weightedPipelineInr: number
  salesStage: string
  status: string
  meetingsConducted: number
  demosConducted: number
  pocsInitiated: number
  proposalSubmitted: number
  expectedCloseDate: string
  expectedCloseMonthKey: string
  expectedCloseQuarter: string
  revenueClosedInr: number
  competitor: string
  partnerName: string
  renewalUpsell: string
  nextAction: string
  remarks: string
}

export interface DashboardData {
  entries: SalesEntry[]
  uploads: UploadMeta[]
}

export interface DashboardStats {
  totalMeetings: number
  totalDemos: number
  totalPocs: number
  totalProposals: number
  totalPipelineValue: number
  totalWeightedPipeline: number
  totalRevenueClosed: number
  winRate: number
  pocConversionRate: number
}
