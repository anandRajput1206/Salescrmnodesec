import type { DashboardData, ParsedSalesRow, SalesEntry, UploadMeta, User } from './types'
import { isSupabaseConfigured, supabase } from './supabase'

const ENTRIES_KEY = 'crm-sales-entries'
const UPLOADS_KEY = 'crm-uploads'

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function readLocal<T>(key: string): T[] {
  const raw = localStorage.getItem(key)
  if (!raw) return []
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function writeLocal<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value))
}

function mapEntry(row: Record<string, unknown>): SalesEntry {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? row.userId),
    userName: String(row.user_name ?? row.userName),
    uploadId: String(row.upload_id ?? row.uploadId),
    uploadedAt: String(row.uploaded_at ?? row.uploadedAt),
    month: String(row.month ?? ''),
    weekNumber: Number(row.week_number ?? row.weekNumber ?? 0),
    date: row.date ? String(row.date).slice(0, 10) : '',
    monthKey: String(row.month_key ?? row.monthKey ?? ''),
    quarter: String(row.quarter ?? ''),
    weekKey: String(row.week_key ?? row.weekKey ?? ''),
    region: String(row.region ?? ''),
    zone: String(row.zone ?? ''),
    regionZone: String(row.region_zone ?? row.regionZone ?? ''),
    leadSource: String(row.lead_source ?? row.leadSource ?? ''),
    customerName: String(row.customer_name ?? row.customerName ?? ''),
    industry: String(row.industry ?? ''),
    contactPerson: String(row.contact_person ?? row.contactPerson ?? ''),
    designation: String(row.designation ?? ''),
    opportunityId: String(row.opportunity_id ?? row.opportunityId ?? ''),
    opportunityName: String(row.opportunity_name ?? row.opportunityName ?? ''),
    opportunityType: String(row.opportunity_type ?? row.opportunityType ?? ''),
    opportunityValueInr: Number(row.opportunity_value_inr ?? row.opportunityValueInr ?? 0),
    probabilityPct: Number(row.probability_pct ?? row.probabilityPct ?? 0),
    weightedPipelineInr: Number(row.weighted_pipeline_inr ?? row.weightedPipelineInr ?? 0),
    salesStage: String(row.sales_stage ?? row.salesStage ?? ''),
    status: String(row.status ?? ''),
    meetingsConducted: Number(row.meetings_conducted ?? row.meetingsConducted ?? 0),
    demosConducted: Number(row.demos_conducted ?? row.demosConducted ?? 0),
    pocsInitiated: Number(row.pocs_initiated ?? row.pocsInitiated ?? 0),
    proposalSubmitted: Number(row.proposal_submitted ?? row.proposalSubmitted ?? 0),
    expectedCloseDate: row.expected_close_date
      ? String(row.expected_close_date).slice(0, 10)
      : '',
    expectedCloseMonthKey: String(
      row.expected_close_month_key ?? row.expectedCloseMonthKey ?? '',
    ),
    expectedCloseQuarter: String(
      row.expected_close_quarter ?? row.expectedCloseQuarter ?? '',
    ),
    revenueClosedInr: Number(row.revenue_closed_inr ?? row.revenueClosedInr ?? 0),
    competitor: String(row.competitor ?? ''),
    partnerName: String(row.partner_name ?? row.partnerName ?? ''),
    renewalUpsell: String(row.renewal_upsell ?? row.renewalUpsell ?? ''),
    nextAction: String(row.next_action ?? row.nextAction ?? ''),
    remarks: String(row.remarks ?? ''),
  }
}

function mapUpload(row: Record<string, unknown>): UploadMeta {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? row.userId),
    userName: String(row.user_name ?? row.userName),
    fileName: String(row.file_name ?? row.fileName),
    rowCount: Number(row.row_count ?? row.rowCount ?? 0),
    uploadedAt: String(row.uploaded_at ?? row.uploadedAt),
  }
}

function toEntries(
  rows: ParsedSalesRow[],
  user: User,
  uploadId: string,
  uploadedAt: string,
): SalesEntry[] {
  return rows.map((row) => ({
    id: createId('entry'),
    userId: user.id,
    userName: user.name,
    uploadId,
    uploadedAt,
    month: row.month,
    weekNumber: row.weekNumber,
    date: row.date,
    monthKey: row.monthKey,
    quarter: row.quarter,
    weekKey: row.weekKey,
    region: row.region || user.region,
    zone: row.zone || user.zone,
    regionZone: row.regionZone,
    leadSource: row.leadSource,
    customerName: row.customerName,
    industry: row.industry,
    contactPerson: row.contactPerson,
    designation: row.designation,
    opportunityId: row.opportunityId,
    opportunityName: row.opportunityName,
    opportunityType: row.opportunityType,
    opportunityValueInr: row.opportunityValueInr,
    probabilityPct: row.probabilityPct,
    weightedPipelineInr: row.weightedPipelineInr,
    salesStage: row.salesStage,
    status: row.status,
    meetingsConducted: row.meetingsConducted,
    demosConducted: row.demosConducted,
    pocsInitiated: row.pocsInitiated,
    proposalSubmitted: row.proposalSubmitted,
    expectedCloseDate: row.expectedCloseDate,
    expectedCloseMonthKey: row.expectedCloseMonthKey,
    expectedCloseQuarter: row.expectedCloseQuarter,
    revenueClosedInr: row.revenueClosedInr,
    competitor: row.competitor,
    partnerName: row.partnerName,
    renewalUpsell: row.renewalUpsell,
    nextAction: row.nextAction,
    remarks: row.remarks,
  }))
}

async function deleteUserData(userId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.from('sales_entries').delete().eq('user_id', userId)
    await supabase.from('uploads').delete().eq('user_id', userId)
    return
  }

  writeLocal(
    ENTRIES_KEY,
    readLocal<SalesEntry>(ENTRIES_KEY).filter((row) => row.userId !== userId),
  )
  writeLocal(
    UPLOADS_KEY,
    readLocal<UploadMeta>(UPLOADS_KEY).filter((row) => row.userId !== userId),
  )
}

export async function fetchDashboardData(user: User): Promise<DashboardData> {
  const canViewAll = user.role === 'admin' || user.role === 'manager'

  if (isSupabaseConfigured && supabase) {
    let entriesQuery = supabase.from('sales_entries').select('*').order('date', { ascending: true })
    let uploadsQuery = supabase.from('uploads').select('*').order('uploaded_at', { ascending: false })

    if (!canViewAll) {
      entriesQuery = entriesQuery.eq('user_id', user.id)
      uploadsQuery = uploadsQuery.eq('user_id', user.id)
    }

    const [entriesRes, uploadsRes] = await Promise.all([entriesQuery, uploadsQuery])

    if (entriesRes.error) throw new Error(entriesRes.error.message)
    if (uploadsRes.error) throw new Error(uploadsRes.error.message)

    return {
      entries: (entriesRes.data ?? []).map((row) => mapEntry(row as Record<string, unknown>)),
      uploads: (uploadsRes.data ?? []).map((row) => mapUpload(row as Record<string, unknown>)),
    }
  }

  const allEntries = readLocal<SalesEntry>(ENTRIES_KEY)
  const allUploads = readLocal<UploadMeta>(UPLOADS_KEY)

  return {
    entries: canViewAll ? allEntries : allEntries.filter((row) => row.userId === user.id),
    uploads: canViewAll ? allUploads : allUploads.filter((row) => row.userId === user.id),
  }
}

export async function saveUpload(
  user: User,
  fileName: string,
  rows: ParsedSalesRow[],
): Promise<UploadMeta> {
  const uploadedAt = new Date().toISOString()
  const uploadId = createId('upload')
  const entries = toEntries(rows, user, uploadId, uploadedAt)

  const upload: UploadMeta = {
    id: uploadId,
    userId: user.id,
    userName: user.name,
    fileName,
    rowCount: entries.length,
    uploadedAt,
  }

  await deleteUserData(user.id)

  if (isSupabaseConfigured && supabase) {
    const { error: uploadError } = await supabase.from('uploads').insert({
      id: upload.id,
      user_id: upload.userId,
      user_name: upload.userName,
      file_name: upload.fileName,
      row_count: upload.rowCount,
      uploaded_at: upload.uploadedAt,
    })
    if (uploadError) throw new Error(uploadError.message)

    if (entries.length > 0) {
      const { error } = await supabase.from('sales_entries').insert(
        entries.map((row) => ({
          id: row.id,
          user_id: row.userId,
          user_name: row.userName,
          upload_id: row.uploadId,
          uploaded_at: row.uploadedAt,
          month: row.month,
          week_number: row.weekNumber,
          date: row.date || null,
          month_key: row.monthKey,
          quarter: row.quarter,
          week_key: row.weekKey,
          region: row.region,
          zone: row.zone,
          region_zone: row.regionZone,
          lead_source: row.leadSource,
          customer_name: row.customerName,
          industry: row.industry,
          contact_person: row.contactPerson,
          designation: row.designation,
          opportunity_id: row.opportunityId,
          opportunity_name: row.opportunityName,
          opportunity_type: row.opportunityType,
          opportunity_value_inr: row.opportunityValueInr,
          probability_pct: row.probabilityPct,
          weighted_pipeline_inr: row.weightedPipelineInr,
          sales_stage: row.salesStage,
          status: row.status,
          meetings_conducted: row.meetingsConducted,
          demos_conducted: row.demosConducted,
          pocs_initiated: row.pocsInitiated,
          proposal_submitted: row.proposalSubmitted,
          expected_close_date: row.expectedCloseDate || null,
          expected_close_month_key: row.expectedCloseMonthKey,
          expected_close_quarter: row.expectedCloseQuarter,
          revenue_closed_inr: row.revenueClosedInr,
          competitor: row.competitor,
          partner_name: row.partnerName,
          renewal_upsell: row.renewalUpsell,
          next_action: row.nextAction,
          remarks: row.remarks,
        })),
      )
      if (error) throw new Error(error.message)
    }

    return upload
  }

  const otherEntries = readLocal<SalesEntry>(ENTRIES_KEY).filter((row) => row.userId !== user.id)
  const otherUploads = readLocal<UploadMeta>(UPLOADS_KEY).filter((row) => row.userId !== user.id)
  writeLocal(ENTRIES_KEY, [...otherEntries, ...entries])
  writeLocal(UPLOADS_KEY, [upload, ...otherUploads])
  return upload
}

export function getStorageMode(): 'supabase' | 'local' {
  return isSupabaseConfigured ? 'supabase' : 'local'
}
