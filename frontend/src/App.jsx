import { useEffect, useState } from 'react'
import { loadHistory } from './lib/storage'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import Quiz from './screens/Quiz'
import Results from './screens/Results'
import Leaderboard from './screens/Leaderboard'

// Configurable props (Tweaks) — see DESIGN_SPEC §5.
const CONFIG = { quizLength: 8, timerSeconds: 15 }

export default function App() {
  const [screen, setScreen] = useState('login')
  const [theme, setTheme] = useState('fresh')
  const [user, setUser] = useState(null)
  const [history, setHistory] = useState(() => loadHistory())
  const [lastEntry, setLastEntry] = useState(null)

  // Apply theme to <html data-theme>.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const nav = (s) => setScreen(s)

  const props = { theme, setTheme, user, history, config: CONFIG, nav }

  switch (screen) {
    case 'login':
      return <Login {...props} onLogin={(u) => { setUser(u); nav('dashboard') }} />
    case 'dashboard':
      return <Dashboard {...props} />
    case 'quiz':
      return (
        <Quiz
          {...props}
          onFinish={(entry, updatedHistory) => {
            setLastEntry(entry)
            setHistory(updatedHistory)
            nav('results')
          }}
        />
      )
    case 'results':
      return <Results {...props} lastEntry={lastEntry} />
    case 'leaderboard':
      return <Leaderboard {...props} />
    default:
      return null
  }
}
