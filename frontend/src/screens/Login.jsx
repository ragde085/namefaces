import { useState } from 'react'

const blob = (color, top, left, size) => ({
  position: 'absolute', top, left, width: size, height: size, borderRadius: '50%',
  background: color, opacity: 0.16, filter: 'blur(20px)', animation: 'nf-float 6s ease-in-out infinite',
})

const field = {
  width: '100%', padding: '13px 15px', border: '2.5px solid var(--line)', borderRadius: 14,
  background: 'var(--bg2)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, outline: 'none',
}
const labelStyle = { fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }

export default function Login({ onLogin }) {
  // Demo creds pre-filled (MVP: admin-created accounts, no self-signup).
  // PRODUCTION: replace with Google Workspace OIDC.
  const [email, setEmail] = useState('sofia.garcia@griddynamics.com')
  const [password, setPassword] = useState('demo1234')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onLogin(email.trim().toLowerCase())
    } catch (err) {
      setError('Could not reach the server. Is the API running?')
      setBusy(false)
    }
  }

  return (
    <div style={{
      minHeight: '100%', display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden', padding: 20,
    }}>
      <div style={blob('var(--primary)', '12%', '10%', 220)} />
      <div style={blob('var(--accent2)', '60%', '70%', 260)} />
      <div style={blob('var(--accent)', '70%', '15%', 180)} />

      <form
        onSubmit={submit}
        className="nf-pop"
        style={{
          position: 'relative', maxWidth: 412, width: '100%', background: 'var(--surface)',
          borderRadius: 30, padding: '38px 34px', boxShadow: '0 24px 60px rgba(20,30,40,.14)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <span style={{
            width: 46, height: 46, borderRadius: 15, background: 'var(--primary)', color: 'var(--on-primary)',
            fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, display: 'grid', placeItems: 'center',
            boxShadow: '0 5px 0 var(--primary-dk)',
          }}>N</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 27 }}>NameFaces</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 23, margin: '0 0 6px' }}>Welcome back 👋</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.45, margin: '0 0 22px' }}>
          Learn your colleagues at Grid Dynamics MX — one face at a time.
        </p>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle} htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            style={field} onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--line)')} />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle} htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            style={field} onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--line)')} />
        </div>

        <button type="submit" className="btn-3d" style={{ width: '100%', opacity: busy ? 0.7 : 1 }} disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in & play'}
        </button>

        {error && (
          <p role="alert" style={{ textAlign: 'center', color: 'var(--wrong)', fontSize: 13, margin: '12px 0 0' }}>{error}</p>
        )}

        <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: 13, margin: '16px 0 0' }}>
          Accounts are created by your admin. Demo credentials pre-filled.
        </p>
      </form>
    </div>
  )
}
