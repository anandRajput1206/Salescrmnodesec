import { format, isValid, parseISO } from 'date-fns'

const MONTH_MAP: Record<string, string> = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
}

export function parseMonthLabel(value: string): string {
  const text = value.trim().toLowerCase()
  if (!text) return ''

  for (const [name, num] of Object.entries(MONTH_MAP)) {
    if (text.includes(name)) {
      const yearMatch = text.match(/\d{4}/)
      const year = yearMatch ? yearMatch[0] : String(new Date().getFullYear())
      return `${year}-${num}`
    }
  }

  return ''
}

export function getQuarterFromDate(isoDate: string): string {
  if (!isoDate) return ''
  const date = parseISO(isoDate)
  if (!isValid(date)) return ''
  const quarter = Math.floor(date.getMonth() / 3) + 1
  return `${date.getFullYear()}-Q${quarter}`
}

export function getQuarterFromMonthKey(monthKey: string): string {
  if (!monthKey) return ''
  const [year, month] = monthKey.split('-').map(Number)
  if (!year || !month) return ''
  const quarter = Math.ceil(month / 3)
  return `${year}-Q${quarter}`
}

export function buildWeekKey(monthKey: string, weekNumber: number): string {
  if (!monthKey || !weekNumber) return ''
  return `${monthKey}-W${String(weekNumber).padStart(2, '0')}`
}

export function parseRegionZone(value: string): { region: string; zone: string; regionZone: string } {
  const text = value.trim()
  if (!text) return { region: '', zone: '', regionZone: '' }

  const parts = text.split('/').map((part) => part.trim())
  return {
    region: parts[0] ?? '',
    zone: parts[1] ?? '',
    regionZone: text,
  }
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  if (!year || !month) return monthKey
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`
  return `₹${Math.round(value).toLocaleString('en-IN')}`
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function excelSerialToDate(serial: number): Date {
  const utcDays = Math.floor(serial - 25569)
  return new Date(utcDays * 86400 * 1000)
}

export function parseCellDate(value: unknown): Date | null {
  if (value == null || value === '') return null
  if (value instanceof Date && isValid(value)) return value

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = excelSerialToDate(value)
    return isValid(parsed) ? parsed : null
  }

  const text = String(value).trim()
  if (!text) return null

  const isoCandidate = parseISO(text)
  if (isValid(isoCandidate)) return isoCandidate

  const fallback = new Date(text)
  return isValid(fallback) ? fallback : null
}

export function toIsoDate(value: unknown): string {
  const parsed = parseCellDate(value)
  return parsed ? format(parsed, 'yyyy-MM-dd') : ''
}

export function roleLabel(role: string): string {
  if (role === 'admin') return 'Admin'
  if (role === 'manager') return 'Manager'
  return 'Sales Team'
}
