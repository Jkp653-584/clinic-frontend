import { useState } from "react"

/* ---------- TYPE ---------- */

type Status =
  | "checked_in"
  | "in_progress"
  | "dispensing"
  | "completed"

type Queue = {
  id: number
  name: string
  time: string
  symptom: string
  status: Status
}

type MedicalRecordForm = {
  symptoms: string
  diagnosis: string
  treatment_plan: string
}

/* ---------- STATUS TEXT ---------- */

const statusText: Record<Status, string> = {
  checked_in: "รอเรียก",
  in_progress: "กำลังตรวจ",
  dispensing: "รอจ่ายยา",
  completed: "เสร็จแล้ว"
}

export default function TodayQueue() {

  const [filter, setFilter] = useState<"all" | Status>("all")
  const [selected, setSelected] = useState<Queue | null>(null)

  /* ---------- MOCK DATA ---------- */

  const [queues, setQueues] = useState<Queue[]>([
    { id: 1, name: "สมชาย", time: "09:30", symptom: "มีไข้", status: "checked_in" },
    { id: 2, name: "สมหญิง", time: "10:30", symptom: "ปวดท้อง", status: "in_progress" },
    { id: 3, name: "สายลม", time: "13:00", symptom: "ผื่น", status: "checked_in" },
  ])

  /* ---------- FILTER ---------- */

  const filtered =
    filter === "all"
      ? queues
      : queues.filter(q => q.status === filter)

  /* ---------- ACTION ---------- */

  const startTreatment = (id: number) => {
    setQueues(prev =>
      prev.map(q =>
        q.id === id ? { ...q, status: "in_progress" } : q
      )
    )
  }

  const completeTreatment = (id: number) => {
    setQueues(prev =>
      prev.map(q =>
        q.id === id ? { ...q, status: "dispensing" } : q
      )
    )
  }

  const handleSubmit = (form: MedicalRecordForm) => {
    if (!selected) return

    console.log("SEND API", form)

    completeTreatment(selected.id)
    setSelected(null)
  }

  return (
    <div className="appointment-page">

      <h1>คิวตรวจวันนี้</h1>

      {/* FILTER */}
      <div className="appointment-filters">

        <button onClick={() => setFilter("all")} className="filter-btn">
          ทั้งหมด
        </button>

        <button onClick={() => setFilter("checked_in")} className="filter-btn">
          รอเรียก
        </button>

        <button onClick={() => setFilter("in_progress")} className="filter-btn">
          กำลังตรวจ
        </button>

      </div>

      {/* TABLE */}
      <div className="appointment-table-wrapper">
        <table className="appointment-table">

          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>เวลา</th>
              <th>อาการ</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>

          <tbody>

            {filtered.map(q => (
              <tr key={q.id}>

                <td>{q.name}</td>
                <td>{q.time}</td>
                <td>{q.symptom}</td>

                <td className={`status status-${q.status}`}>
                  {statusText[q.status]}
                </td>

                <td>

                  {q.status === "checked_in" && (
                    <button onClick={() => startTreatment(q.id)}>
                      เริ่มตรวจ
                    </button>
                  )}

                  {q.status === "in_progress" && (
                    <button onClick={() => setSelected(q)}>
                      บันทึกผล
                    </button>
                  )}

                </td>

              </tr>
            ))}

          </tbody>

        </table>
      </div>

      {/* MODAL */}
      {selected && (
        <MedicalRecordModal
          onClose={() => setSelected(null)}
          onSubmit={handleSubmit}
        />
      )}

    </div>
  )
}

/* ---------- MODAL ---------- */

type ModalProps = {
  onClose: () => void
  onSubmit: (form: MedicalRecordForm) => void
}

function MedicalRecordModal({
  onClose,
  onSubmit
}: ModalProps) {

  const [form, setForm] = useState<MedicalRecordForm>({
    symptoms: "",
    diagnosis: "",
    treatment_plan: ""
  })

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h3>บันทึกผลการรักษา</h3>

        <input
          placeholder="อาการ"
          value={form.symptoms}
          onChange={e => setForm({ ...form, symptoms: e.target.value })}
        />

        <input
          placeholder="วินิจฉัย"
          value={form.diagnosis}
          onChange={e => setForm({ ...form, diagnosis: e.target.value })}
        />

        <input
          placeholder="แผนการรักษา"
          value={form.treatment_plan}
          onChange={e => setForm({ ...form, treatment_plan: e.target.value })}
        />

        <div className="modal-actions">

          <button className="btn-cancel" onClick={onClose}>
            ยกเลิก
          </button>

          <button
            className="btn-confirm"
            onClick={() => onSubmit(form)}
          >
            บันทึก
          </button>

        </div>

      </div>
    </div>
  )
}