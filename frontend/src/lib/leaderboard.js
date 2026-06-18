// Player stats derived from history (history + leaderboard now come from the API).

export function userStats(_user, history) {
  const quizzes = history.length
  const best = history.reduce((m, h) => Math.max(m, h.score), 0)
  const avgAcc = quizzes
    ? Math.round(history.reduce((s, h) => s + h.accuracy, 0) / quizzes)
    : 0
  return { quizzes, best, avgAcc }
}
