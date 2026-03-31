import { useState, useMemo } from "react"

type Status = "waiting" | "progress" | "done" | "cancel"

type Appointment = {
  id: number
  date: string // YYYY-MM-DD (สำคัญสำหรับ API)
  time: string
  patient: string
  symptom: string
  status: Status
}

const statusText: Record<Status, string> = {
  waiting: "รอเช็คอิน",
  progress: "กำลังรักษา",
  done: "เสร็จแล้ว",
  cancel: "ยกเลิก"
}

export default function All() {

  const [filter, setFilter] = useState<Status | "all">("all")
  const [date, setDate] = useState("")

  /* MOCK DATA */
  const data: Appointment[] = [
    { id: 1, date: "2026-03-21", time: "09:00", patient: "สมชาย", symptom: "มีไข้", status: "waiting" },
    { id: 2, date: "2026-03-21", time: "09:30", patient: "อรทัย", symptom: "ปวดหัว", status: "progress" },
    { id: 3, date: "2026-03-22", time: "10:00", patient: "ธนา", symptom: "ตรวจสุขภาพ", status: "done" },
    { id: 4, date: "2026-03-22", time: "10:30", patient: "กนก", symptom: "เจ็บคอ", status: "cancel" },
  ]

  /* ✅ filter ตามวันที่ */
  const dateFiltered = useMemo(() => {
    if (!date) return data
    return data.filter(d => d.date === date)
  }, [date, data])

  /* ✅ count */
  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    dateFiltered.forEach(d => {
      result[d.status] = (result[d.status] || 0) + 1
    })
    return result
  }, [dateFiltered])

  /* ✅ filter status */
  const filtered =
    filter === "all"
      ? dateFiltered
      : dateFiltered.filter(d => d.status === filter)

  return (
    <div className="appointment-page">

      <h1>นัดหมายทั้งหมด</h1>



      {/* FILTER */}
      <div className="appointment-filter-bar">
        <div className="appointment-filter-left">
          <button onClick={() => setFilter("all")} className="filter-btn">
            ทั้งหมด ({dateFiltered.length})
          </button>

          <button onClick={() => setFilter("waiting")} className="filter-btn">
            รอเช็คอิน ({counts.waiting || 0})
          </button>

          <button onClick={() => setFilter("progress")} className="filter-btn">
            กำลังรักษา ({counts.progress || 0})
          </button>

          <button onClick={() => setFilter("done")} className="filter-btn">
            เสร็จแล้ว ({counts.done || 0})
          </button>

          <button onClick={() => setFilter("cancel")} className="filter-btn">
            ยกเลิก ({counts.cancel || 0})
          </button>
        </div>
        <div className="appointment-filter-right" style={{ marginTop: "-14px"}}>
          {/* DATE FILTER */}
          <div className="filter-row">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="appointment-table-wrapper">
        <div className="appointment-table-area">

          <table className="appointment-table">
            <thead>
              <tr>
                <th>วันที่</th>
                <th>เวลา</th>
                <th>ผู้ป่วย</th>
                <th>อาการ</th>
                <th>สถานะ</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>{a.patient}</td>
                  <td>{a.symptom}</td>
                  <td className={`status status-${a.status}`}>
                    {statusText[a.status]}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      </div>

    </div>
  )
}