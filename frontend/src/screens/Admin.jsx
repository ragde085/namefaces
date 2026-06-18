import { useCallback, useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import Avatar from '../components/Avatar'
import { api } from '../lib/api'

const DEPARTMENTS = ['Engineering', 'Data', 'Design', 'Product', 'QA', 'DevOps']

const card = { background: 'var(--surface)', border: '2px solid var(--line)', borderRadius: 20, padding: 22 }
const input = {
  padding: '9px 12px', border: '2px solid var(--line)', borderRadius: 12,
  background: 'var(--bg2)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, outline: 'none',
}
const h3 = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, margin: '0 0 14px' }

function secondaryBtn(props = {}) {
  return {
    background: 'var(--surface)', border: '2px solid var(--line)', borderRadius: 12,
    padding: '8px 14px', fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 13, color: 'var(--ink)',
    ...props,
  }
}

export default function Admin({ user, nav, refreshConfig, ...bar }) {
  // Gate: non-admins bounce to dashboard.
  if (!user?.is_admin) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100%', gap: 14 }}>
        <p style={{ color: 'var(--ink-soft)' }}>Admins only.</p>
        <button className="btn-3d" onClick={() => nav('dashboard')}>Back to dashboard</button>
      </div>
    )
  }

  return (
    <div className="nf-fade">
      <TopBar user={user} nav={nav} {...bar} />
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '8px 28px 48px', display: 'grid', gap: 18 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 32, margin: 0 }}>Admin</h1>
        <QuizConfig refreshConfig={refreshConfig} />
        <HrImport onDone={() => window.dispatchEvent(new Event('roster-refresh'))} />
        <AddEmployee onAdd={() => window.dispatchEvent(new Event('roster-refresh'))} />
        <Roster />
      </main>
    </div>
  )
}

function QuizConfig({ refreshConfig }) {
  const [length, setLength] = useState(8)
  const [timer, setTimer] = useState(15)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    api.getConfig().then((c) => { setLength(c.quiz_length); setTimer(c.timer_seconds) }).catch(() => {})
  }, [])

  const save = async () => {
    setMsg(null)
    try {
      await api.updateConfig({ quiz_length: Number(length), timer_seconds: Number(timer) })
      await refreshConfig?.()
      setMsg('Saved')
    } catch (e) {
      setMsg(String(e.message || 'Error').includes('422') ? 'Out of range (length 4–12, timer 5–30)' : 'Save failed')
    }
  }

  return (
    <section style={card}>
      <h2 style={h3}>Quiz configuration</h2>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)' }}>Questions (4–12)</span>
          <input style={input} type="number" min={4} max={12} value={length} onChange={(e) => setLength(e.target.value)} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink-soft)' }}>Timer seconds (5–30)</span>
          <input style={input} type="number" min={5} max={30} value={timer} onChange={(e) => setTimer(e.target.value)} />
        </label>
        <button className="btn-3d" style={{ fontSize: 15, padding: '10px 18px' }} onClick={save}>Save config</button>
        {msg && <span style={{ color: msg === 'Saved' ? 'var(--correct)' : 'var(--wrong)', fontWeight: 700, fontSize: 13 }}>{msg}</span>}
      </div>
    </section>
  )
}

function HrImport({ onDone }) {
  const sample = '[\n  {"id":"emp_101","name":"New Person","role":"Engineer","dept":"Engineering","photo_url":"/photos/emp_101.png"}\n]'
  const [text, setText] = useState(sample)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const run = async () => {
    setResult(null); setError(null)
    let rows
    try {
      rows = JSON.parse(text)
      if (!Array.isArray(rows)) throw new Error()
    } catch {
      setError('Invalid JSON — expected an array of employees.')
      return
    }
    try {
      setResult(await api.importEmployees(rows))
      onDone?.()
    } catch (e) {
      setError('Import failed: ' + (e.message || ''))
    }
  }

  return (
    <section style={card}>
      <h2 style={h3}>HR import</h2>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, margin: '0 0 10px' }}>
        Paste an array of HRIS rows. Idempotent upsert keyed on <code>id</code>; admin-edited records are skipped (admin-edits-win).
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        style={{ ...input, width: '100%', minHeight: 120, fontFamily: 'monospace', resize: 'vertical' }}
      />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
        <button className="btn-3d" style={{ fontSize: 15, padding: '10px 18px' }} onClick={run}>Run import</button>
        {result && (
          <span style={{ color: 'var(--ink-soft)', fontSize: 13, fontWeight: 700 }}>
            created {result.created} · updated {result.updated} · skipped {result.skipped_admin_locked}
          </span>
        )}
        {error && <span style={{ color: 'var(--wrong)', fontSize: 13, fontWeight: 700 }}>{error}</span>}
      </div>
    </section>
  )
}

function AddEmployee({ onAdd }) {
  const blank = { id: '', name: '', role: '', dept: 'Engineering', photo_url: '' }
  const [form, setForm] = useState(blank)
  const [msg, setMsg] = useState(null)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    setMsg(null)
    if (!form.id || !form.name) { setMsg('id and name required'); return }
    try {
      await api.createEmployee(form)
      setForm(blank)
      setMsg('Added')
      onAdd?.()
    } catch (e) {
      setMsg(String(e.message || '').includes('409') ? 'id already exists' : 'Create failed')
    }
  }

  return (
    <section style={card}>
      <h2 style={h3}>Add employee</h2>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <input style={{ ...input, width: 110 }} placeholder="id" value={form.id} onChange={set('id')} />
        <input style={{ ...input, width: 180 }} placeholder="Full name" value={form.name} onChange={set('name')} />
        <input style={{ ...input, width: 160 }} placeholder="Role" value={form.role} onChange={set('role')} />
        <select style={input} value={form.dept} onChange={set('dept')}>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <input style={{ ...input, width: 180 }} placeholder="Photo URL" value={form.photo_url} onChange={set('photo_url')} />
        <button className="btn-3d" style={{ fontSize: 15, padding: '10px 18px' }} onClick={submit}>Add</button>
        {msg && <span style={{ color: msg === 'Added' ? 'var(--correct)' : 'var(--wrong)', fontWeight: 700, fontSize: 13 }}>{msg}</span>}
      </div>
    </section>
  )
}

function Roster() {
  const [rows, setRows] = useState([])
  const [dept, setDept] = useState('All')
  const [status, setStatus] = useState('All')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null) // id
  const [draft, setDraft] = useState({})

  const load = useCallback(() => {
    api.listEmployees(dept, status).then(setRows).catch(() => setRows([]))
  }, [dept, status])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = () => load()
    window.addEventListener('roster-refresh', h)
    return () => window.removeEventListener('roster-refresh', h)
  }, [load])

  const startEdit = (e) => { setEditing(e.id); setDraft({ role: e.role, dept: e.dept }) }
  const saveEdit = async (id) => {
    await api.updateEmployee(id, draft)
    setEditing(null)
    load()
  }
  const toggleStatus = async (e) => {
    await api.updateEmployee(e.id, { status: e.status === 'active' ? 'retired' : 'active' })
    load()
  }

  const visible = rows.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <section style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
        <h2 style={{ ...h3, margin: 0 }}>Roster ({visible.length})</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input style={input} placeholder="Search name…" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select style={input} value={dept} onChange={(e) => setDept(e.target.value)}>
            <option>All</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="All">All status</option>
            <option value="active">Active</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 4 }}>
        {visible.map((e) => {
          const isEditing = editing === e.id
          return (
            <div key={e.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px',
              borderBottom: '1.5px solid var(--line)', opacity: e.status === 'retired' ? 0.55 : 1,
            }}>
              <Avatar person={{ ...e, hairColor: e.hair_color }} size={38} photoUrl={undefined} />
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{e.name}</div>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <input style={{ ...input, padding: '5px 8px', width: 150 }} value={draft.role}
                      onChange={(ev) => setDraft((d) => ({ ...d, role: ev.target.value }))} />
                    <select style={{ ...input, padding: '5px 8px' }} value={draft.dept}
                      onChange={(ev) => setDraft((d) => ({ ...d, dept: ev.target.value }))}>
                      {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                ) : (
                  <div style={{ color: 'var(--ink-soft)', fontSize: 12 }}>{e.role} · {e.dept}</div>
                )}
              </div>
              {!e.quizzable && e.status === 'active' && (
                <span title="No photo — excluded from quizzes" style={{ fontSize: 11, fontWeight: 800, color: 'var(--wrong)' }}>NO PHOTO</span>
              )}
              {e.admin_locked && <span title="Admin-edited (protected from re-sync)" style={{ fontSize: 11 }}>🔒</span>}
              <span style={{
                fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 999,
                background: e.status === 'active' ? 'var(--correct-soft)' : 'var(--bg2)',
                color: e.status === 'active' ? 'var(--correct)' : 'var(--ink-soft)',
              }}>{e.status}</span>
              {isEditing ? (
                <>
                  <button style={secondaryBtn({ color: 'var(--primary-dk)' })} onClick={() => saveEdit(e.id)}>Save</button>
                  <button style={secondaryBtn()} onClick={() => setEditing(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <button style={secondaryBtn()} onClick={() => startEdit(e)}>Edit</button>
                  <button style={secondaryBtn({ color: e.status === 'active' ? 'var(--wrong)' : 'var(--primary-dk)' })} onClick={() => toggleStatus(e)}>
                    {e.status === 'active' ? 'Retire' : 'Activate'}
                  </button>
                </>
              )}
            </div>
          )
        })}
        {visible.length === 0 && <p style={{ color: 'var(--ink-soft)', textAlign: 'center', padding: '16px 0' }}>No employees match.</p>}
      </div>
    </section>
  )
}
