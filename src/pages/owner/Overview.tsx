import { useEffect, useState } from "react"
import { useApi } from "../../api"

type DashboardStats = {
  success: boolean
  today: {
    total_patients: number
    booked_appointments: number
    in_progress: number
    cancelled: number
  }
  completed_last_7_days: {
    date: string
    count: number
  }[]
}

type Incident = {
  report_id: number
  title: string
  description: string
  reported_date: string
  reported_time: string
  owner_notes: string | null
  reported_by_id: number
  reported_by_username: string
  reported_by_role: string
}

export default function Overview() {
  const { getDashboardStatsApi, getAllIncidentsApi } = useApi()
  const [loading, setLoading] = useState(false)

  const [stats, setStats] = useState({
    today: 0,
    appointments: 0,
    treating: 0,
    cancel: 0,
  })

  const [chartData, setChartData] = useState<number[]>([])
  const [events, setEvents] = useState<Incident[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 1️⃣ dashboard stats
        const dash: DashboardStats = await getDashboardStatsApi()
        setStats({
          today: dash.today.total_patients,
          appointments: dash.today.booked_appointments,
          treating: dash.today.in_progress,
          cancel: dash.today.cancelled,
        })
        setChartData(dash.completed_last_7_days.map((d) => d.count))

        // 2️⃣ incidents
        const incidentsRes = await getAllIncidentsApi()
        setEvents(incidentsRes.data)
      } catch (err: any) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="owner-page overview-page">
      <h1>ภาพรวมการดำเนินงานคลินิก</h1>

      {/* STAT CARDS */}
      <div className="stats">
        <div className="card">
          <p>คนไข้วันนี้</p>
          <h2>{stats.today}</h2>
        </div>
        <div className="card orange">
          <p>นัดหมายวันนี้</p>
          <h2>{stats.appointments}</h2>
        </div>
        <div className="card blue">
          <p>กำลังรักษา</p>
          <h2>{stats.treating}</h2>
        </div>
        <div className="card red">
          <p>ยกเลิกนัด</p>
          <h2>{stats.cancel}</h2>
        </div>
      </div>

      {/* CHART */}
      <div className="chart-box">
        <p>จำนวนผู้ป่วยย้อนหลัง 7 วัน</p>
        <div className="chart">
          {chartData.map((v, i) => (
            <div key={i} className="dot" style={{ bottom: v * 2 }} />
          ))}
        </div>
      </div>

      {/* EVENTS TABLE */}
      <div className="event-box">
        <p style={{ display: 'flex', justifyContent: 'center' }}>เหตุการณ์จากพนักงาน (วันนี้)</p>
        <table className="modern-table">
          <thead>
            <tr>
              <th>ประเภทเหตุการณ์</th>
              <th>วัน/เดือน/ปี เวลา</th>
              <th>รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.report_id}>
                <td>{e.title}</td>
                <td>{`${e.reported_date} ${e.reported_time}`}</td>
                <td>{e.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}