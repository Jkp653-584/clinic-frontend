import { useState, useMemo } from "react"
import { useApi } from "../../api"

/* ---------- TYPE ---------- */

type Status =
  | "awaiting_checkin"
  | "checked_in"
  | "cancelled"

type Appointment = {
  id: number
  date: string
  time: string
  patient: string
  status: Status
}

/* ---------- STATUS TEXT ---------- */

const statusText: Record<Status, string> = {
  awaiting_checkin: "รอเช็คอิน",
  checked_in: "เช็คอินแล้ว",
  cancelled: "ยกเลิก"
}

export default function All() {

  const { updateAppointmentStatusApi } = useApi()

  const [filter, setFilter] = useState<Status | "all">("all")
  const [date, setDate] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)

  /* ---------- MOCK DATA ---------- */

  const [data, setData] = useState<Appointment[]>([
    { id: 1, date: "2026-03-21", time: "09:00", patient: "สมชาย", status: "awaiting_checkin" },
    { id: 2, date: "2026-03-21", time: "09:30", patient: "อรทัย", status: "checked_in" },
    { id: 3, date: "2026-03-22", time: "10:00", patient: "ธนา", status: "awaiting_checkin" },
    { id: 4, date: "2026-03-22", time: "10:30", patient: "กนก", status: "cancelled" },
  ])

  /* ---------- FILTER DATE ---------- */

  const dateFiltered = useMemo(() => {
    if (!date) return data
    return data.filter(d => d.date === date)
  }, [date, data])

  /* ---------- COUNT ---------- */

  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    dateFiltered.forEach(d => {
      result[d.status] = (result[d.status] || 0) + 1
    })
    return result
  }, [dateFiltered])

  /* ---------- FILTER STATUS ---------- */

  const filtered =
    filter === "all"
      ? dateFiltered
      : dateFiltered.filter(d => d.status === filter)

  /* ---------- ACTION ---------- */

  const confirmCancel = async () => {
    if (!selectedId) return

    try {
      await updateAppointmentStatusApi(selectedId, "cancelled")

      setData(prev =>
        prev.map(d =>
          d.id === selectedId ? { ...d, status: "cancelled" } : d
        )
      )

      setSelectedId(null)

    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="appointment-page">

      <h1>นัดหมายทั้งหมด</h1>

      {/* FILTER BAR */}
      <div className="appointment-filter-bar">

        <div className="appointment-filter-left">

          <button
            onClick={() => setFilter("all")}
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
          >
            ทั้งหมด ({dateFiltered.length})
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
            เช็คอินแล้ว ({counts.checked_in || 0})
          </button>

          <button
            onClick={() => setFilter("cancelled")}
            className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}
          >
            ยกเลิก ({counts.cancelled || 0})
          </button>

        </div>

        <div className="appointment-filter-right">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

      </div>

      {/* TABLE */}
      <div className="appointment-table-wrapper">

        <table className="appointment-table">

          <thead>
            <tr>
              <th>วันที่</th>
              <th>เวลา</th>
              <th>ผู้ป่วย</th>
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

            {filtered.map((a) => (
              <tr key={a.id}>

                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>{a.patient}</td>

                <td className={`status status-${a.status}`}>
                  {statusText[a.status]}
                </td>

                <td>

                  {a.status === "awaiting_checkin" && (
                    <button
                      className="action-cancel"
                      onClick={() => setSelectedId(a.id)}
                    >
                      ยกเลิก
                    </button>
                  )}

                  {a.status !== "awaiting_checkin" && "-"}

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL CONFIRM */}
      {selectedId && (
        <div className="modal-overlay">
          <div className="modal">

            <h3>ยืนยันการยกเลิกนัด?</h3>

            <div className="modal-actions">

              <button
                className="btn-cancel"
                onClick={() => setSelectedId(null)}
              >
                ย้อนกลับ
              </button>

              <button
                className="btn-confirm"
                onClick={confirmCancel}
              >
                ยืนยัน
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}