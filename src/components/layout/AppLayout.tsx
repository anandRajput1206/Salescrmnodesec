import { Download, LayoutDashboard, Upload } from 'lucide-react'
import { canUpload, canViewAllData } from '../../lib/auth'
import { roleLabel } from '../../lib/dateUtils'
import type { User } from '../../lib/types'

export type AppView = 'dashboard' | 'upload'

interface AppLayoutProps {
  user: User
  view: AppView
  onViewChange: (view: AppView) => void
  onLogout: () => void
  children: React.ReactNode
}

const TEMPLATE_URL = '/CyberSecurity_Sales_Template_With_Validation.xlsx'

export function AppLayout({ user, view, onViewChange, onLogout, children }: AppLayoutProps) {
  const showUpload = canUpload(user)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <img src="/logo.png" alt="Company logo" className="brand-logo" />
          <div>
            <h1>Sales CRM</h1>
            <p>CyberSecurity Analytics</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={view === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => onViewChange('dashboard')}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          {showUpload ? (
            <button
              type="button"
              className={view === 'upload' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => onViewChange('upload')}
            >
              <Upload size={18} />
              Upload
            </button>
          ) : null}
          <a className="nav-btn template-link" href={TEMPLATE_URL} download>
            <Download size={18} />
            Download Template
          </a>
        </nav>

        <div className="sidebar-user">
          <strong>{user.name}</strong>
          <span>{user.email}</span>
          <span className="role-badge">{roleLabel(user.role)}</span>
          {canViewAllData(user) ? (
            <span className="scope-note">Viewing all team data</span>
          ) : (
            <span className="scope-note">Viewing your data only</span>
          )}
          <button type="button" className="ghost-btn logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  )
}
