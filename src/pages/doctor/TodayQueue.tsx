import { useEffect, useMemo, useState } from "react"
import { useApi } from "../../api"

/* ---------- TYPE ---------- */

type Status =
  | "checked_in"
  | "in_progress"
  | "dispensing"
  | "completed"

type Queue = {
  id: number
  recordId?: number | null
  date: string
  time: string
  name: string
  symptom: string
  status: Status
}

type MedicalForm = {
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

/* ---------- MAP ---------- */

const mapQueue = (q: any): Queue => ({
  id: q.appointment_id,
  recordId: q.medical_record_id || null,
  date: q.appointment_date,
  time: q.start_time.slice(0, 5),
  name: q.patient_fullname,
  symptom: q.symptoms,
  status: q.status as Status
})

export default function TodayQueue() {

  const {
    getMyAppointmentsApi,
    updateAppointmentStatusApi,
    createMedicalRecordApi,
    updateMedicalRecordApi
  } = useApi()

  const [queues, setQueues] = useState<Queue[]>([])
  const [filter, setFilter] = useState<"all" | Status>("all")
  const [selected, setSelected] = useState<Queue | null>(null)

  /* ---------- FETCH ---------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getMyAppointmentsApi()
        // filter เฉพาะ status ที่ต้องการ
        const filteredData = res.filter(
          (q: any) =>
            ["checked_in", "in_progress", "dispensing", "completed"].includes(q.status)
        )
        setQueues(filteredData.map(mapQueue))
      } catch (err) {
        console.error(err)
      }
    }

    fetchData()
  }, [])

  /* ---------- TODAY ---------- */

  const today = new Date().toISOString().slice(0, 10)

  const todayQueues = useMemo(() => {
    return queues.filter((q: Queue) => q.date === today)
  }, [queues])

  /* ---------- FILTER ---------- */

  const filtered =
    filter === "all"
      ? todayQueues
      : todayQueues.filter((q: Queue) => q.status === filter)

  /* ---------- ACTION ---------- */

  const startTreatment = async (id: number) => {
    try {
      await updateAppointmentStatusApi(id, "in_progress")

      setQueues(prev =>
        prev.map((q: Queue) =>
          q.id === id ? { ...q, status: "in_progress" } : q
        )
      )
    } catch (err: any) {
      alert(err.message)
    }
  }

  const submitMedicalRecord = async (form: MedicalForm) => {

    if (!selected) return

    try {

      if (selected.recordId) {
        // ✅ UPDATE
        await updateMedicalRecordApi(selected.recordId, form)

      } else {
        // ✅ CREATE
        await createMedicalRecordApi(selected.id, form)

        await updateAppointmentStatusApi(selected.id, "dispensing")
      }

      setQueues(prev =>
        prev.map((q: Queue) =>
          q.id === selected.id
            ? {
                ...q,
                status: "dispensing",
                recordId: q.recordId || 1 // 👉 ป้องกัน null (ควรใช้ค่าจาก backend จริง)
              }
            : q
        )
      )

      setSelected(null)

    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="appointment-page">

      <h1>คิวตรวจวันนี้</h1>

      {/* FILTER */}
      <div className="appointment-filters">

        <button
          onClick={() => setFilter("all")}
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
        >
          ทั้งหมด
        </button>

        <button
          onClick={() => setFilter("checked_in")}
          className={`filter-btn ${filter === "checked_in" ? "active" : ""}`}
        >
          รอเรียก
        </button>

        <button
          onClick={() => setFilter("in_progress")}
          className={`filter-btn ${filter === "in_progress" ? "active" : ""}`}
        >
          กำลังตรวจ
        </button>

        <button
          onClick={() => setFilter("dispensing")}
          className={`filter-btn ${filter === "dispensing" ? "active" : ""}`}
        >
          รอจ่ายยา
        </button>

      </div>

      {/* TABLE */}
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
                  ไม่มีคิววันนี้
                </td>
              </tr>
            )}

            {filtered.map((q: Queue) => (
              <tr key={q.id}>

                <td>{q.time}</td>
                <td>{q.name}</td>
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

                  {q.status === "dispensing" && (
                    <button onClick={() => setSelected(q)}>
                      แก้ไขผล
                    </button>
                  )}

                  {q.status === "completed" && "-"}

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

      {/* MODAL */}
      {selected && (
        <MedicalRecordModal
          initialData={{
            symptoms: selected.symptom,
            diagnosis: "",
            treatment_plan: ""
          }}
          onClose={() => setSelected(null)}
          onSubmit={submitMedicalRecord}
        />
      )}

    </div>
  )
}

/* ---------- MODAL ---------- */

function MedicalRecordModal({
  initialData,
  onClose,
  onSubmit
}: {
  initialData?: MedicalForm
  onClose: () => void
  onSubmit: (form: MedicalForm) => void
}) {

  const [form, setForm] = useState<MedicalForm>(
    initialData || {
      symptoms: "",
      diagnosis: "",
      treatment_plan: ""
    }
  )

  return (
    <div className="modal-overlay">
      <div className="modal">

        <h3>บันทึกผลการรักษา</h3>

        <input
          style={{ marginBottom: 10 }}
          placeholder="อาการ"
          value={form.symptoms}
          onChange={(e) =>
            setForm({ ...form, symptoms: e.target.value })
          }
        />

        <input
          style={{ marginBottom: 10 }}
          placeholder="วินิจฉัย"
          value={form.diagnosis}
          onChange={(e) =>
            setForm({ ...form, diagnosis: e.target.value })
          }
        />

        <input
          style={{ marginBottom: 10 }}
          placeholder="แผนการรักษา"
          value={form.treatment_plan}
          onChange={(e) =>
            setForm({ ...form, treatment_plan: e.target.value })
          }
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