import type {
  DashboardData,
  ParsedSalesRow,
  SalesEntry,
  SaveUploadResult,
  UploadMeta,
  UploadStatus,
  User,
} from './types'
import { isSupabaseConfigured, supabase } from './supabase'

const INSERT_BATCH_SIZE = 100

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase is required. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env and restart the app.',
    )
  }
  return supabase
}

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function mapEntry(row: Record<string, unknown>): SalesEntry {
  return {
    id: String(row.id),
    userId: String(row.user_id ?? row.userId).trim(),
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
  const rawStatus = String(row.status ?? 'latest')
  const status: UploadStatus =
    rawStatus === 'duplicate' || rawStatus === 'previous' || rawStatus === 'latest'
      ? rawStatus
      : 'latest'

  return {
    id: String(row.id),
    userId: String(row.user_id ?? row.userId).trim(),
    userName: String(row.user_name ?? row.userName),
    fileName: String(row.file_name ?? row.fileName),
    rowCount: Number(row.row_count ?? row.rowCount ?? 0),
    uploadedAt: String(row.uploaded_at ?? row.uploadedAt),
    status,
    contentHash: String(row.content_hash ?? row.contentHash ?? ''),
  }
}

async function hashRows(rows: ParsedSalesRow[]): Promise<string> {
  const payload = JSON.stringify(rows)
  const bytes = new TextEncoder().encode(payload)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function toEntries(
  rows: ParsedSalesRow[],
  user: User,
  uploadId: string,
  uploadedAt: string,
): SalesEntry[] {
  const userId = user.id.trim()

  return rows.map((row) => ({
    id: createId('entry'),
    userId,
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

function entryToDbRow(row: SalesEntry) {
  return {
    id: row.id,
    user_id: row.userId.trim(),
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
  }
}

async function verifyUserInDatabase(user: User): Promise<void> {
  const db = requireSupabase()
  const userId = user.id.trim()

  const { data, error } = await db.from('users').select('id').eq('id', userId).maybeSingle()

  if (error) throw new Error(`Could not verify user: ${error.message}`)
  if (!data) {
    throw new Error(
      `User "${user.email}" not found in database. Add this user in Supabase users table.`,
    )
  }
}

async function deleteUserEntries(userId: string): Promise<void> {
  const db = requireSupabase()
  const trimmedId = userId.trim()

  const { error: entriesError } = await db
    .from('sales_entries')
    .delete()
    .eq('user_id', trimmedId)
  if (entriesError) throw new Error(`Delete sales_entries failed: ${entriesError.message}`)
}

async function fetchUserUploads(userId: string): Promise<UploadMeta[]> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('uploads')
    .select('*')
    .eq('user_id', userId.trim())
    .order('uploaded_at', { ascending: false })

  if (error) throw new Error(`Fetch uploads failed: ${error.message}`)
  return (data ?? []).map((row) => mapUpload(row as Record<string, unknown>))
}

async function insertEntriesInBatches(entries: SalesEntry[]): Promise<void> {
  const db = requireSupabase()
  if (entries.length === 0) return

  for (let i = 0; i < entries.length; i += INSERT_BATCH_SIZE) {
    const batch = entries.slice(i, i + INSERT_BATCH_SIZE).map(entryToDbRow)
    const { error } = await db.from('sales_entries').insert(batch)
    if (error) throw new Error(`Insert sales_entries failed: ${error.message}`)
  }
}

/** One active upload per user — the real sheet that drives dashboard charts. */
export function getActiveUploadByUser(uploads: UploadMeta[]): Map<string, UploadMeta> {
  const grouped = new Map<string, UploadMeta[]>()

  for (const upload of uploads) {
    const list = grouped.get(upload.userId) ?? []
    list.push(upload)
    grouped.set(upload.userId, list)
  }

  const activeByUser = new Map<string, UploadMeta>()

  for (const [userId, userUploads] of grouped) {
    const sorted = [...userUploads].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    )

    const latestMarked = sorted.find((upload) => upload.status === 'latest')
    if (latestMarked) {
      activeByUser.set(userId, latestMarked)
      continue
    }

    const newestReal = sorted.find((upload) => upload.status !== 'duplicate')
    if (newestReal) {
      activeByUser.set(userId, newestReal)
    }
  }

  return activeByUser
}

function filterEntriesToActiveUploads(
  entries: SalesEntry[],
  activeUploadByUser: Map<string, UploadMeta>,
): SalesEntry[] {
  return entries.filter((entry) => {
    const activeUpload = activeUploadByUser.get(entry.userId)
    return activeUpload?.id === entry.uploadId
  })
}

export async function fetchDashboardData(user: User): Promise<DashboardData> {
  const db = requireSupabase()
  const canViewAll = user.role === 'admin' || user.role === 'manager'
  const userId = user.id.trim()

  let entriesQuery = db.from('sales_entries').select('*').order('uploaded_at', { ascending: false })
  let uploadsQuery = db.from('uploads').select('*').order('uploaded_at', { ascending: false })

  if (!canViewAll) {
    entriesQuery = entriesQuery.eq('user_id', userId)
    uploadsQuery = uploadsQuery.eq('user_id', userId)
  }

  const [entriesRes, uploadsRes] = await Promise.all([entriesQuery, uploadsQuery])

  if (entriesRes.error) throw new Error(`Fetch sales_entries failed: ${entriesRes.error.message}`)
  if (uploadsRes.error) throw new Error(`Fetch uploads failed: ${uploadsRes.error.message}`)

  const uploads = (uploadsRes.data ?? []).map((row) => mapUpload(row as Record<string, unknown>))
  const allEntries = (entriesRes.data ?? []).map((row) => mapEntry(row as Record<string, unknown>))
  const activeUploadByUser = getActiveUploadByUser(uploads)
  const entries = filterEntriesToActiveUploads(allEntries, activeUploadByUser)

  return { entries, uploads }
}

export async function saveUpload(
  user: User,
  fileName: string,
  rows: ParsedSalesRow[],
): Promise<SaveUploadResult> {
  const db = requireSupabase()
  const uploadedAt = new Date().toISOString()
  const uploadId = createId('upload')
  const entries = toEntries(rows, user, uploadId, uploadedAt)
  const userId = user.id.trim()
  const contentHash = await hashRows(rows)

  await verifyUserInDatabase(user)

  const existingUploads = await fetchUserUploads(userId)
  const isDuplicate = existingUploads.some((upload) => upload.contentHash === contentHash)
  const status: UploadStatus = isDuplicate ? 'duplicate' : 'latest'

  const upload: UploadMeta = {
    id: uploadId,
    userId,
    userName: user.name,
    fileName,
    rowCount: entries.length,
    uploadedAt,
    status,
    contentHash,
  }

  if (!isDuplicate) {
    const { error: demoteError } = await db
      .from('uploads')
      .update({ status: 'previous' })
      .eq('user_id', userId)
      .eq('status', 'latest')

    if (demoteError) {
      throw new Error(`Could not update previous uploads: ${demoteError.message}`)
    }

    await deleteUserEntries(userId)
  }

  const { error: uploadError } = await db.from('uploads').insert({
    id: upload.id,
    user_id: upload.userId,
    user_name: upload.userName,
    file_name: upload.fileName,
    row_count: upload.rowCount,
    status: upload.status,
    content_hash: upload.contentHash,
    uploaded_at: upload.uploadedAt,
  })

  if (uploadError) {
    throw new Error(
      uploadError.code === '23503'
        ? `Upload failed: user "${user.email}" not linked in users table.`
        : uploadError.message.includes('content_hash') || uploadError.message.includes('status')
          ? 'Upload columns missing. Run supabase/add_upload_status.sql in Supabase SQL Editor.'
          : `Upload failed: ${uploadError.message}`,
    )
  }

  if (!isDuplicate) {
    await insertEntriesInBatches(entries)
  }

  return {
    upload,
    isDuplicate,
    message: isDuplicate
      ? 'Duplicate sheet detected. Saved to history only — your dashboard still uses the latest real sheet.'
      : 'Latest real sheet saved and applied to your dashboard.',
  }
}
