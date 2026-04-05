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

  const [chartData, setChartData] = useState<{ date: string; count: number }[]>([])
  const [events, setEvents] = useState<Incident[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const dash: DashboardStats = await getDashboardStatsApi()

        setStats({
          today: dash.today.total_patients,
          appointments: dash.today.booked_appointments,
          treating: dash.today.in_progress,
          cancel: dash.today.cancelled,
        })

        setChartData(dash.completed_last_7_days)

        const incidentsRes = await getAllIncidentsApi()
        setEvents(incidentsRes.data)

      } catch (err: any) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>

  const max = Math.max(...chartData.map(d => d.count), 1)

  const width = 700
  const height = 220
  const paddingX = 50
  const paddingY = 30

  const usableWidth = width - paddingX * 2
  const usableHeight = height - paddingY * 2

  const points = chartData.map((d, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * usableWidth
    const y = height - paddingY - (d.count / max) * usableHeight
    return { x, y }
  })

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ")

  // 🔥 grid line (Y)
  const gridLines = 5
  const ySteps = Array.from({ length: gridLines + 1 }, (_, i) => i)

  return (
    <div className="owner-page overview-page">
      <h1>ภาพรวมการดำเนินงานคลินิก</h1>

      {/* STATS */}
      <div className="stats">
        <div className="card"><p>คนไข้วันนี้</p><h2>{stats.today}</h2></div>
        <div className="card orange"><p>นัดหมายวันนี้</p><h2>{stats.appointments}</h2></div>
        <div className="card blue"><p>กำลังรักษา</p><h2>{stats.treating}</h2></div>
        <div className="card red"><p>ยกเลิกนัด</p><h2>{stats.cancel}</h2></div>
      </div>

      {/* CHART */}
      <div className="chart-box">
        <p>จำนวนผู้ป่วยย้อนหลัง 7 วัน</p>

        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>

          {/* 🔥 background */}
          <rect
            x={paddingX}
            y={paddingY}
            width={usableWidth}
            height={usableHeight}
            fill="#f8fafc"
            rx="8"
          />

          {/* 🔥 grid */}
          {ySteps.map((step) => {
            const y =
              paddingY + (step / gridLines) * usableHeight

            return (
              <line
                key={step}
                x1={paddingX}
                x2={width - paddingX}
                y1={y}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="4"
              />
            )
          })}

          {/* 🔥 Y axis */}
          <line
            x1={paddingX}
            x2={paddingX}
            y1={paddingY}
            y2={height - paddingY}
            stroke="#9ca3af"
          />

          {/* 🔥 X axis */}
          <line
            x1={paddingX}
            x2={width - paddingX}
            y1={height - paddingY}
            y2={height - paddingY}
            stroke="#9ca3af"
          />

          {/* 🔥 line */}
          <path
            d={pathD}
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 🔥 dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#6366f1"
            />
          ))}

          {/* 🔥 X label */}
          {chartData.map((d, i) => {
            const x = paddingX + (i / (chartData.length - 1)) * usableWidth
            const date = new Date(d.date)

            return (
              <text
                key={i}
                x={x}
                y={height - 5}
                textAnchor="middle"
                fontSize="11"
              >
                {date.toLocaleDateString("th-TH", {
                  day: "2-digit",
                  month: "2-digit"
                })}
              </text>
            )
          })}

          {/* 🔥 Y label */}
          {ySteps.map((step) => {
            const value = Math.round((max / gridLines) * (gridLines - step))
            const y =
              paddingY + (step / gridLines) * usableHeight

            return (
              <text
                key={step}
                x={paddingX - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
              >
                {value}
              </text>
            )
          })}

        </svg>
      </div>

      {/* TABLE */}
      <div className="event-box">
        <p style={{ display: 'flex', justifyContent: 'center' }}>
          เหตุการณ์จากพนักงาน (วันนี้)
        </p>

        <table className="modern-table">
          <thead>
            <tr>
              <th>ประเภทเหตุการณ์</th>
              <th>วัน/เดือน/ปี เวลา</th>
              <th>รายละเอียด</th>
            </tr>
          </thead>
          <tbody>
            {events.map(e => (
              <tr key={e.report_id}>
                <td>{e.title}</td>
                <td>{e.reported_date} {e.reported_time}</td>
                <td>{e.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}