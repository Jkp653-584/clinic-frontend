import { useState } from 'react'
import Dashboard from './Dashboard'
import Appointments from './Appointments'

export default function DoctorApp({
  user,
  onLogout,
}: {
  user: any
  onLogout: () => void
}) {
  const [page, setPage] = useState<'dashboard' | 'appointments'>('dashboard')

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🏥 Doctor</h2>
        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={() => setPage('appointments')}>Appointments</button>
        <button className="logout" onClick={onLogout}>Logout</button>
      </aside>

      <main className="main">
        <header className="topbar">
          Welcome, Dr. {user.username}
        </header>

        {page === 'dashboard' && <Dashboard />}
        {page === 'appointments' && <Appointments />}
      </main>
    </div>
  )
}