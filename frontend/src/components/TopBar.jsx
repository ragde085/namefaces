// Shared top bar (Dashboard & Leaderboard).

const THEMES = ['fresh', 'sunset', 'grape']
// Approx primary hue per theme for the dots (oklch -> rough hsl).
const DOT = { fresh: '#2bb673', sunset: '#e0612f', grape: '#8a3ffb' }

function Logo({ size = 38, label = true, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: 0 }}
      aria-label="Go to dashboard"
    >
      <span style={{
        width: size, height: size, borderRadius: 12, background: 'var(--primary)',
        color: 'var(--on-primary)', fontFamily: 'var(--font-display)', fontWeight: 600,
        fontSize: size * 0.55, display: 'grid', placeItems: 'center',
        boxShadow: '0 4px 0 var(--primary-dk)',
      }}>N</span>
      {label && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: 'var(--ink)' }}>NameFaces</span>}
    </button>
  )
}

export default function TopBar({ user, theme, setTheme, nav, maxWidth = 1080, showThemes = true }) {
  return (
    <header style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '18px 28px', maxWidth, margin: '0 auto', width: '100%',
    }}>
      <Logo onClick={() => nav('dashboard')} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {showThemes && (
          <div style={{ display: 'flex', gap: 8 }} role="group" aria-label="Theme">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                aria-label={`${t} theme`}
                aria-pressed={theme === t}
                style={{
                  width: 20, height: 20, borderRadius: 999, border: 'none',
                  background: DOT[t], padding: 0,
                  transform: theme === t ? 'scale(1.12)' : 'none',
                  boxShadow: theme === t ? `0 0 0 3px var(--surface), 0 0 0 5px ${DOT[t]}` : 'none',
                }}
              />
            ))}
          </div>
        )}
        <button
          onClick={() => nav('leaderboard')}
          style={{ background: 'none', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 15, color: 'var(--ink-soft)' }}
        >
          Leaderboard
        </button>
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)',
            border: '2px solid var(--line)', borderRadius: 999, padding: '5px 13px 5px 5px',
          }}>
            <span style={{
              width: 30, height: 30, borderRadius: 999, background: 'var(--accent2)', color: '#fff',
              fontWeight: 800, display: 'grid', placeItems: 'center', fontSize: 13,
            }}>{user.first?.[0] || '?'}</span>
            <span style={{ fontWeight: 800, fontSize: 14 }}>{user.first}</span>
          </div>
        )}
      </div>
    </header>
  )
}

export { Logo }
