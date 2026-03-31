import { useEffect, useState } from 'react'
import { useApi } from './api'
import AuthPopup from './components/AuthPopup'
import Home from './Home'
import RoleLayout from './components/RoleLayout'
import { Routes, Route, Navigate } from "react-router-dom"
export type User =
  | ({
    role: "patient";
  } & PatientProfile)
  | ({
    role: "doctor";
  } & DoctorProfile)
  | ({
    role: "staff";
  } & CashierProfile)
  | {
    role: "owner";
    username: string;
    email: string;
  };

export type PatientProfile = {
  user_id: number;
  username: string;
  email: string;
  role: "patient";
  first_name: string;
  last_name: string;
  phone_number: string;
  birth_date: string;
  gender: string;
  id_card_number: string;
};

export type DoctorProfile = {
  user_id: number;
  username: string;
  email: string;
  role: "doctor";
  first_name: string;
  last_name: string;
  specialization: string;
  license_number: string;
  phone_number: string;
  created_at: string;
};

export type CashierProfile = {
  user_id: number;
  username: string;
  email: string;
  role: "staff";
  first_name: string;
  last_name: string;
  phone_number: string;
  id_card_number: string;
  position: string;
  created_at: string;
};

function App() {
  const { getMeApi, logoutApi } = useApi()

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

  if (loading) return <div className="center">Loading...</div>

  /* ---------- NOT LOGIN ---------- */

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

  return (
    <Routes>
      <Route path="/:role/*" element={
        <RoleLayout user={user} setUser={setUser} onLogout={handleLogout} />
      } />

      <Route path="*" element={<Navigate to={`/${user.role}`} />} />
    </Routes>
  )
}

export default App