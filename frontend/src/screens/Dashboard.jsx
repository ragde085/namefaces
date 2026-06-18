import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import Avatar from '../components/Avatar'
import { api } from '../lib/api'
import { userStats } from '../lib/leaderboard'

const card = { background: 'var(--surface)', border: '2px solid var(--line)', borderRadius: 20, padding: 18 }

function StatTile({ value, label }) {
  return (
    <div style={{ ...card, padding: '18px 16px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 30, color: 'var(--ink)' }}>{value}</div>
      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)' }}>{label}</div>
    </div>
  )
}

function rankBadgeStyle(rank) {
  const fill = rank === 1 ? 'var(--gold)' : rank === 2 ? 'var(--silver)' : rank === 3 ? 'var(--bronze)' : 'var(--bg2)'
  const color = rank <= 3 ? '#fff' : 'var(--ink-soft)'
  return { width: 26, height: 26, borderRadius: 8, background: fill, color, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, flex: 'none' }
}

const relDate = (ts) => {
  const days = Math.floor((Date.now() - ts) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}

export default function Dashboard({ user, history, config, nav, ...bar }) {
  const [board, setBoard] = useState([])
  useEffect(() => {
    api.leaderboard('all_time', 'All').then((d) => setBoard(d.rows)).catch(() => setBoard([]))
  }, [])

  const stats = userStats(user, history)
  const myRank = board.find((r) => r.is_you)?.rank || '—'
  const top5 = board.slice(0, 5)
  const recent = history.slice(0, 4)

  return (
    <div className="nf-fade">
      <TopBar user={user} nav={nav} {...bar} />
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '8px 28px 48px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 34, margin: '0 0 4px' }}>¡Hola, {user.first}!</h1>
        <p style={{ color: 'var(--ink-soft)', fontSize: 17, margin: '0 0 24px' }}>Ready to put some names to faces?</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, marginBottom: 18 }} className="dash-grid">
          {/* CTA */}
          <div style={{
            position: 'relative', overflow: 'hidden', background: 'var(--primary)', color: 'var(--on-primary)',
            borderRadius: 26, padding: 30, boxShadow: '0 10px 0 var(--primary-dk)',
          }}>
            <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.12)' }} />
            <div style={{ position: 'absolute', bottom: -40, right: 60, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,.1)' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ textTransform: 'uppercase', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, opacity: 0.9, letterSpacing: '.5px' }}>Daily quiz</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 30, margin: '6px 0 8px' }}>Who's who?</h2>
              <p style={{ opacity: 0.92, margin: '0 0 20px' }}>{config.quizLength} questions · {config.timerSeconds}s each · mixed rounds</p>
              <button
                onClick={() => nav('quiz')}
                style={{
                  background: 'var(--surface)', color: 'var(--primary-dk)', border: 'none', borderRadius: 15,
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, padding: '13px 22px',
                  boxShadow: '0 5px 0 rgba(0,0,0,.12)',
                }}
              >Start quiz →</button>
            </div>
          </div>

          {/* Stats 2x2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <StatTile value={stats.quizzes} label="Quizzes" />
            <StatTile value={stats.best} label="Best score" />
            <StatTile value={`${stats.avgAcc}%`} label="Avg accuracy" />
            <StatTile value={`#${myRank}`} label="Office rank" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }} className="dash-grid">
          {/* Leaderboard peek */}
          <div style={{ ...card, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, margin: 0 }}>Top of the office</h3>
              <button onClick={() => nav('leaderboard')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, fontSize: 14 }}>View all →</button>
            </div>
            {top5.length === 0 && (
              <p style={{ color: 'var(--ink-soft)', textAlign: 'center', padding: '16px 0' }}>No scores yet.</p>
            )}
            {top5.map((r) => (
              <div key={r.player} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', borderRadius: 12, marginBottom: 4,
                background: r.is_you ? 'var(--bg2)' : 'transparent',
                border: r.is_you ? '2px solid var(--primary)' : '2px solid transparent',
              }}>
                <span style={rankBadgeStyle(r.rank)}>{r.rank}</span>
                <Avatar person={r} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                  <div style={{ color: 'var(--ink-soft)', fontSize: 12, fontWeight: 700 }}>{r.dept}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--primary-dk)' }}>{r.points}</div>
              </div>
            ))}
          </div>

          {/* Recent games */}
          <div style={{ ...card, padding: 22 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, margin: '0 0 14px' }}>Recent games</h3>
            {recent.length === 0 ? (
              <p style={{ color: 'var(--ink-soft)', textAlign: 'center', padding: '24px 0' }}>No games yet — play your first quiz!</p>
            ) : recent.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'var(--bg2)', display: 'grid', placeItems: 'center', fontWeight: 800, color: 'var(--ink-soft)', flex: 'none' }}>{h.accuracy}%</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>Scored {h.score}</div>
                  <div style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{h.correct}/{h.total} correct · {relDate(h.ts)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
