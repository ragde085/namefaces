// Merge seeded colleagues with a "You" entry; sort desc; assign ranks.
// PRODUCTION: served by backend (weekly + all-time windows, tie-break earliest).

import { PEOPLE } from './seed'

export function buildLeaderboard(user, history, deptFilter = 'All') {
  const youTotal = history.reduce((s, h) => s + h.score, 0)
  const you = {
    id: 'you',
    first: user?.first || 'You',
    name: user?.name || 'You',
    role: 'You',
    dept: user?.dept || 'Engineering',
    points: youTotal,
    isYou: true,
  }
  let rows = [...PEOPLE.map((p) => ({ ...p })), you]
  rows.sort((a, b) => b.points - a.points)
  rows = rows.map((r, i) => ({ ...r, rank: i + 1 }))
  if (deptFilter !== 'All') rows = rows.filter((r) => r.dept === deptFilter)
  return rows
}

export function userStats(user, history) {
  const quizzes = history.length
  const best = history.reduce((m, h) => Math.max(m, h.score), 0)
  const avgAcc = quizzes
    ? Math.round(history.reduce((s, h) => s + h.accuracy, 0) / quizzes)
    : 0
  return { quizzes, best, avgAcc }
}
