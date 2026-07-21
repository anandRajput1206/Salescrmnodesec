import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login, authLoading, sessionChecking, supabaseReady } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    const message = await login(email, password)
    if (message) setError(message)
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
      <div className="login-card login-card-wide">
        <div className="login-brand">
          <img src="/logo.png" alt="Nodesec logo" className="brand-logo" />
          <div>
            <h1>CyberSecurity Sales CRM</h1>
            <p>Streamline Your Sales Process with Confidence</p>
          </div>
        </div>

        {!supabaseReady ? (
          <div className="setup-banner">
            <strong>Supabase not configured</strong>
            <p>Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in Vercel / .env and redeploy.</p>
          </div>
        ) : null}

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
                disabled={!supabaseReady}
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
                disabled={!supabaseReady}
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

          <button type="submit" className="primary-btn" disabled={authLoading || !supabaseReady}>
            {authLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
