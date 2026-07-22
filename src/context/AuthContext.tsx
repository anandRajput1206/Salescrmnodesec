import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '../lib/types'
import {
  authenticate as verifyLogin,
  clearSession,
  loadSession,
  refreshSessionUser,
  resolveUserRecord,
  saveSession,
} from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<string | null>
  logout: () => void
  refreshUser: () => Promise<User | null>
  authLoading: boolean
  sessionChecking: boolean
  supabaseReady: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [sessionChecking, setSessionChecking] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      const sessionUser = loadSession()
      if (!sessionUser || !isSupabaseConfigured) {
        setSessionChecking(false)
        return
      }

      try {
        const refreshed = await refreshSessionUser(sessionUser)
        if (refreshed) {
          saveSession(refreshed)
          setUser(refreshed)
        } else {
          clearSession()
        }
      } catch {
        clearSession()
      } finally {
        setSessionChecking(false)
      }
    }

    void restoreSession()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      authLoading,
      sessionChecking,
      supabaseReady: isSupabaseConfigured,
      login: async (email, password) => {
        setAuthLoading(true)
        try {
          const nextUser = await verifyLogin(email, password)
          if (!nextUser) {
            return 'Invalid email or password.'
          }
          const resolved = await resolveUserRecord(nextUser)
          const sessionUser = resolved?.user ?? nextUser
          saveSession(sessionUser)
          setUser(sessionUser)
          return null
        } catch (error) {
          return error instanceof Error ? error.message : 'Login failed'
        } finally {
          setAuthLoading(false)
        }
      },
      refreshUser: async () => {
        const current = user ?? loadSession()
        if (!current) return null

        const refreshed = await refreshSessionUser(current)
        if (!refreshed) {
          clearSession()
          setUser(null)
          return null
        }

        saveSession(refreshed)
        setUser(refreshed)
        return refreshed
      },
      logout: () => {
        clearSession()
        setUser(null)
      },
    }),
    [user, authLoading, sessionChecking],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
