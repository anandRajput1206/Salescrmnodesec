import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppLayout, type AppView } from './components/layout/AppLayout'
import { DashboardPage } from './components/DashboardPage'
import { LoginPage } from './components/LoginPage'
import { UploadPage } from './components/UploadPage'

function AppShell() {
  const { user, logout } = useAuth()
  const [view, setView] = useState<AppView>('dashboard')

  if (!user) return <LoginPage />

  return (
    <AppLayout user={user} view={view} onViewChange={setView} onLogout={logout}>
      {view === 'upload' ? (
        <UploadPage user={user} onSuccess={() => setView('dashboard')} />
      ) : (
        <DashboardPage />
      )}
    </AppLayout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
