// API client. Dev auth: sends X-User-Email (backend stub).
// PRODUCTION: replace the email header with a Google OIDC Bearer token.

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

let userEmail = null
export function setUserEmail(email) { userEmail = email }

async function req(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (userEmail) headers['X-User-Email'] = userEmail
  const res = await fetch(BASE + path, { ...opts, headers })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`${res.status} ${path} ${detail}`)
  }
  return res.status === 204 ? null : res.json()
}

// Backend uses snake_case (hair_color); Avatar wants hairColor.
function normPerson(p) {
  return { ...p, hairColor: p.hair_color }
}
function normQuestion(q) {
  return { ...q, person: normPerson(q.person), choices: q.choices.map(normPerson) }
}
function normHistory(h) {
  return { ...h, ts: Date.parse(h.created_at) }
}

export const api = {
  me: () => req('/auth/me'),
  getQuiz: (length) => req(`/quiz${length ? `?length=${length}` : ''}`).then((q) => ({
    ...q,
    questions: q.questions.map(normQuestion),
  })),
  submitAttempt: (body) => req('/attempts', { method: 'POST', body: JSON.stringify(body) }),
  history: () => req('/history').then((rows) => rows.map(normHistory)),
  leaderboard: (window = 'all_time', dept = 'All') =>
    req(`/leaderboard?window=${window}&dept=${encodeURIComponent(dept)}`),

  // Config
  getConfig: () => req('/config'),
  updateConfig: (body) => req('/config', { method: 'PATCH', body: JSON.stringify(body) }),

  // Admin: roster
  listEmployees: (dept = 'All', status = 'All') =>
    req(`/employees?dept=${encodeURIComponent(dept)}&status=${status}`),
  createEmployee: (body) => req('/employees', { method: 'POST', body: JSON.stringify(body) }),
  updateEmployee: (id, body) =>
    req(`/employees/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  importEmployees: (rows) =>
    req('/employees/import', { method: 'POST', body: JSON.stringify(rows) }),
}
