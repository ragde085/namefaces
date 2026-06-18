// Quiz construction + scoring. Mirrors design handoff behavior.
// PRODUCTION: question generation should move server-side.

import { PEOPLE } from './seed'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Pick `quizLength` distinct people; alternate mode by index (even=name, odd=face);
// add 3 random distractors; shuffle the 4 choices.
export function buildQuiz(quizLength = 8) {
  const pool = PEOPLE.filter((p) => true) // PRODUCTION: filter photoless out
  const answers = shuffle(pool).slice(0, quizLength)
  return answers.map((person, i) => {
    const distractors = shuffle(pool.filter((p) => p.id !== person.id)).slice(0, 3)
    const choices = shuffle([person, ...distractors])
    return {
      mode: i % 2 === 0 ? 'name' : 'face',
      person,
      choices,
    }
  })
}

// Time-weighted scoring: correct = 100 + timeLeft*10; wrong/timeout = 0.
export function scoreAnswer(correct, timeLeft) {
  return correct ? 100 + timeLeft * 10 : 0
}

export function accuracyPct(correct, total) {
  return total ? Math.round((correct / total) * 100) : 0
}
