import { useState } from "react"

type AppointmentStatus =
  | "diagnosis"
  | "treatment"
  | "waiting"
  | "completed"
  | "finished"
  | "cancel"

type AppointmentFilter = AppointmentStatus | "all"

type Appointment = {
  id: number
  date: string
  time: string
  doctor: string
  status: AppointmentStatus
}

const statusText: Record<AppointmentStatus, string> = {
  diagnosis: "นัดวินิจฉัย",
  treatment: "นัดรักษา",
  waiting: "กำลังพบแพทย์",
  completed: "รักษา/จ่ายยาแล้ว",
  finished: "สิ้นสุดการรักษา",
  cancel: "ยกเลิก"
}

type FilterItem = {
  key: AppointmentFilter
  label: string
  class: string
}

const filters: FilterItem[] = [
  { key: "all", label: "ทั้งหมด", class: "filter-all" },
  { key: "diagnosis", label: "นัดวินิจฉัย", class: "filter-diagnosis" },
  { key: "treatment", label: "นัดรักษา", class: "filter-treatment" },
  { key: "waiting", label: "กำลังพบแพทย์", class: "filter-waiting" },
  { key: "completed", label: "รักษา/จ่ายยาแล้ว", class: "filter-completed" },
  { key: "finished", label: "สิ้นสุดการรักษา", class: "filter-finished" },
  { key: "cancel", label: "ยกเลิก", class: "filter-cancel" }
]

export default function AppointmentHistory() {

  const [filter, setFilter] = useState<AppointmentFilter>("all")
  const [page, setPage] = useState(1)

  /* ---------- MOCK DATA (แทน API) ---------- */

  const appointments: Appointment[] = [
    { id: 1, date: "21 มี.ค. 2569", time: "14:30", doctor: "นพ.สมชาย", status: "diagnosis" },
    { id: 2, date: "21 มี.ค. 2569", time: "15:30", doctor: "นพ.สมชาย", status: "treatment" },
    { id: 3, date: "22 มี.ค. 2569", time: "09:30", doctor: "พญ.กมล", status: "waiting" },
    { id: 4, date: "22 มี.ค. 2569", time: "10:00", doctor: "พญ.กมล", status: "completed" },
    { id: 5, date: "23 มี.ค. 2569", time: "13:00", doctor: "นพ.วิชัย", status: "finished" },
    { id: 6, date: "23 มี.ค. 2569", time: "14:00", doctor: "นพ.วิชัย", status: "cancel" },
    { id: 7, date: "24 มี.ค. 2569", time: "10:30", doctor: "นพ.สมชาย", status: "diagnosis" }
  ]

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

      <h1>ประวัติ / สถานะการนัดหมาย</h1>
      <p>ประวัติการนัดหมายและสถานะการเข้ารับบริการ</p>

      {/* FILTER */}

      <div className="appointment-filters">

        {filters.map((f) => (
          <button
            key={f.key}
            className={`filter-btn ${f.class} ${
              filter === f.key ? "active" : ""
            }`}
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

        <div className="appointment-table-area">

          <table className="appointment-table">

            <thead>
              <tr>
                <th>วันที่</th>
                <th>เวลา</th>
                <th>แพทย์</th>
                <th>สถานะ</th>
                <th>การกระทำ</th>
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

                    {a.status === "diagnosis" ||
                    a.status === "treatment" ? (
                      <button className="action-cancel">
                        ยกเลิก
                      </button>
                    ) : (
                      "-"
                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

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

    </div>
  )
}