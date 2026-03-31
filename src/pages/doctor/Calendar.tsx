import { useState } from "react"

type Appointment = {
  time: string
  name: string
  symptom: string
}

export default function Calendar() {
  const [selectedDay, setSelectedDay] = useState(6)

  const days = Array.from({ length: 28 }, (_, i) => i + 1)

  const appointments: Appointment[] = [
    { time: "09:30", name: "สมชาย สุขใจ", symptom: "มีไข้ ไอ เจ็บคอ" },
    { time: "10:30", name: "สมหญิง สุขสัน", symptom: "ปวดท้อง แน่นท้อง" },
    { time: "13:00", name: "สายลม ตอนเย็น", symptom: "ผื่นขึ้นตามตัว" },
    { time: "16:00", name: "สายลม คนเข้ม", symptom: "ปวดศีรษะเรื้อรัง" },
  ]

  // 🔥 future API
  // useEffect(() => {
  //   fetchCalendarApi(selectedDay).then(setAppointments)
  // }, [selectedDay])

  return (
    <div className="calendar-container">

      <h2 className="section-header">รายชื่อคนไข้วันนี้</h2>

      <div className="calendar-header">
        ◀ กุมภาพันธ์ 2569 ▶
      </div>

      <div className="calendar-grid">
        {days.map(d => (
          <div
            key={d}
            className={`day ${selectedDay === d ? "active" : ""}`}
            onClick={() => setSelectedDay(d)}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="appointment-list">
        {appointments.map((a, i) => (
          <div key={i} className="appointment-item">
            <span className="time">{a.time}</span>
            <span className="name">{a.name}</span>
            <span className="symptom">{a.symptom}</span>
          </div>
        ))}
      </div>

    </div>
  )
}