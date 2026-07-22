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

export async function fetchUserById(userId: string): Promise<User | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, first_name, role, region, zone')
    .eq('id', userId.trim())
    .maybeSingle()

  if (error || !data) return null
  return mapUserFromDb(data as Record<string, unknown>)
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
  return fetchUserById(sessionUser.id)
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
  return user.role === 'sales_team'
}

export function canViewAllData(user: User): boolean {
  return user.role === 'admin' || user.role === 'manager'
}

export function canManageUploads(user: User): boolean {
  return user.role === 'admin' || user.role === 'manager'
}
