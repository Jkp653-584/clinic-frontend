import { useEffect, useState } from 'react'
import { useApi } from './api'
import './App.css'
import AuthPopup from './AuthPopup'
import Home from './Home'
import DoctorApp from './pages/doctor/DoctorApp'
import PatientApp from './pages/patient/PatientApp'

type User = {
  id: number
  username: string,
  role: 'patient' | 'doctor'
}

function App() {
  const { getMeApi , logoutApi } = useApi()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

  /* ---------- INIT ---------- */
  useEffect(() => {
    async function init() {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const me = await getMeApi()
        setUser(me)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  async function handleLogout() {
    try {
      await logoutApi()
    } catch (e) {
      console.warn('logout api failed', e)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  /* ---------- LOADING ---------- */
  if (loading) return <div className="center">Loading...</div>


  // ================= NOT LOGIN → HOME =================
  if (!user) {
    return (
      <>
        <Home onLoginClick={() => setShowAuth(true)} />
        {showAuth && (
          <AuthPopup
            onAuthSuccess={() => window.location.reload()}
            onClose={() => setShowAuth(false)}
          />
        )}
      </>
    )
  }

  /* ---------- ROLE BASE ---------- */
  if (user.role === 'doctor') {
    return <DoctorApp user={user} onLogout={handleLogout} />
  }

  return <PatientApp user={user} onLogout={handleLogout} />
}

export default App
