import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { User } from '../lib/types'
import { authenticate as verifyLogin, clearSession, loadSession, saveSession } from '../lib/auth'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => string | null
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadSession())

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: (email, password) => {
        const nextUser = verifyLogin(email, password)
        if (!nextUser) return 'Invalid email or password'
        saveSession(nextUser)
        setUser(nextUser)
        return null
      },
      logout: () => {
        clearSession()
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
