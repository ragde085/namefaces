// Client-side scoring helpers (questions now come from the backend /quiz API).

// Time-weighted scoring: correct = 100 + timeLeft*10; wrong/timeout = 0.
export function scoreAnswer(correct, timeLeft) {
  return correct ? 100 + timeLeft * 10 : 0
}

export function accuracyPct(correct, total) {
  return total ? Math.round((correct / total) * 100) : 0
}
