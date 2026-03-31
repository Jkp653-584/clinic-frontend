import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from "react-router-dom"

import Appointments2 from '../pages/patient/Appointments'
import History from '../pages/patient/History'
import Chatbot from '../pages/patient/Chatbot'
import Profile from '../pages/patient/Profile'

import TodayCashier from '../pages/cashier/Today'
import AllCashier from '../pages/cashier/All'
import SearchCashier from '../pages/cashier/Search'
import IncidentReport from '../pages/cashier/Incident'

import TodayQueue from '../pages/doctor/TodayQueue'
import Calendar from '../pages/doctor/Calendar'
import DoctorPatients from '../pages/doctor/Patients'

import OwnerOverview from '../pages/owner/Overview'
import ManageDoctors from '../pages/owner/ManageDoctors'
import ManageStaff from '../pages/owner/ManageStaff'
import OwnerPatients from '../pages/owner/Patients'

import type { User } from '../App'
import Settings from '../pages/Settings'

export default function RoleLayout({
  user,
  setUser,
  onLogout,
}: {
  user: User
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  onLogout: () => void
}) {

  const roleConfig = {

    patient: {
      title: 'ผู้ป่วย',
      pages: [
        { key: 'appointments', label: 'นัดหมาย' },
        { key: 'history', label: 'ประวัติ/สถานะ' },
        { key: 'profile', label: 'โปรไฟล์' },
        { key: 'chatbot', label: 'แชทบอท' },
        { key: 'settings', label: 'ตั้งค่า' },
      ],
    },

    staff: {
      title: 'พนักงานหน้าเค้าเตอร์',
      pages: [
        { key: 'today', label: 'นัดหมายวันนี้' },
        { key: 'all', label: 'นัดหมายทั้งหมด' },
        { key: 'search', label: 'ค้นหาคนไข้' },
        { key: 'incident', label: 'รายงานเหตุการณ์' },
        { key: 'settings', label: 'ตั้งค่า' },
      ],
    },

    doctor: {
      title: 'หมอ',
      pages: [
        { key: 'todayQueue', label: 'คิวตรวจวันนี้' },
        { key: 'calendar', label: 'ปฏิทิน' },
        { key: 'patients', label: 'รายชื่อคนไข้ที่ดูแล' },
        { key: 'settings', label: 'ตั้งค่า' },
      ],
    },

    owner: {
      title: 'เจ้าของคลินิก',
      pages: [
        { key: 'overview', label: 'ภาพรวมคลินิก' },
        { key: 'manageDoctors', label: 'จัดการแพทย์' },
        { key: 'manageStaff', label: 'จัดการพนักงาน' },
        { key: 'patients', label: 'ข้อมูลผู้ป่วย' },
      ],
    },
  }

  const config = roleConfig[user.role]

  const navigate = useNavigate()
  const location = useLocation()

  // 👉 ดึง page จาก URL
  const page = location.pathname.split("/")[2] || config.pages[0].key

  // 🔥 STEP 4: กัน invalid page
  useEffect(() => {
    const valid = config.pages.some(p => p.key === page)

    if (!valid) {
      navigate(`/${user.role}/${config.pages[0].key}`, { replace: true })
    }
  }, [page, user.role])

  // 🔥 STEP 6: เข้า /role แล้ว redirect ไปหน้าแรก
  useEffect(() => {
    if (location.pathname === `/${user.role}`) {
      navigate(`/${user.role}/${config.pages[0].key}`, { replace: true })
    }
  }, [user.role])

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentPage = config.pages.find(p => p.key === page)

  return (
    <div className="app">

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>

        <div className="sidebar-header">
          <span className="clinic-icon">🏥</span>
          <span className="clinic-name">NovaCare Clinic</span>
        </div>

        <div className="sidebar-menu">
          {config.pages.map(p => (
            <button
              key={p.key}
              onClick={() => {
                navigate(`/${user.role}/${p.key}`)
                setSidebarOpen(false)
              }}
              className={`nav-btn ${page === p.key ? 'active' : ''}`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>

      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main">

        <div className="topbar">

          <button
            className="hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          <div className="topbar-title">
            {currentPage?.label}
          </div>

          <div className="profile-icon">
            {user?.username?.[0]?.toUpperCase() || "?"}
          </div>

        </div>

        <div className="content">

          {/* patient pages */}
          {page === 'appointments' && user.role === 'patient' && <Appointments2 />}
          {page === 'history' && user.role === 'patient' && <History />}
          {page === 'profile' && user.role === 'patient' && <Profile user={user} setUser={setUser} />}
          {page === 'chatbot' && user.role === 'patient' && <Chatbot />}


          {/* cashier pages */}
          {page === 'today' && user.role === 'staff' && <TodayCashier />}
          {page === 'all' && user.role === 'staff' && <AllCashier />}
          {page === 'search' && user.role === 'staff' && <SearchCashier />}
          {page === 'incident' && user.role === 'staff' && <IncidentReport />}

          {/* doctor pages */}
          {page === 'todayQueue' && user.role === 'doctor' && <TodayQueue />}
          {page === 'calendar' && user.role === 'doctor' && <Calendar />}
          {page === 'patients' && user.role === 'doctor' && <DoctorPatients />}

          {/* owner pages */}
          {page === 'overview' && user.role === 'owner' && <OwnerOverview />}
          {page === 'manageDoctors' && user.role === 'owner' && <ManageDoctors />}
          {page === 'manageStaff' && user.role === 'owner' && <ManageStaff />}
          {page === 'patients' && user.role === 'owner' && <OwnerPatients />}

          {page === 'settings' && <Settings user={user} />}

        </div>

      </main>
    </div>
  )
}