import { useState } from "react"

/* ---------- TYPE ---------- */

type QueueStatus =
  | "waiting"
  | "diagnosis"
  | "treatment"
  | "completed"

type QueueFilter = QueueStatus | "all"

type Queue = {
  id: number
  name: string
  time: string
  symptom: string
  status: QueueStatus
}

/* ---------- STATUS TEXT ---------- */

const statusText: Record<QueueStatus, string> = {
  waiting: "รอตรวจ",
  diagnosis: "กำลังวินิจฉัย",
  treatment: "กำลังรักษา",
  completed: "เสร็จสิ้น"
}

/* ---------- FILTER ---------- */

const filters = [
  { key: "all", label: "ทั้งหมด", class: "filter-all" },
  { key: "waiting", label: "รอตรวจ", class: "filter-diagnosis" },
  { key: "diagnosis", label: "วินิจฉัย", class: "filter-treatment" },
  { key: "treatment", label: "รักษา", class: "filter-waiting" },
  { key: "completed", label: "เสร็จสิ้น", class: "filter-completed" }
] as const

export default function TodayQueue() {

  const [filter, setFilter] = useState<QueueFilter>("all")
  const [page, setPage] = useState(1)

  /* ---------- MOCK DATA ---------- */

  const queues: Queue[] = [
    { id: 1, name: "สมชาย สุขใจ", time: "09:30", symptom: "มีไข้ ไอ เจ็บคอ", status: "waiting" },
    { id: 2, name: "สมหญิง สุขสัน", time: "10:30", symptom: "ปวดท้อง แน่นท้อง", status: "diagnosis" },
    { id: 3, name: "สายลม ตอนเย็น", time: "13:00", symptom: "ผื่นขึ้นตามตัว", status: "treatment" },
    { id: 4, name: "สายลม คนเข้ม", time: "16:00", symptom: "ปวดศีรษะเรื้อรัง", status: "completed" },
    { id: 5, name: "วิชัย บุญมาก", time: "17:00", symptom: "ไอเรื้อรัง", status: "waiting" },
    { id: 6, name: "อรทัย มีสุข", time: "18:00", symptom: "เวียนหัว", status: "waiting" },
  ]

  /* ---------- FILTER ---------- */

  const filtered =
    filter === "all"
      ? queues
      : queues.filter((q) => q.status === filter)

  /* ---------- PAGINATION ---------- */

  const pageSize = 6
  const totalPages = Math.ceil(filtered.length / pageSize)

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  return (
    <div className="appointment-page">

      <h1>คิวตรวจวันนี้</h1>
      <p>รายการผู้ป่วยที่รอเข้ารับการตรวจ</p>

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
                <th>ชื่อ-นามสกุล</th>
                <th>เวลา</th>
                <th>อาการเบื้องต้น</th>
                <th>สถานะ</th>
                <th>การกระทำ</th>
              </tr>
            </thead>

            <tbody>

              {paginated.map((q) => (

                <tr key={q.id}>

                  <td>{q.name}</td>

                  <td>{q.time}</td>

                  <td>{q.symptom}</td>

                  <td className={`status status-${q.status}`}>
                    {statusText[q.status]}
                  </td>

                  <td>

                    {q.status === "waiting" && (
                      <button className="action-start">
                        เริ่มตรวจ
                      </button>
                    )}

                    {q.status === "diagnosis" && (
                      <button className="action-next">
                        ไปขั้นรักษา
                      </button>
                    )}

                    {q.status === "treatment" && (
                      <button className="action-complete">
                        เสร็จสิ้น
                      </button>
                    )}

                    {q.status === "completed" && "-"}
                    
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