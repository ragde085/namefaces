import { useCallback, useEffect, useState } from 'react'
import { api, setUserEmail } from './lib/api'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import Quiz from './screens/Quiz'
import Results from './screens/Results'
import Leaderboard from './screens/Leaderboard'
import Admin from './screens/Admin'

export default function App() {
  const [screen, setScreen] = useState('login')
  const [theme, setTheme] = useState('fresh')
  const [user, setUser] = useState(null)
  const [history, setHistory] = useState([])
  const [config, setConfig] = useState({ quizLength: 8, timerSeconds: 15 })
  const [lastEntry, setLastEntry] = useState(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const refreshHistory = useCallback(async () => {
    try {
      setHistory(await api.history())
    } catch {
      setHistory([])
    }
  }, [])

  const refreshConfig = useCallback(async () => {
    try {
      const c = await api.getConfig()
      setConfig({ quizLength: c.quiz_length, timerSeconds: c.timer_seconds })
    } catch {
      /* keep defaults */
    }
  }, [])

  const onLogin = async (email) => {
    setUserEmail(email)
    const me = await api.me()
    setUser(me)
    await Promise.all([refreshHistory(), refreshConfig()])
    setScreen('dashboard')
  }

  const onFinish = async (entry) => {
    setLastEntry(entry)
    await refreshHistory()
    setScreen('results')
  }

  const onLogout = () => {
    setUserEmail(null)
    setUser(null)
    setHistory([])
    setLastEntry(null)
    setScreen('login')
  }

  const nav = (s) => setScreen(s)
  const props = { theme, setTheme, user, history, config, setConfig, nav, refreshConfig, onLogout }

  switch (screen) {
    case 'login':
      return <Login {...props} onLogin={onLogin} />
    case 'dashboard':
      return <Dashboard {...props} />
    case 'quiz':
      return <Quiz {...props} onFinish={onFinish} />
    case 'results':
      return <Results {...props} lastEntry={lastEntry} />
    case 'leaderboard':
      return <Leaderboard {...props} />
    case 'admin':
      return <Admin {...props} />
    default:
      return null
  }
}
