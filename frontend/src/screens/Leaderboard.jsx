import { useEffect, useState } from 'react'
import { Logo } from '../components/TopBar'
import Avatar from '../components/Avatar'
import { api } from '../lib/api'

// Org departments for filter chips. PRODUCTION: fetch distinct depts from API.
const DEPARTMENTS = ['Engineering', 'Data', 'Design', 'Product', 'QA', 'DevOps']

function rankBadgeStyle(rank) {
  const fill = rank === 1 ? 'var(--gold)' : rank === 2 ? 'var(--silver)' : rank === 3 ? 'var(--bronze)' : 'var(--bg2)'
  const color = rank <= 3 ? '#fff' : 'var(--ink-soft)'
  return { width: 28, height: 28, borderRadius: 8, background: fill, color, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, flex: 'none' }
}

function Podium({ rows }) {
  const [first, second, third] = rows
  const cols = [
    { r: second, h: 88, size: 58, bar: 'var(--silver)' },
    { r: first, h: 118, size: 72, bar: 'var(--gold)', crown: true },
    { r: third, h: 66, size: 58, bar: 'var(--bronze)' },
  ]
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 14, margin: '24px 0 28px' }}>
      {cols.map(({ r, h, size, bar, crown }, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {crown && <div style={{ fontSize: 22 }}>👑</div>}
          <Avatar person={r} size={size} />
          <div style={{ fontWeight: 800, fontSize: 14 }}>{r.first}</div>
          <div style={{ width: 76, height: h, background: bar, borderRadius: '12px 12px 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8, color: '#fff' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20 }}>{r.rank}</div>
            <div style={{ fontWeight: 800, fontSize: 13 }}>{r.points}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Leaderboard({ nav }) {
  const [dept, setDept] = useState('All')
  const [window, setWindow] = useState('all_time')
  const [rows, setRows] = useState([])
  const chips = ['All', ...DEPARTMENTS]

  useEffect(() => {
    api.leaderboard(window, dept).then((d) => setRows(d.rows)).catch(() => setRows([]))
  }, [window, dept])

  return (
    <div className="nf-fade" style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px 48px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0' }}>
        <Logo size={38} onClick={() => nav('dashboard')} />
        <button onClick={() => nav('dashboard')} style={{ background: 'none', border: 'none', fontWeight: 800, fontSize: 15, color: 'var(--ink-soft)' }}>← Dashboard</button>
      </header>

      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 32, margin: '0 0 14px' }}>Leaderboard</h1>

      {/* Window toggle: all-time vs weekly */}
      <div style={{ display: 'inline-flex', gap: 4, background: 'var(--bg2)', padding: 4, borderRadius: 999, marginBottom: 14 }}>
        {[['all_time', 'All-time'], ['weekly', 'This week']].map(([key, label]) => (
          <button key={key} onClick={() => setWindow(key)} style={{
            padding: '7px 16px', borderRadius: 999, border: 'none', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14,
            background: window === key ? 'var(--surface)' : 'transparent',
            color: window === key ? 'var(--ink)' : 'var(--ink-soft)',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {chips.map((c) => {
          const active = c === dept
          return (
            <button key={c} onClick={() => setDept(c)} style={{
              padding: '9px 16px', borderRadius: 999, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14,
              background: active ? 'var(--primary)' : 'var(--surface)',
              color: active ? 'var(--on-primary)' : 'var(--ink-soft)',
              border: active ? 'none' : '2px solid var(--line)',
            }}>{c}</button>
          )
        })}
      </div>

      {rows.length >= 3 && <Podium rows={rows} />}

      <div style={{ background: 'var(--surface)', border: '2px solid var(--line)', borderRadius: 22, padding: 10 }}>
        {rows.length === 0 && (
          <p style={{ color: 'var(--ink-soft)', textAlign: 'center', padding: '20px 0' }}>No scores in this view yet.</p>
        )}
        {rows.map((r, i) => (
          <div key={r.player} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderBottom: i < rows.length - 1 ? '1.5px solid var(--line)' : 'none',
            background: r.is_you ? 'var(--bg2)' : 'transparent', borderRadius: r.is_you ? 12 : 0,
          }}>
            <span style={rankBadgeStyle(r.rank)}>{r.rank}</span>
            <Avatar person={r} size={40} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{r.name}</div>
              <div style={{ color: 'var(--ink-soft)', fontSize: 12 }}>{r.dept}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--primary-dk)' }}>{r.points}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
