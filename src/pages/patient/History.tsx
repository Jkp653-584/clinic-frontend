import { useEffect, useState } from "react"
import { useApi } from "../../api"
import { useToast } from "../../components/ToastContext"

type AppointmentStatus =
  | "booked"
  | "awaiting_checkin"
  | "checked_in"
  | "in_progress"
  | "dispensing"
  | "completed"
  | "cancelled"

type AppointmentFilter = AppointmentStatus | "all"

type Appointment = {
  id: number
  date: string
  time: string
  doctor: string
  status: AppointmentStatus
}

const statusText: Record<AppointmentStatus, string> = {
  booked: "จองสำเร็จ",
  awaiting_checkin: "รอเช็คอิน",
  checked_in: "รอตรวจ",
  in_progress: "กำลังตรวจ",
  dispensing: "รอจ่ายยา",
  completed: "สำเร็จ",
  cancelled: "ยกเลิก",
}

const filters: { key: AppointmentFilter; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "booked", label: "จองสำเร็จ" },
  { key: "awaiting_checkin", label: "รอเช็คอิน" },
  { key: "checked_in", label: "รอตรวจ" },
  { key: "in_progress", label: "กำลังตรวจ" },
  { key: "dispensing", label: "รอจ่ายยา" },
  { key: "completed", label: "สำเร็จ" },
  { key: "cancelled", label: "ยกเลิก" },
]

export default function AppointmentHistory() {
  const { getMyAppointmentsApi, updateAppointmentStatusApi } = useApi()
  const { showToast } = useToast()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<AppointmentFilter>("all")
  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(false)

  // 🔥 confirm modal
  const [confirmId, setConfirmId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      const data = await getMyAppointmentsApi()

      const mapped: Appointment[] = data.map((a: any) => ({
        id: a.appointment_id,
        date: formatDate(a.appointment_date),
        time: a.start_time.slice(0, 5),
        doctor: a.doctor_fullname,
        status: a.status,
      }))

      setAppointments(mapped)
    } catch (err: any) {
      showToast("error", err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirmId) return

    try {
      await updateAppointmentStatusApi(confirmId, "cancelled")

      showToast("success", "ยกเลิกนัดหมายสำเร็จ")

      setConfirmId(null)
      fetchData()
    } catch (err: any) {
      showToast("error", err.message)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  /* ---------- FILTER ---------- */

  const filtered =
    filter === "all"
      ? appointments
      : appointments.filter((a) => a.status === filter)

  /* ---------- PAGINATION ---------- */

  const pageSize = 6
  const totalPages = Math.ceil(filtered.length / pageSize)

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  return (
    <div className="appointment-page">

      <h1>ประวัติการนัดหมาย</h1>
      <p>ติดตามสถานะการรักษาและการนัดหมายของคุณ</p>

      {/* FILTER */}

      <div className="appointment-filters">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`filter-btn ${filter === f.key ? "active" : ""}`}
            onClick={() => {
              setFilter(f.key)
              setPage(1)
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* TABLE */}

      <div className="appointment-table-wrapper">

        {loading ? (
          <div className="empty">กำลังโหลด...</div>
        ) : paginated.length === 0 ? (
          <div className="empty">ไม่มีข้อมูล</div>
        ) : (

          <table className="appointment-table">

            <thead>
              <tr>
                <th>วันที่</th>
                <th>เวลา</th>
                <th>แพทย์</th>
                <th>สถานะ</th>
                <th></th>
              </tr>
            </thead>

            <tbody>

              {paginated.map((a) => (

                <tr key={a.id}>

                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>{a.doctor}</td>

                  <td className={`status status-${a.status}`}>
                    {statusText[a.status]}
                  </td>

                  <td>
                    {(a.status === "booked" ||
                      a.status === "awaiting_checkin") && (

                      <button
                        className="action-cancel"
                        onClick={() => setConfirmId(a.id)}
                      >
                        ยกเลิก
                      </button>

                    )}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

      {/* PAGINATION */}

      <div className="pagination">
        {Array.from({ length: totalPages }).map((_, i) => {
          const p = i + 1
          return (
            <button
              key={p}
              className={`page ${page === p ? "active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          )
        })}
      </div>

      {/* 🔥 CONFIRM MODAL */}

      {confirmId && (
        <div className="modal-overlay">
          <div className="modal">

            <h3>ยืนยันการยกเลิก</h3>
            <p>คุณแน่ใจหรือไม่ว่าต้องการยกเลิกนัดหมายนี้?</p>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmId(null)}>
                ยกเลิก
              </button>
              <button className="btn-confirm" onClick={handleCancel}>
                ยืนยัน
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}