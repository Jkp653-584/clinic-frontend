import { useState } from 'react'
import Profile from './Profile'
import Appointments from './Appointments'

export default function PatientApp({
  user,
  onLogout,
}: {
  user: any
  onLogout: () => void
}) {
  const [page, setPage] = useState<'profile' | 'appointments'>('profile')

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🧑‍⚕️ Patient</h2>
        <button onClick={() => setPage('profile')}>My Profile</button>
        <button onClick={() => setPage('appointments')}>Appointments</button>
        <button className="logout" onClick={onLogout}>Logout</button>
      </aside>

      <main className="main">
        <header className="topbar">
          Welcome, {user.username}
        </header>

        {page === 'profile' && <Profile />}
        {page === 'appointments' && <Appointments />}
      </main>
    </div>
  )
}