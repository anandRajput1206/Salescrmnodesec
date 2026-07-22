import type { User, UserRole } from './types'
import { isSupabaseConfigured, supabase } from './supabase'

const SESSION_KEY = 'crm-dashboard-session'

export function mapUserFromDb(row: Record<string, unknown>): User {
  return {
    id: String(row.id ?? '').trim(),
    email: String(row.email ?? '').trim().toLowerCase(),
    name: String(row.name ?? '').trim(),
    firstName: String(row.first_name ?? row.firstName ?? '').trim(),
    role: String(row.role ?? 'sales_team') as UserRole,
    region: String(row.region ?? '').trim(),
    zone: String(row.zone ?? '').trim(),
  }
}

/** Exact id stored in Postgres — may include stray whitespace until fix_users.sql is run. */
export function dbUserIdFromRow(row: Record<string, unknown>): string {
  return String(row.id ?? '')
}

export interface ResolvedUser {
  user: User
  dbUserId: string
}

function mapResolvedUser(row: Record<string, unknown>): ResolvedUser {
  return {
    user: mapUserFromDb(row),
    dbUserId: dbUserIdFromRow(row),
  }
}

export async function fetchUserById(userId: string): Promise<ResolvedUser | null> {
  if (!supabase) return null

  const trimmedId = userId.trim()
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, first_name, role, region, zone')
    .eq('id', trimmedId)
    .maybeSingle()

  if (!error && data) return mapResolvedUser(data as Record<string, unknown>)

  const { data: allMatches, error: listError } = await supabase
    .from('users')
    .select('id, email, name, first_name, role, region, zone')

  if (listError || !allMatches) return null

  const match = allMatches.find((row) => String(row.id ?? '').trim() === trimmedId)
  return match ? mapResolvedUser(match as Record<string, unknown>) : null
}

export async function fetchUserByEmail(email: string): Promise<ResolvedUser | null> {
  if (!supabase) return null

  const normalizedEmail = email.trim().toLowerCase()
  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, first_name, role, region, zone')
    .ilike('email', normalizedEmail)
    .maybeSingle()

  if (error || !data) return null
  return mapResolvedUser(data as Record<string, unknown>)
}

export async function resolveUserRecord(user: User): Promise<ResolvedUser | null> {
  const byEmail = await fetchUserByEmail(user.email)
  if (byEmail) return byEmail
  return fetchUserById(user.id)
}

export async function fetchUserByCredentials(
  email: string,
  password: string,
): Promise<User | null> {
  if (!supabase) return null

  const normalizedEmail = email.trim().toLowerCase()

  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, first_name, role, region, zone')
    .ilike('email', normalizedEmail)
    .eq('password', password)
    .maybeSingle()

  if (error) {
    console.error('Supabase auth error:', error.message)
    throw new Error(`Database login failed: ${error.message}`)
  }

  if (!data) return null
  return mapUserFromDb(data as Record<string, unknown>)
}

export async function fetchAllUsers(): Promise<User[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, first_name, role, region, zone')
    .order('name')

  if (error) throw new Error(`Fetch users failed: ${error.message}`)
  return (data ?? []).map((row) => mapUserFromDb(row as Record<string, unknown>))
}

export async function authenticate(email: string, password: string): Promise<User | null> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env')
  }

  return fetchUserByCredentials(email, password)
}

export async function refreshSessionUser(sessionUser: User): Promise<User | null> {
  const resolved = await resolveUserRecord(sessionUser)
  return resolved?.user ?? null
}

export function saveSession(user: User): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function loadSession(): User | null {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as User
    return {
      ...parsed,
      id: parsed.id.trim(),
      email: parsed.email.trim().toLowerCase(),
    }
  } catch {
    return null
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function canUpload(user: User): boolean {
  return user.role === 'sales_team' || user.role === 'manager' || user.role === 'admin'
}

export function canViewAllData(user: User): boolean {
  return user.role === 'admin' || user.role === 'manager'
}

export function canManageUploads(user: User): boolean {
  return user.role === 'admin' || user.role === 'manager'
}
