import { useState, useMemo } from "react"
import { useApi } from "../../api"

type Status =
  | "booked"
  | "awaiting_checkin"
  | "checked_in"
  | "in_progress"
  | "dispensing"
  | "completed"
  | "cancelled"

type Appointment = {
  id: number
  time: string
  patient: string
  status: Status
}

const statusText: Record<Status, string> = {
  booked: "นัดแล้ว",
  awaiting_checkin: "รอเช็คอิน",
  checked_in: "เช็คอินแล้ว",
  in_progress: "กำลังตรวจ",
  dispensing: "รอจ่ายยา",
  completed: "เสร็จแล้ว",
  cancelled: "ยกเลิก"
}

export default function Today() {
  const { updateAppointmentStatusApi } = useApi()

  const [filter, setFilter] = useState<
    "all" | "awaiting_checkin" | "checked_in" | "cancelled"
  >("all")

  const [loadingId, setLoadingId] = useState<number | null>(null)

  const [data, setData] = useState<Appointment[]>([
    { id: 1, time: "09:00", patient: "สมชาย", status: "awaiting_checkin" },
    { id: 2, time: "09:30", patient: "อรทัย", status: "checked_in" },
    { id: 3, time: "10:00", patient: "ธนา", status: "awaiting_checkin" },
    { id: 4, time: "10:30", patient: "กนก", status: "cancelled" },
  ])

  /* COUNT */
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    data.forEach(d => {
      if (["awaiting_checkin", "checked_in", "cancelled"].includes(d.status)) {
        c[d.status] = (c[d.status] || 0) + 1
      }
    })
    return c
  }, [data])

  /* FILTER */
  const filtered =
    filter === "all"
      ? data
      : data.filter(d => d.status === filter)

  /* 🔥 ACTION (FIXED) */
  const updateStatus = async (
    id: number,
    status: "checked_in" | "cancelled"
  ) => {
    try {
      setLoadingId(id)

      // ✅ FIX: ส่ง status ตรงๆ
      await updateAppointmentStatusApi(id, status)

      // ✅ update UI
      setData(prev =>
        prev.map(a =>
          a.id === id ? { ...a, status } : a
        )
      )
    } catch (err: any) {
      console.error(err)

      // 🔥 UX ดีกว่า alert ธรรมดา
      alert(err.message || "อัปเดตสถานะไม่สำเร็จ")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="appointment-page">

      <h1>เช็คอินผู้ป่วยวันนี้</h1>

      {/* FILTER */}
      <div className="appointment-filters">

        <button
          onClick={() => setFilter("all")}
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
        >
          ทั้งหมด ({data.length})
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

      {/* TABLE */}
      <div className="appointment-table-wrapper">
        <table className="appointment-table">

          <thead>
            <tr>
              <th>เวลา</th>
              <th>ผู้ป่วย</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>

          <tbody>

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="empty">
                  ไม่มีข้อมูล
                </td>
              </tr>
            )}

            {filtered.map((a) => (
              <tr key={a.id}>

                <td>{a.time}</td>
                <td>{a.patient}</td>

                <td className={`status status-${a.status}`}>
                  {statusText[a.status]}
                </td>

                <td>
                  {a.status === "awaiting_checkin" && (
                    <>
                      <button
                        disabled={loadingId === a.id}
                        onClick={() => updateStatus(a.id, "checked_in")}
                      >
                        {loadingId === a.id ? "..." : "เช็คอิน"}
                      </button>

                      <button
                        className="action-cancel"
                        disabled={loadingId === a.id}
                        onClick={() => updateStatus(a.id, "cancelled")}
                      >
                        ไม่มา
                      </button>
                    </>
                  )}

                  {a.status === "checked_in" && (
                    <span style={{ color: "#6b7280" }}>รอหมอ</span>
                  )}

                  {a.status === "cancelled" && (
                    <span style={{ color: "#6b7280" }}>ยกเลิกแล้ว</span>
                  )}
                </td>

              </tr>
            ))}

          </tbody>

        </table>
      </div>

    </div>
  )
}