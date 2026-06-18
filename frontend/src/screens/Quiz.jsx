import { useEffect, useMemo, useRef, useState } from 'react'
import Avatar from '../components/Avatar'
import { buildQuiz, scoreAnswer, accuracyPct } from '../lib/quiz'
import { appendEntry } from '../lib/storage'

export default function Quiz({ config, history, nav, onFinish }) {
  const questions = useMemo(() => buildQuiz(config.quizLength), [config.quizLength])
  const [qIdx, setQIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(config.timerSeconds)
  const [revealed, setRevealed] = useState(false)
  const [selected, setSelected] = useState(null)
  const [results, setResults] = useState([])
  const timerRef = useRef(null)

  const q = questions[qIdx]
  const isLast = qIdx === questions.length - 1

  // Per-question countdown.
  useEffect(() => {
    setTimeLeft(config.timerSeconds)
    setRevealed(false)
    setSelected(null)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          reveal(null) // timeout = miss
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx])

  function reveal(choice) {
    clearInterval(timerRef.current)
    setSelected(choice)
    setRevealed(true)
    const isCorrect = choice && choice.id === q.person.id
    const pts = scoreAnswer(isCorrect, timeLeft)
    setScore((s) => s + pts)
    if (isCorrect) setCorrectCount((c) => c + 1)
    setResults((r) => [...r, { person: q.person, correct: !!isCorrect }])
  }

  function next() {
    if (isLast) {
      const total = questions.length
      const correct = correctCount
      const entry = {
        ts: Date.now(),
        score,
        correct,
        total,
        accuracy: accuracyPct(correct, total),
        version: 'mvp-1',
        results,
      }
      const updated = appendEntry(entry)
      onFinish(entry, updated)
    } else {
      setQIdx((i) => i + 1)
    }
  }

  const timerColor = timeLeft <= 5 ? 'var(--wrong)' : 'var(--primary)'
  const deg = (timeLeft / config.timerSeconds) * 360
  const progress = (qIdx + (revealed ? 1 : 0)) / questions.length

  return (
    <div style={{ minHeight: '100%', padding: '18px 20px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 760, margin: '0 auto 18px' }}>
        <button
          onClick={() => nav('dashboard')}
          aria-label="Quit quiz"
          style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--surface)', border: '2px solid var(--line)', fontSize: 16 }}
        >✕</button>
        <div style={{ flex: 1 }}>
          <div style={{ height: 12, background: 'var(--line)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${progress * 100}%`, background: 'var(--primary)', borderRadius: 99, transition: 'width .35s ease' }} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--ink-soft)', marginTop: 5 }}>Question {qIdx + 1} of {questions.length}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--primary-dk)' }}>{score}</span>
          <span style={{ fontSize: 11, color: 'var(--ink-soft)', marginLeft: 3 }}>PTS</span>
        </div>
      </div>

      {/* Card */}
      <div key={qIdx} className="nf-fade" style={{
        maxWidth: 560, margin: '0 auto', background: 'var(--surface)', borderRadius: 28, padding: 30,
        boxShadow: '0 14px 40px rgba(20,30,40,.08)',
      }}>
        {/* Timer ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div style={{ width: 62, height: 62, borderRadius: '50%', background: `conic-gradient(${timerColor} ${deg}deg, var(--line) 0)`, display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--surface)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22 }}>{timeLeft}</div>
          </div>
        </div>

        {q.mode === 'name' ? (
          <NameRound q={q} revealed={revealed} selected={selected} onPick={reveal} />
        ) : (
          <FaceRound q={q} revealed={revealed} selected={selected} onPick={reveal} />
        )}

        {revealed && <FeedbackBanner q={q} selected={selected} isLast={isLast} onNext={next} />}
      </div>
    </div>
  )
}

function optState(choice, q, selected, revealed) {
  if (!revealed) return 'idle'
  if (choice.id === q.person.id) return 'correct'
  if (selected && choice.id === selected.id) return 'wrong'
  return 'dim'
}

function NameRound({ q, revealed, selected, onPick }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <div className="nf-pop"><Avatar person={q.person} size={148} /></div>
      </div>
      <h2 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, margin: '0 0 18px' }}>Who's this?</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {q.choices.map((c) => {
          const st = optState(c, q, selected, revealed)
          return (
            <button
              key={c.id}
              disabled={revealed}
              onClick={() => onPick(c)}
              className={st === 'wrong' ? 'nf-shake' : undefined}
              style={optBtnStyle(st)}
            >
              <span>{c.name}</span>
              {st === 'correct' && <Badge kind="correct" />}
              {st === 'wrong' && <Badge kind="wrong" />}
            </button>
          )
        })}
      </div>
    </>
  )
}

function FaceRound({ q, revealed, selected, onPick }) {
  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div style={{ textTransform: 'uppercase', fontWeight: 800, fontSize: 12, letterSpacing: '.5px', color: 'var(--ink-soft)' }}>Find this teammate</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 28, margin: '4px 0 2px' }}>{q.person.name}</div>
        <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>{q.person.role}, {q.person.dept}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {q.choices.map((c) => {
          const st = optState(c, q, selected, revealed)
          return (
            <button
              key={c.id}
              disabled={revealed}
              onClick={() => onPick(c)}
              className={st === 'wrong' ? 'nf-shake' : undefined}
              style={{ ...tileStyle(st), flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              <Avatar person={c} size={96} />
              {revealed && <span style={{ fontWeight: 800, fontSize: 14 }}>{c.first}</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}

function FeedbackBanner({ q, selected, isLast, onNext }) {
  const correct = selected && selected.id === q.person.id
  const timeout = !selected
  const title = correct ? 'Correct! 🎉' : timeout ? "Time's up!" : 'Not quite'
  const color = correct ? 'var(--correct)' : 'var(--wrong)'
  const bg = correct ? 'var(--correct-soft)' : 'var(--wrong-soft)'
  return (
    <div className="nf-fade" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      marginTop: 18, padding: '14px 16px', background: bg, border: `2px solid ${color}`, borderRadius: 18,
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 20, color }}>{title}</div>
        <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{q.person.name} · {q.person.role}, {q.person.dept}</div>
      </div>
      <button className="btn-3d" style={{ fontSize: 16, padding: '12px 18px', whiteSpace: 'nowrap' }} onClick={onNext}>
        {isLast ? 'See results →' : 'Next →'}
      </button>
    </div>
  )
}

function Badge({ kind }) {
  return (
    <span style={{
      width: 26, height: 26, borderRadius: 999, color: '#fff', display: 'grid', placeItems: 'center',
      background: kind === 'correct' ? 'var(--correct)' : 'var(--wrong)', fontSize: 14, flex: 'none',
    }}>{kind === 'correct' ? '✓' : '✗'}</span>
  )
}

function optBtnStyle(st) {
  const base = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', padding: '16px 18px', border: '2.5px solid var(--line)', borderRadius: 18,
    background: 'var(--surface)', fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 17,
    boxShadow: '0 4px 0 rgba(0,0,0,0.05)', color: 'var(--ink)', textAlign: 'left',
  }
  if (st === 'correct') return { ...base, borderColor: 'var(--correct)', background: 'var(--correct-soft)' }
  if (st === 'wrong') return { ...base, borderColor: 'var(--wrong)', background: 'var(--wrong-soft)' }
  if (st === 'dim') return { ...base, opacity: 0.45 }
  return base
}

function tileStyle(st) {
  const base = {
    display: 'flex', padding: 16, border: '3px solid var(--line)', borderRadius: 22,
    background: 'var(--surface)', boxShadow: '0 5px 0 rgba(0,0,0,0.05)',
  }
  if (st === 'correct') return { ...base, borderColor: 'var(--correct)', background: 'var(--correct-soft)' }
  if (st === 'wrong') return { ...base, borderColor: 'var(--wrong)', background: 'var(--wrong-soft)' }
  if (st === 'dim') return { ...base, opacity: 0.45 }
  return base
}
