import * as XLSX from 'xlsx'
import type { UploadMeta } from './types'
import { supabase } from './supabase'

export const SHEET_BUCKET = 'sales-sheets'

export function safeFileName(fileName: string): string {
  const cleaned = fileName.replace(/[\\/:*?"<>|]+/g, '_').trim()
  return cleaned || 'sales-sheet.xlsx'
}

export function buildStoragePath(userId: string, uploadId: string, fileName: string): string {
  return `${userId.trim()}/${uploadId}/${safeFileName(fileName)}`
}

function triggerBrowserDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = safeFileName(fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function archiveSheetFile(
  storagePath: string,
  file: File,
): Promise<{ saved: boolean; warning: string }> {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { error } = await supabase.storage.from(SHEET_BUCKET).upload(storagePath, file, {
    upsert: true,
    contentType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  if (!error) return { saved: true, warning: '' }

  const message = error.message.toLowerCase()
  const archiveMissing =
    message.includes('bucket') ||
    message.includes('not found') ||
    message.includes('storage_path') ||
    message.includes('row-level security') ||
    message.includes('policy')

  if (archiveMissing) {
    return {
      saved: false,
      warning:
        'Dashboard data was saved, but the original Excel file was not archived. Run supabase/add_sheet_storage.sql in the Supabase SQL Editor, then upload again.',
    }
  }

  throw new Error(`Could not save the original Excel file: ${error.message}`)
}

export async function removeArchivedSheet(storagePath: string): Promise<void> {
  if (!supabase || !storagePath) return
  await supabase.storage.from(SHEET_BUCKET).remove([storagePath])
}

function sheetFromEntries(entries: Record<string, string | number>[]): Blob {
  const headers = [
    'Month',
    'Week Number',
    'Date',
    'Region/Zone',
    'Lead Source',
    'Customer Name',
    'Industry',
    'Contact Person',
    'Designation',
    'Opportunity ID',
    'Opportunity Name',
    'Opportunity Type',
    'Opportunity Value (INR)',
    'Probability (%)',
    'Weighted Pipeline (INR)',
    'Sales Stage',
    'Status',
    'Meetings Conducted',
    'Demos Conducted',
    'POCs Initiated',
    'Proposal Submitted',
    'Expected Close Date',
    'Revenue Closed (INR)',
    'Competitor',
    'Partner Name',
    'Renewal/Upsell',
    'Next Action',
    'Remarks',
  ]

  const rows = entries.map((entry) => [
    entry.month,
    entry.weekNumber,
    entry.date,
    entry.regionZone,
    entry.leadSource,
    entry.customerName,
    entry.industry,
    entry.contactPerson,
    entry.designation,
    entry.opportunityId,
    entry.opportunityName,
    entry.opportunityType,
    entry.opportunityValueInr,
    entry.probabilityPct,
    entry.weightedPipelineInr,
    entry.salesStage,
    entry.status,
    entry.meetingsConducted,
    entry.demosConducted,
    entry.pocsInitiated,
    entry.proposalSubmitted,
    entry.expectedCloseDate,
    entry.revenueClosedInr,
    entry.competitor,
    entry.partnerName,
    entry.renewalUpsell,
    entry.nextAction,
    entry.remarks,
  ])

  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sales_Data_Entry')
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export async function downloadUploadSheet(upload: UploadMeta): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')

  if (upload.storagePath) {
    const { data, error } = await supabase.storage.from(SHEET_BUCKET).download(upload.storagePath)
    if (!error && data) {
      triggerBrowserDownload(data, upload.fileName)
      return
    }
  }

  const { data, error } = await supabase
    .from('sales_entries')
    .select('*')
    .eq('upload_id', upload.id)
    .order('date', { ascending: true })

  if (error) throw new Error(`Could not load sheet rows: ${error.message}`)

  const entries = (data ?? []) as Record<string, unknown>[]
  if (entries.length === 0) {
    throw new Error(
      'This upload has no saved Excel file. New uploads are archived after you run supabase/add_sheet_storage.sql.',
    )
  }

  const mapped = entries.map((row) => ({
    month: String(row.month ?? ''),
    weekNumber: Number(row.week_number ?? 0),
    date: row.date ? String(row.date).slice(0, 10) : '',
    regionZone:
      String(row.region_zone ?? '') ||
      [String(row.region ?? ''), String(row.zone ?? '')].filter(Boolean).join(' / '),
    leadSource: String(row.lead_source ?? ''),
    customerName: String(row.customer_name ?? ''),
    industry: String(row.industry ?? ''),
    contactPerson: String(row.contact_person ?? ''),
    designation: String(row.designation ?? ''),
    opportunityId: String(row.opportunity_id ?? ''),
    opportunityName: String(row.opportunity_name ?? ''),
    opportunityType: String(row.opportunity_type ?? ''),
    opportunityValueInr: Number(row.opportunity_value_inr ?? 0),
    probabilityPct: Number(row.probability_pct ?? 0),
    weightedPipelineInr: Number(row.weighted_pipeline_inr ?? 0),
    salesStage: String(row.sales_stage ?? ''),
    status: String(row.status ?? ''),
    meetingsConducted: Number(row.meetings_conducted ?? 0),
    demosConducted: Number(row.demos_conducted ?? 0),
    pocsInitiated: Number(row.pocs_initiated ?? 0),
    proposalSubmitted: Number(row.proposal_submitted ?? 0),
    expectedCloseDate: row.expected_close_date ? String(row.expected_close_date).slice(0, 10) : '',
    revenueClosedInr: Number(row.revenue_closed_inr ?? 0),
    competitor: String(row.competitor ?? ''),
    partnerName: String(row.partner_name ?? ''),
    renewalUpsell: String(row.renewal_upsell ?? ''),
    nextAction: String(row.next_action ?? ''),
    remarks: String(row.remarks ?? ''),
  }))

  const downloadName = upload.fileName.toLowerCase().endsWith('.csv')
    ? upload.fileName.replace(/\.csv$/i, '.xlsx')
    : upload.fileName
  triggerBrowserDownload(sheetFromEntries(mapped), downloadName)
}
