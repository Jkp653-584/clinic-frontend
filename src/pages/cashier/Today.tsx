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

type Appointment = {
  id: number
  date: string
  time: string
  patient: string
  symptom: string
  status: Status
}

/* ---------- STATUS TEXT ---------- */
const statusText: Record<Status, string> = {
  awaiting_checkin: "รอเช็คอิน",
  checked_in: "รอเรียก",
  in_progress: "กำลังตรวจ",
  dispensing: "รอจ่ายยา",
  completed: "เสร็จแล้ว",
  cancelled: "ยกเลิก"
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

export default function Today() {
  const { getAllAppointmentsApi, updateAppointmentStatusApi } = useApi()
  const [data, setData] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<Status | "all">("all")
  const [selected, setSelected] = useState<{
    id: number
    type: "checkin" | "cancel" | "dispensed"
  } | null>(null)

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

  /* ---------- TODAY FILTER ---------- */
  const today = new Date().toLocaleDateString("sv-SE")
  const visibleStatuses: Status[] = [
    "awaiting_checkin",
    "checked_in",
    "in_progress",
    "dispensing",
    "completed",
    "cancelled"
  ]

  const todayData = useMemo(
    () =>
      data
        .filter(d => d.date === today)
        .filter(d => visibleStatuses.includes(d.status)),
    [data]
  )

  /* ---------- COUNT ---------- */
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    todayData.forEach(d => {
      c[d.status] = (c[d.status] || 0) + 1
    })
    return c
  }, [todayData])

  /* ---------- FILTER ---------- */
  const filtered = filter === "all" ? todayData : todayData.filter(d => d.status === filter)

  /* ---------- ACTION ---------- */
  const confirmAction = async () => {
    if (!selected) return
    try {
      let newStatus: Status
      if (selected.type === "checkin") newStatus = "checked_in"
      else if (selected.type === "cancel") newStatus = "cancelled"
      else newStatus = "completed" // dispensing → completed

      await updateAppointmentStatusApi(selected.id, newStatus)
      setData(prev =>
        prev.map(d => (d.id === selected.id ? { ...d, status: newStatus } : d))
      )
      setSelected(null)
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="appointment-page">
      <h1>นัดหมายวันนี้</h1>

      <div className="appointment-filters">
        <button
          onClick={() => setFilter("all")}
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
        >
          ทั้งหมด ({todayData.length})
        </button>
        <button
          onClick={() => setFilter("awaiting_checkin")}
          className={`filter-btn ${filter === "awaiting_checkin" ? "active" : ""}`}
        >
          รอเช็คอิน ({counts.awaiting_checkin || 0})
        </button>
        <button
          onClick={() => setFilter("checked_in")}
          className={`filter-btn ${filter === "checked_in" ? "active" : ""}`}
        >
          รอเรียก ({counts.checked_in || 0})
        </button>
        <button
          onClick={() => setFilter("in_progress")}
          className={`filter-btn ${filter === "in_progress" ? "active" : ""}`}
        >
          กำลังตรวจ ({counts.in_progress || 0})
        </button>
        <button
          onClick={() => setFilter("dispensing")}
          className={`filter-btn ${filter === "dispensing" ? "active" : ""}`}
        >
          รอจ่ายยา ({counts.dispensing || 0})
        </button>
      </div>

      <div className="appointment-table-wrapper">
        <table className="appointment-table">
          <thead>
            <tr>
              <th>เวลา</th>
              <th>ผู้ป่วย</th>
              <th>อาการ</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}
            {filtered.map(a => (
              <tr key={a.id}>
                <td>{a.time}</td>
                <td>{a.patient}</td>
                <td>{a.symptom}</td>
                <td className={`status status-${a.status}`}>{statusText[a.status]}</td>
                <td>
                  {a.status === "awaiting_checkin" && (
                    <>
                      <button onClick={() => setSelected({ id: a.id, type: "checkin" })}>
                        เช็คอิน
                      </button>
                      <button
                        className="action-cancel"
                        onClick={() => setSelected({ id: a.id, type: "cancel" })}
                      >
                        ยกเลิก
                      </button>
                    </>
                  )}
                  {a.status === "dispensing" && (
                    <button onClick={() => setSelected({ id: a.id, type: "dispensed" })}>
                      จ่ายยาแล้ว
                    </button>
                  )}
                  {a.status !== "awaiting_checkin" && a.status !== "dispensing" && "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {selected.type === "checkin"
                ? "ยืนยันเช็คอิน?"
                : selected.type === "cancel"
                ? "ยืนยันยกเลิก?"
                : "ยืนยันจ่ายยา?"}
            </h3>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSelected(null)}>
                ย้อนกลับ
              </button>
              <button className="btn-confirm" onClick={confirmAction}>ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}