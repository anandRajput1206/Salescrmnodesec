import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { canUpload } from './lib/auth'
import { AppLayout, type AppView } from './components/layout/AppLayout'
import { DashboardPage } from './components/DashboardPage'
import { LoginPage } from './components/LoginPage'
import { UploadPage } from './components/UploadPage'

function AppShell() {
  const { user, logout } = useAuth()
  const [view, setView] = useState<AppView>('dashboard')

  useEffect(() => {
    if (user && view === 'upload' && !canUpload(user)) {
      setView('dashboard')
    }
  }, [user, view])

  if (!user) return <LoginPage />

  const currentView = view === 'upload' && canUpload(user) ? 'upload' : 'dashboard'

  return (
    <AppLayout user={user} view={currentView} onViewChange={setView} onLogout={logout}>
      {currentView === 'upload' ? (
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
