import { useEffect, useMemo, useState } from "react"
import { useApi } from "../../api"

/* ---------- TYPE ---------- */
type Status =
  | "awaiting_checkin"
  | "checked_in"
  | "in_progress"
  | "dispensing"
  | "completed"
  | "cancelled"
  | "booked"

type Appointment = {
  id: number
  date: string
  time: string
  patient: string
  symptom: string
  status: Status | string
}

/* ---------- STATUS TEXT ---------- */
const statusText: Record<string, string> = {
  awaiting_checkin: "รอเช็คอิน",
  checked_in: "รอเรียก",
  in_progress: "กำลังตรวจ",
  dispensing: "รอจ่ายยา",
  completed: "เสร็จแล้ว",
  cancelled: "ยกเลิก",
  booked: "จองล่วงหน้า"
}

/* ---------- MAP API ---------- */
const mapAppointment = (a: any): Appointment => ({
  id: a.appointment_id,
  date: a.appointment_date,
  time: a.start_time.slice(0, 5),
  patient: a.patient_fullname,
  symptom: a.symptoms,
  status: a.status
})

export default function All() {
  const { getAllAppointmentsApi, updateAppointmentStatusApi } = useApi()
  const [data, setData] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<Status | "all">("all")
  const [date, setDate] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)

  /* ---------- FETCH ---------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllAppointmentsApi()
        setData(res.map(mapAppointment))
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [])

  /* ---------- FILTER DATE ---------- */
  const dateFiltered = useMemo(() => date ? data.filter(d => d.date === date) : data, [date, data])

  /* ---------- COUNT ---------- */
  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    dateFiltered.forEach(d => { result[d.status] = (result[d.status] || 0) + 1 })
    return result
  }, [dateFiltered])

  /* ---------- FILTER STATUS ---------- */
  const filtered = filter === "all" ? dateFiltered : dateFiltered.filter(d => d.status === filter)

  /* ---------- ACTION ---------- */
  const confirmCancel = async () => {
    if (!selectedId) return
    try {
      await updateAppointmentStatusApi(selectedId, "cancelled")
      setData(prev => prev.map(d => d.id === selectedId ? { ...d, status: "cancelled" } : d))
      setSelectedId(null)
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="appointment-page">
      <h1>นัดหมายทั้งหมด</h1>

      <div className="appointment-filter-bar">
        <div className="appointment-filter-left">
          <button onClick={() => setFilter("all")} className={`filter-btn ${filter === "all" ? "active" : ""}`}>ทั้งหมด ({dateFiltered.length})</button>
          <button onClick={() => setFilter("awaiting_checkin")} className={`filter-btn ${filter === "awaiting_checkin" ? "active" : ""}`}>รอเช็คอิน ({counts.awaiting_checkin || 0})</button>
          <button onClick={() => setFilter("checked_in")} className={`filter-btn ${filter === "checked_in" ? "active" : ""}`}>รอเรียก ({counts.checked_in || 0})</button>
          <button onClick={() => setFilter("cancelled")} className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}>ยกเลิก ({counts.cancelled || 0})</button>
          <button onClick={() => setFilter("booked")} className={`filter-btn ${filter === "booked" ? "active" : ""}`}>จองล่วงหน้า ({counts.booked || 0})</button>
        </div>

        <div className="appointment-filter-right">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="appointment-table-wrapper">
        <table className="appointment-table">
          <thead>
            <tr>
              <th>วันที่</th>
              <th>เวลา</th>
              <th>ผู้ป่วย</th>
              <th>อาการ</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="empty">ไม่มีข้อมูล</td></tr>
            )}
            {filtered.map(a => (
              <tr key={a.id}>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>{a.patient}</td>
                <td>{a.symptom}</td>
                <td className={`status status-${a.status}`}>{statusText[a.status]}</td>
                <td>
                  {a.status === "awaiting_checkin" && <button className="action-cancel" onClick={() => setSelectedId(a.id)}>ยกเลิก</button>}
                  {a.status !== "awaiting_checkin" && "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>ยืนยันการยกเลิกนัด?</h3>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSelectedId(null)}>ย้อนกลับ</button>
              <button className="btn-confirm" onClick={confirmCancel}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}