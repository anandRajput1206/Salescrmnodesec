import { useEffect, useState, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, Mail, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login, authLoading, sessionChecking, supabaseReady } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ type: 'error' | 'info'; message: string } | null>(null)

  useEffect(() => {
    if (!sessionChecking && !supabaseReady) {
      setToast({
        type: 'error',
        message: 'Database connection missing. Add Production env vars in Vercel and Redeploy.',
      })
    }
  }, [sessionChecking, supabaseReady])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 6000)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!supabaseReady) {
      setToast({
        type: 'error',
        message: 'Supabase is not connected. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY for Production, then Redeploy.',
      })
      return
    }

    const message = await login(email, password)
    if (message) {
      setError(message)
      setToast({ type: 'error', message })
    }
  }

  if (sessionChecking) {
    return (
      <div className="login-page">
        <div className="login-card">
          <p className="status-text">Checking session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      {toast ? (
        <div className={`app-toast app-toast-${toast.type}`} role="status">
          <div>
            <strong>{toast.type === 'error' ? 'Connection issue' : 'Notice'}</strong>
            <p>{toast.message}</p>
          </div>
          <button type="button" className="app-toast-close" onClick={() => setToast(null)} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div className="login-card login-card-wide">
        <div className="login-brand">
          <img src="/logo.png" alt="Nodesec logo" className="brand-logo" />
          <div>
            <h1>CyberSecurity Sales CRM</h1>
            <p>Streamline Your Sales Process with Confidence</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <div className="input-wrap">
              <Mail size={16} aria-hidden />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                autoComplete="username"
                required
              />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="input-wrap">
              <Lock size={16} aria-hidden />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" className="primary-btn" disabled={authLoading}>
            {authLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
