import * as XLSX from 'xlsx'
import type { ParsedSalesRow } from './types'
import {
  buildWeekKey,
  getQuarterFromDate,
  getQuarterFromMonthKey,
  parseMonthLabel,
  parseRegionZone,
  toIsoDate,
} from './dateUtils'

const SHEET_NAME = 'sales_data_entry'

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function findColumnIndex(headers: string[], aliases: string[]): number {
  return headers.findIndex((header) => aliases.some((alias) => header.includes(alias)))
}

function cellText(value: unknown): string {
  if (value == null) return ''
  return String(value).trim()
}

function cellNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const cleaned = String(value ?? '')
    .replace(/[,%₹$]/g, '')
    .trim()
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

function cellPercent(value: unknown): number {
  const num = cellNumber(value)
  if (num > 0 && num <= 1) return num * 100
  return num
}

function rowIsEmpty(row: unknown[]): boolean {
  return row.every((cell) => cellText(cell) === '')
}

function sheetToMatrix(sheet: XLSX.WorkSheet): unknown[][] {
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: '',
    raw: true,
  })
}

function findDataSheet(workbook: XLSX.WorkBook): XLSX.WorkSheet | null {
  const match = workbook.SheetNames.find((name) => name.trim().toLowerCase() === SHEET_NAME)
  if (match) return workbook.Sheets[match]
  return workbook.Sheets[workbook.SheetNames[0]] ?? null
}

function parseMatrix(matrix: unknown[][]): { rows: ParsedSalesRow[]; warnings: string[] } {
  const warnings: string[] = []

  if (matrix.length < 2) {
    return { rows: [], warnings: ['Sheet must contain a header row and at least one data row.'] }
  }

  const headers = (matrix[0] ?? []).map(normalizeHeader)
  const indexes = {
    month: findColumnIndex(headers, ['month']),
    weekNumber: findColumnIndex(headers, ['week number', 'week']),
    date: findColumnIndex(headers, ['date']),
    regionZone: findColumnIndex(headers, ['region/zone', 'region zone', 'region']),
    leadSource: findColumnIndex(headers, ['lead source']),
    customerName: findColumnIndex(headers, ['customer name', 'customer']),
    industry: findColumnIndex(headers, ['industry']),
    contactPerson: findColumnIndex(headers, ['contact person']),
    designation: findColumnIndex(headers, ['designation']),
    opportunityId: findColumnIndex(headers, ['opportunity id']),
    opportunityName: findColumnIndex(headers, ['opportunity name']),
    opportunityType: findColumnIndex(headers, ['opportunity type']),
    opportunityValueInr: findColumnIndex(headers, ['opportunity value']),
    probabilityPct: findColumnIndex(headers, ['probability']),
    weightedPipelineInr: findColumnIndex(headers, ['weighted pipeline']),
    salesStage: findColumnIndex(headers, ['sales stage', 'stage']),
    status: findColumnIndex(headers, ['status']),
    meetingsConducted: findColumnIndex(headers, ['meetings conducted', 'meetings']),
    demosConducted: findColumnIndex(headers, ['demos conducted', 'demos']),
    pocsInitiated: findColumnIndex(headers, ['pocs initiated', 'poc']),
    proposalSubmitted: findColumnIndex(headers, ['proposal submitted', 'proposal']),
    expectedCloseDate: findColumnIndex(headers, ['expected close date', 'close date']),
    revenueClosedInr: findColumnIndex(headers, ['revenue closed']),
    competitor: findColumnIndex(headers, ['competitor']),
    partnerName: findColumnIndex(headers, ['partner name', 'partner']),
    renewalUpsell: findColumnIndex(headers, ['renewal/upsell', 'renewal']),
    nextAction: findColumnIndex(headers, ['next action']),
    remarks: findColumnIndex(headers, ['remarks', 'remark']),
  }

  if (indexes.customerName < 0 && indexes.opportunityId < 0) {
    warnings.push('Customer Name or Opportunity ID column not found.')
  }

  const rows: ParsedSalesRow[] = []

  for (let i = 1; i < matrix.length; i += 1) {
    const row = matrix[i] ?? []
    if (rowIsEmpty(row)) continue

    const customerName = indexes.customerName >= 0 ? cellText(row[indexes.customerName]) : ''
    const opportunityId = indexes.opportunityId >= 0 ? cellText(row[indexes.opportunityId]) : ''
    if (!customerName && !opportunityId) continue

    const month = indexes.month >= 0 ? cellText(row[indexes.month]) : ''
    const date = indexes.date >= 0 ? toIsoDate(row[indexes.date]) : ''
    const monthKey = parseMonthLabel(month) || (date ? date.slice(0, 7) : '')
    const weekNumber = indexes.weekNumber >= 0 ? cellNumber(row[indexes.weekNumber]) : 0
    const quarter = getQuarterFromMonthKey(monthKey) || getQuarterFromDate(date)
    const weekKey = buildWeekKey(monthKey, weekNumber)
    const regionZone = indexes.regionZone >= 0 ? cellText(row[indexes.regionZone]) : ''
    const regionParts = parseRegionZone(regionZone)
    const expectedCloseDate =
      indexes.expectedCloseDate >= 0 ? toIsoDate(row[indexes.expectedCloseDate]) : ''

    rows.push({
      month,
      weekNumber,
      date,
      monthKey,
      quarter,
      weekKey,
      region: regionParts.region,
      zone: regionParts.zone,
      regionZone: regionParts.regionZone,
      leadSource: indexes.leadSource >= 0 ? cellText(row[indexes.leadSource]) : '',
      customerName,
      industry: indexes.industry >= 0 ? cellText(row[indexes.industry]) : '',
      contactPerson: indexes.contactPerson >= 0 ? cellText(row[indexes.contactPerson]) : '',
      designation: indexes.designation >= 0 ? cellText(row[indexes.designation]) : '',
      opportunityId,
      opportunityName: indexes.opportunityName >= 0 ? cellText(row[indexes.opportunityName]) : '',
      opportunityType: indexes.opportunityType >= 0 ? cellText(row[indexes.opportunityType]) : '',
      opportunityValueInr:
        indexes.opportunityValueInr >= 0 ? cellNumber(row[indexes.opportunityValueInr]) : 0,
      probabilityPct: indexes.probabilityPct >= 0 ? cellPercent(row[indexes.probabilityPct]) : 0,
      weightedPipelineInr:
        indexes.weightedPipelineInr >= 0 ? cellNumber(row[indexes.weightedPipelineInr]) : 0,
      salesStage: indexes.salesStage >= 0 ? cellText(row[indexes.salesStage]) : '',
      status: indexes.status >= 0 ? cellText(row[indexes.status]) : '',
      meetingsConducted:
        indexes.meetingsConducted >= 0 ? cellNumber(row[indexes.meetingsConducted]) : 0,
      demosConducted: indexes.demosConducted >= 0 ? cellNumber(row[indexes.demosConducted]) : 0,
      pocsInitiated: indexes.pocsInitiated >= 0 ? cellNumber(row[indexes.pocsInitiated]) : 0,
      proposalSubmitted:
        indexes.proposalSubmitted >= 0 ? cellNumber(row[indexes.proposalSubmitted]) : 0,
      expectedCloseDate,
      expectedCloseMonthKey: expectedCloseDate ? expectedCloseDate.slice(0, 7) : '',
      expectedCloseQuarter: getQuarterFromDate(expectedCloseDate),
      revenueClosedInr:
        indexes.revenueClosedInr >= 0 ? cellNumber(row[indexes.revenueClosedInr]) : 0,
      competitor: indexes.competitor >= 0 ? cellText(row[indexes.competitor]) : '',
      partnerName: indexes.partnerName >= 0 ? cellText(row[indexes.partnerName]) : '',
      renewalUpsell: indexes.renewalUpsell >= 0 ? cellText(row[indexes.renewalUpsell]) : '',
      nextAction: indexes.nextAction >= 0 ? cellText(row[indexes.nextAction]) : '',
      remarks: indexes.remarks >= 0 ? cellText(row[indexes.remarks]) : '',
    })
  }

  if (rows.length === 0) {
    warnings.push('No valid rows found. Use the CyberSecurity Sales template format.')
  }

  return { rows, warnings }
}

export interface ExcelParseResult {
  rows: ParsedSalesRow[]
  warnings: string[]
}

export function parseUploadFile(file: ArrayBuffer, fileName: string): ExcelParseResult {
  const lower = fileName.toLowerCase()
  const workbook = XLSX.read(file, {
    type: 'array',
    cellDates: true,
  })

  if (lower.endsWith('.csv')) {
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    if (!sheet) return { rows: [], warnings: ['CSV file is empty.'] }
    return parseMatrix(sheetToMatrix(sheet))
  }

  const sheet = findDataSheet(workbook)
  if (!sheet) {
    return { rows: [], warnings: ['Sales_Data_Entry sheet not found in workbook.'] }
  }

  return parseMatrix(sheetToMatrix(sheet))
}
