import { useState, useMemo } from "react"

type Status = "waiting" | "progress" | "done" | "cancel"

type Appointment = {
  id: number
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

export default function Today() {

  const [filter, setFilter] = useState<Status | "all">("all")

  /* MOCK DATA (วันนี้) */
  const data: Appointment[] = [
    { id: 1, time: "09:00", patient: "สมชาย", symptom: "มีไข้", status: "waiting" },
    { id: 2, time: "09:30", patient: "อรทัย", symptom: "ปวดหัว", status: "progress" },
    { id: 3, time: "10:00", patient: "ธนา", symptom: "ตรวจสุขภาพ", status: "done" },
    { id: 4, time: "10:30", patient: "กนก", symptom: "เจ็บคอ", status: "cancel" },
  ]

  /* COUNT */
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    data.forEach(d => {
      c[d.status] = (c[d.status] || 0) + 1
    })
    return c
  }, [data])

  /* FILTER */
  const filtered =
    filter === "all"
      ? data
      : data.filter(d => d.status === filter)

  return (
    <div className="appointment-page">

      <h1>นัดหมายวันนี้</h1>

      {/* FILTER */}
      <div className="appointment-filters">

        <button onClick={() => setFilter("all")} className="filter-btn">
          ทั้งหมด ({data.length})
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

      {/* TABLE */}
      <div className="appointment-table-wrapper">
        <div className="appointment-table-area">

          <table className="appointment-table">

            <thead>
              <tr>
                <th>เวลา</th>
                <th>ผู้ป่วย</th>
                <th>อาการ</th>
                <th>สถานะ</th>
              </tr>
            </thead>

            <tbody>

              {filtered.map((a) => (
                <tr key={a.id}>
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