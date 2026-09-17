import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../utils/api'

function Field({ label, type = 'text', name, placeholder, required = true }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <input type={type} name={name} placeholder={placeholder} required={required} />
    </label>
  )
}

function BrandMark() {
  return (
    <Link className="brand-mark" to="/" aria-label="Zomato home">
      <span className="brand-dot" />
      zomato
    </Link>
  )
}

function AuthPage({ mode, partner = false }) {
  const navigate = useNavigate()
  const [theme, setTheme] = useState(() => localStorage.getItem('zomato-theme') || 'system')
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isRegister = mode === 'register'
  const audience = partner ? 'food partner' : 'food lover'
  const title = isRegister ? 'Create your account' : 'Welcome back'
  const subtitle = isRegister
    ? `Join Zomato as a ${audience}.`
    : `Sign in to continue as a ${audience}.`

  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.dataset.theme = theme
    }
    localStorage.setItem('zomato-theme', theme)
  }, [theme])

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ type: '', message: '' })
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      email: formData.get('email'),
      password: formData.get('password'),
    }

    if (isRegister) {
      if (partner) {
        payload.name = formData.get('restaurantName')
        payload.contact = formData.get('phone')
      } else {
        payload.fullName = formData.get('fullName')
      }
    }

    const accountType = partner ? 'food-partner' : 'user'
    const endpoint = `/api/auth/${accountType}/${mode}`

    try {
      const response = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong. Please try again.')
      }

      setStatus({ type: 'success', message: result.message })
      if (isRegister) {
        navigate(`/${partner ? 'food-partner' : 'user'}/login`)
      } else {
        if (partner) {
          localStorage.setItem('zomato-partner-id', result.foodPartner._id)
        } else {
          localStorage.removeItem('zomato-partner-id')
          localStorage.setItem('zomato-user-id', result.user._id)
        }
        navigate(partner ? '/food-partner/home' : '/')
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-intro">
          <BrandMark />
          <div className="intro-copy">
            <p className="eyebrow">{partner ? 'For food partners' : 'Discover more'}</p>
            <h1>{partner ? 'Share your food with the world.' : 'Good food is always a good idea.'}</h1>
            <p>
              {partner
                ? 'Grow your business, reach new customers, and make every order count.'
                : 'Find the best restaurants and dishes, delivered right to your door.'}
            </p>
          </div>
          <div className="intro-note">
            <span className="note-icon" aria-hidden="true">✦</span>
            Simple, seamless, and made for you.
          </div>
        </section>

        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-toolbar">
            <div className="account-switcher" aria-label="Choose account type">
              <Link className={!partner ? 'is-active' : ''} to={`/user/${mode}`}>
                <span aria-hidden="true">●</span>
                User
              </Link>
              <Link className={partner ? 'is-active' : ''} to={`/food-partner/${mode}`}>
                <span aria-hidden="true">◆</span>
                Partner
              </Link>
            </div>
            <div className="theme-switcher" aria-label="Choose color theme">
              <button className={theme === 'light' ? 'is-active' : ''} onClick={() => setTheme('light')} type="button" aria-label="Use light theme">☀</button>
              <button className={theme === 'dark' ? 'is-active' : ''} onClick={() => setTheme('dark')} type="button" aria-label="Use dark theme">☾</button>
              <button className={theme === 'system' ? 'is-active' : ''} onClick={() => setTheme('system')} type="button" aria-label="Use system theme">◐</button>
            </div>
          </div>
          <div className="card-heading">
            <p className="eyebrow">{partner ? 'Partner portal' : 'Welcome to Zomato'}</p>
            <h2 id="auth-title">{title}</h2>
            <p>{subtitle}</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <Field
                label={partner ? 'Restaurant name' : 'Full name'}
                name={partner ? 'restaurantName' : 'fullName'}
                placeholder={partner ? 'Your restaurant name' : 'Your full name'}
              />
            )}
            <Field label="Email address" type="email" name="email" placeholder="you@example.com" />
            {isRegister && partner && (
              <Field label="Phone number" type="tel" name="phone" placeholder="+91 98765 43210" />
            )}
            <Field label="Password" type="password" name="password" placeholder="Enter your password" />

            {!isRegister && (
              <div className="form-meta">
                <label className="remember-option">
                  <input type="checkbox" name="remember" />
                  <span>Remember me</span>
                </label>
                <button className="text-button" type="button">Forgot password?</button>
              </div>
            )}

            <button className="primary-button" type="submit">
              {isSubmitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
              <span aria-hidden="true">→</span>
            </button>
          </form>
          {status.message && (
            <p className={`auth-status ${status.type}`} role="alert">
              {status.message}
            </p>
          )}

          <div className="auth-switch">
            <span>{isRegister ? 'Already have an account?' : "Don't have an account?"}</span>
            <Link to={`/${partner ? 'food-partner' : 'user'}/${isRegister ? 'login' : 'register'}`}>
              {isRegister ? 'Sign in' : 'Create one'}
            </Link>
          </div>
          <p className="terms-copy">
            By continuing, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.
          </p>
        </section>
      </div>
    </main>
  )
}

export default AuthPage
