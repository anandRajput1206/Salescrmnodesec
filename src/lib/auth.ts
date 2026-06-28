import type { User } from './types'

export const USERS: User[] = [
  {
    id: 'user-admin',
    email: 'admin@company.com',
    password: 'Admin@2024',
    name: 'System Admin',
    firstName: 'Admin',
    role: 'admin',
    region: 'All',
    zone: 'All',
  },
  {
    id: 'user-manager',
    email: 'manager@company.com',
    password: 'Manager@2024',
    name: 'Sales Manager',
    firstName: 'Manager',
    role: 'manager',
    region: 'All',
    zone: 'All',
  },
  {
    id: 'user-rahul',
    email: 'rahul.sharma@company.com',
    password: 'Rahul@2024',
    name: 'Rahul Sharma',
    firstName: 'Rahul',
    role: 'sales_team',
    region: 'North',
    zone: 'Zone A',
  },
  {
    id: 'user-priya',
    email: 'priya.nair@company.com',
    password: 'Priya@2024',
    name: 'Priya Nair',
    firstName: 'Priya',
    role: 'sales_team',
    region: 'South',
    zone: 'Zone B',
  },
  {
    id: 'user-amit',
    email: 'amit.patel@company.com',
    password: 'Amit@2024',
    name: 'Amit Patel',
    firstName: 'Amit',
    role: 'sales_team',
    region: 'East',
    zone: 'Zone C',
  },
  {
    id: 'user-kavita',
    email: 'kavita.singh@company.com',
    password: 'Kavita@2024',
    name: 'Kavita Singh',
    firstName: 'Kavita',
    role: 'sales_team',
    region: 'West',
    zone: 'Zone D',
  },
  {
    id: 'user-rohan',
    email: 'rohan.mehta@company.com',
    password: 'Rohan@2024',
    name: 'Rohan Mehta',
    firstName: 'Rohan',
    role: 'sales_team',
    region: 'North',
    zone: 'Zone B',
  },
]

const SESSION_KEY = 'crm-dashboard-session'

export function authenticate(email: string, password: string): User | null {
  const normalized = email.trim().toLowerCase()
  return (
    USERS.find(
      (user) => user.email.toLowerCase() === normalized && user.password === password,
    ) ?? null
  )
}

export function saveSession(user: User): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function loadSession(): User | null {
  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as User
    return USERS.find((user) => user.id === parsed.id) ?? null
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
