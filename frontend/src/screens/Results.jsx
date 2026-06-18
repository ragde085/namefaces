import Avatar from '../components/Avatar'

const CONFETTI_COLORS = ['var(--primary)', 'var(--accent)', 'var(--accent2)', 'var(--gold)']

function Confetti() {
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} style={{
          position: 'absolute', top: `${(i * 53) % 100}%`, left: `${(i * 37) % 100}%`,
          width: 13, height: 13, background: CONFETTI_COLORS[i % 4],
          borderRadius: i % 2 ? '50%' : 3, opacity: 0.7,
          animation: `nf-float ${5 + (i % 3)}s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </>
  )
}

export default function Results({ lastEntry, history, nav }) {
  const e = lastEntry || { score: 0, correct: 0, total: 0, accuracy: 0, results: [] }
  const bestBefore = history.slice(1).reduce((m, h) => Math.max(m, h.score), 0)
  const isBest = e.score >= bestBefore && history.length > 0

  return (
    <div style={{ position: 'relative', minHeight: '100%', overflow: 'hidden', padding: '32px 20px 48px' }}>
      <Confetti />
      <div className="nf-fade" style={{ position: 'relative', maxWidth: 540, margin: '0 auto' }}>
        {/* Summary */}
        <div style={{ background: 'var(--surface)', borderRadius: 30, padding: 34, textAlign: 'center', boxShadow: '0 18px 50px rgba(20,30,40,.12)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 28, margin: '0 0 20px' }}>Quiz complete!</h1>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
            <div style={{ width: 150, height: 150, borderRadius: '50%', background: `conic-gradient(var(--primary) ${e.accuracy * 3.6}deg, var(--line) 0)`, display: 'grid', placeItems: 'center' }}>
              <div style={{ width: 122, height: 122, borderRadius: '50%', background: 'var(--surface)', display: 'grid', placeItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 42, color: 'var(--primary-dk)', lineHeight: 1 }}>{e.accuracy}%</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)', letterSpacing: '.5px' }}>ACCURACY</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: isBest ? 14 : 22 }}>
            <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 14 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26 }}>{e.score}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)' }}>POINTS</div>
            </div>
            <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 14 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 26 }}>{e.correct}/{e.total}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-soft)' }}>CORRECT</div>
            </div>
          </div>
          {isBest && (
            <div style={{ display: 'inline-block', background: 'var(--gold)', color: '#fff', fontWeight: 800, padding: '8px 16px', borderRadius: 999, marginBottom: 18 }}>🎉 New personal best!</div>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-3d" style={{ flex: 1 }} onClick={() => nav('quiz')}>Play again</button>
            <button onClick={() => nav('leaderboard')} style={{
              flex: 1, background: 'var(--surface)', border: '2.5px solid var(--line)', borderRadius: 15,
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, color: 'var(--ink)',
            }}>Leaderboard</button>
          </div>
        </div>

        {/* Review */}
        <div style={{ background: 'var(--surface)', border: '2px solid var(--line)', borderRadius: 22, padding: 22, marginTop: 18 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, margin: '0 0 12px' }}>Review</h2>
          {e.results.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0' }}>
              <Avatar person={r.person} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{r.person.name}</div>
                <div style={{ color: 'var(--ink-soft)', fontSize: 12 }}>{r.person.role} · {r.person.dept}</div>
              </div>
              <span style={{ width: 30, height: 30, borderRadius: '50%', color: '#fff', display: 'grid', placeItems: 'center', background: r.correct ? 'var(--correct)' : 'var(--wrong)' }}>{r.correct ? '✓' : '✗'}</span>
            </div>
          ))}
          <button onClick={() => nav('dashboard')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, marginTop: 8 }}>Back to dashboard</button>
        </div>
      </div>
    </div>
  )
}
