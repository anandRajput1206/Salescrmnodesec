import { useState, type FormEvent } from 'react'
import { Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(login(email, password) ?? '')
  }

  return (
    <div className="login-page">
      <div className="login-card login-card-wide">
        <div className="login-brand">
          <img src="/logo.png" alt="Company logo" className="brand-logo" />
          <div>
            <h1>CyberSecurity Sales CRM</h1>
            <p>Streamline Your Sales Process with Confidence</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <div className="input-wrap">
              <Mail size={16} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@company.com"
                autoComplete="username"
                required
              />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="input-wrap">
              <Lock size={16} />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="firstname@2024"
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" className="primary-btn">
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
