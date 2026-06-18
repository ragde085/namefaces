// Quiz history persistence. Prototype: localStorage `nf_history`.
// PRODUCTION: back with the backend history API.

const KEY = 'nf_history'

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export function saveHistory(history) {
  try {
    localStorage.setItem(KEY, JSON.stringify(history))
  } catch {
    /* ignore quota / disabled storage */
  }
}

export function appendEntry(entry) {
  const history = loadHistory()
  const next = [entry, ...history]
  saveHistory(next)
  return next
}
