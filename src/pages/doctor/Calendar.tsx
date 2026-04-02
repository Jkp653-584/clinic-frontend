import { useEffect, useMemo, useState } from "react"
import { useApi } from "../../api"

/* ---------- TYPE ---------- */

type Appointment = {
  id: number
  date: string
  day: number
  time: string
  name: string
  symptom: string
}

/* ---------- MAP ---------- */

const mapAppointment = (a: any): Appointment => ({
  id: a.appointment_id,
  date: a.appointment_date,
  day: Number(a.appointment_date.split("-")[2]),
  time: a.start_time.slice(0, 5),
  name: a.patient_fullname,
  symptom: a.symptoms
})

export default function Calendar() {

  const { getMyAppointmentsApi } = useApi()

  const today = new Date()

  const [currentMonth, setCurrentMonth] = useState(
    today.toISOString().slice(0, 7)
  )

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  /* ---------- FETCH ---------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getMyAppointmentsApi()
        setAppointments(res.map(mapAppointment))
      } catch (err) {
        console.error(err)
      }
    }

    fetchData()
  }, [])

  /* ---------- CALENDAR DAYS ---------- */

  const calendarDays = useMemo(() => {

    const [year, month] = currentMonth.split("-").map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()

    const list: {
      date: string
      day: number
      hasAppointment: boolean
    }[] = []

    for (let i = 1; i <= daysInMonth; i++) {

      const date = `${currentMonth}-${String(i).padStart(2, "0")}`

      const hasAppointment = appointments.some(a => a.date === date)

      list.push({
        date,
        day: i,
        hasAppointment
      })
    }

    return list

  }, [currentMonth, appointments])

  /* ---------- FILTER DAY ---------- */

  const dayAppointments = useMemo(() => {
    if (!selectedDate) return []
    return appointments
      .filter(a => a.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [selectedDate, appointments])

  /* ---------- MONTH NAV ---------- */

  const handlePrevMonth = () => {
    const date = new Date(currentMonth + "-01")
    date.setMonth(date.getMonth() - 1)
    setCurrentMonth(date.toISOString().slice(0, 7))
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    const date = new Date(currentMonth + "-01")
    date.setMonth(date.getMonth() + 1)
    setCurrentMonth(date.toISOString().slice(0, 7))
    setSelectedDate(null)
  }

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + "-01")
    return date.toLocaleDateString("th-TH", {
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="appointment-page">

      <h1>ปฏิทินนัดหมาย</h1>
      <p>ดูคิวของคุณในแต่ละวัน</p>

      {/* MONTH HEADER */}
      <div className="calendar-header">
        <button className="nav-btn" onClick={handlePrevMonth}>‹</button>
        <div className="month-label">{formatMonth(currentMonth)}</div>
        <button className="nav-btn" onClick={handleNextMonth}>›</button>
      </div>

      {/* CALENDAR */}
      <div className="calendar-grid">

        {calendarDays.map(day => (
          <button
            key={day.date}
            className={`calendar-day 
              ${selectedDate === day.date ? "active" : ""}
            `}
            onClick={() => setSelectedDate(day.date)}
          >
            {day.day}

            {/* 🔥 จุดแสดงว่ามีคิว */}
            {day.hasAppointment && (
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  margin: "4px auto 0"
                }}
              />
            )}
          </button>
        ))}

      </div>

      {/* LIST */}
      {selectedDate && (

        <div style={{ marginTop: "20px" }}>

          <h3>รายการวันที่ {selectedDate}</h3>

          <div className="appointment-table-wrapper">

            <table className="appointment-table">

              <thead>
                <tr>
                  <th>เวลา</th>
                  <th>ผู้ป่วย</th>
                  <th>อาการ</th>
                </tr>
              </thead>

              <tbody>

                {dayAppointments.length === 0 && (
                  <tr>
                    <td colSpan={3} className="empty">
                      ไม่มีคิว
                    </td>
                  </tr>
                )}

                {dayAppointments.map(a => (
                  <tr key={a.id}>
                    <td>{a.time}</td>
                    <td>{a.name}</td>
                    <td>{a.symptom}</td>
                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  )
}