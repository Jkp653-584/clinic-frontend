import { useEffect, useState } from "react"
import { useApi } from "../../api"

export default function ManageDoctors() {
  const { 
    getDoctorsApi, 
    createDoctorApi, 
    removeEmployeeApi,
    createDoctorScheduleApi,
    getDoctorSchedulesApi // 🔥 เพิ่ม
  } = useApi()

  const [openId, setOpenId] = useState<string | null>(null)
  const [doctors, setDoctors] = useState<any[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)

  const [existingSchedules, setExistingSchedules] = useState<any[]>([]) // 🔥 เพิ่ม

  // 🔥 schedule (multi slot)
  const [scheduleForm, setScheduleForm] = useState({
    day: "",
    start_time: "",
    end_time: "",
  })

  const [scheduleList, setScheduleList] = useState<any[]>([])

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    specialization: "",
    license_number: "",
    phone_number: "",
    email: "",
  })

  const parseDoctorId = (displayId: string) => {
    const num = Number(displayId.replace(/\D/g, "")) // 🔥 FIX ให้ robust

    if (isNaN(num)) {
      throw new Error("Invalid doctor_display_id format")
    }

    return num
  }

  const fetchDoctors = async () => {
    const data = await getDoctorsApi()

    const mapped = data.map((d: any) => ({
      id: d.doctor_display_id,
      user_id: d.user_id,
      name: `${d.first_name} ${d.last_name}`,
      specialization: d.specialization,
      phone: d.phone_number,
      email: d.email,
    }))

    setDoctors(mapped)
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  // 🔥 โหลด schedule เมื่อเปิด modal
  useEffect(() => {
    if (!selectedDoctor) return

    const fetchSchedules = async () => {
      try {
        const all = await getDoctorSchedulesApi()

        const doctorId = parseDoctorId(selectedDoctor.id)

        const filtered = all
          .filter((s: any) => s.doctor_id === doctorId)
          .sort((a: any, b: any) =>
            new Date(a.work_date).getTime() - new Date(b.work_date).getTime()
          )

        setExistingSchedules(filtered)
      } catch (err) {
        console.error(err)
      }
    }

    fetchSchedules()
  }, [selectedDoctor])

  // 🔥 create doctor
  const handleCreate = async () => {
    try {
      await createDoctorApi(form)

      alert("เพิ่มแพทย์สำเร็จ")

      setForm({
        first_name: "",
        last_name: "",
        specialization: "",
        license_number: "",
        phone_number: "",
        email: "",
      })

      fetchDoctors()
    } catch (err) {
      console.error(err)
      alert("เพิ่มไม่สำเร็จ")
    }
  }

  // 🔥 add schedule slot
  const handleAddSchedule = () => {
    if (!scheduleForm.day || !scheduleForm.start_time || !scheduleForm.end_time) {
      alert("กรอกข้อมูลให้ครบ")
      return
    }

    setScheduleList([...scheduleList, scheduleForm])

    setScheduleForm({
      day: "",
      start_time: "",
      end_time: "",
    })
  }

  // 🔥 remove slot
  const handleRemoveSlot = (index: number) => {
    const newList = [...scheduleList]
    newList.splice(index, 1)
    setScheduleList(newList)
  }

  // 🔥 save schedule
  const handleSaveSchedule = async () => {
    try {
      for (const s of scheduleList) {
        await createDoctorScheduleApi({
          doctor_id: parseDoctorId(selectedDoctor.id),
          work_date: s.day,
          start_time: `${s.start_time}:00`,
          end_time: `${s.end_time}:00`,
        })
      }

      alert("บันทึกสำเร็จ")

      setScheduleList([])

      // 🔥 reload schedule ใหม่
      const all = await getDoctorSchedulesApi()
      const doctorId = parseDoctorId(selectedDoctor.id)
      setExistingSchedules(
        all.filter((s: any) => s.doctor_id === doctorId)
      )

    } catch (err) {
      console.error(err)
      alert("บันทึกไม่สำเร็จ")
    }
  }

  const handleDeleteDoctor = async (d: any) => {
    if (!confirm("ยืนยันการลบแพทย์?")) return

    try {
      await removeEmployeeApi(
        d.user_id,
        "doctor",
        String(parseDoctorId(d.id))
      )

      alert("ลบสำเร็จ")
      fetchDoctors()
    } catch (err) {
      console.error(err)
      alert("ลบไม่สำเร็จ")
    }
  }

  return (
    <div className="owner-page">

      <h2>เพิ่มแพทย์</h2>

      <div className="form-grid">
        <input placeholder="ชื่อจริง"
          value={form.first_name}
          onChange={e => setForm({ ...form, first_name: e.target.value })}
        />
        <input placeholder="นามสกุล"
          value={form.last_name}
          onChange={e => setForm({ ...form, last_name: e.target.value })}
        />
        <input placeholder="ความถนัด"
          value={form.specialization}
          onChange={e => setForm({ ...form, specialization: e.target.value })}
        />
        <input placeholder="เลขใบอนุญาต"
          value={form.license_number}
          onChange={e => setForm({ ...form, license_number: e.target.value })}
        />
        <input placeholder="เบอร์โทรศัพท์"
          value={form.phone_number}
          onChange={e => setForm({ ...form, phone_number: e.target.value })}
        />
        <input placeholder="อีเมล"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
      </div>

      <button className="btn-primary" onClick={handleCreate}>
        เพิ่มแพทย์
      </button>

      <h3>รายชื่อแพทย์</h3>

      <div className="list">
        {doctors.map(d => (
          <div key={d.id} className="list-item-wrapper">

            <div
              className="list-item"
              onClick={() => setOpenId(openId === d.id ? null : d.id)}
            >
              <span>{d.id}</span>
              <span>{d.name}</span>
              <span>{openId === d.id ? "▲" : "▼"}</span>
            </div>

            {openId === d.id && (
              <div className="expand-box">

                <p>ความถนัด: {d.specialization}</p>
                <p>เบอร์: {d.phone}</p>
                <p>อีเมล: {d.email}</p>

                <div className="expand-actions">

                  <button className="btn-danger"
                    onClick={() => handleDeleteDoctor(d)}>
                    ลบ
                  </button>

                  <button className="btn-secondary"
                    onClick={() => setSelectedDoctor(d)}>
                    ตาราง
                  </button>

                </div>

              </div>
            )}

          </div>
        ))}
      </div>

      {/* 🔥 MODAL */}
      {selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal">

            <h3 className="modal-title">
              ตารางแพทย์: {selectedDoctor.name}
            </h3>

            {/* 📌 ตารางเดิม */}
            <div className="schedule-section">
              {existingSchedules.length === 0 ? (
                <p>ยังไม่มีตาราง</p>
              ) : (
                existingSchedules.map((s: any) => (
                  <div key={s.schedule_id} className="list-item">
                    <span>
                      {new Date(s.work_date).toLocaleDateString("th-TH")}
                    </span>
                    <span>
                      {s.start_time.slice(0,5)} - {s.end_time.slice(0,5)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <hr />

            {/* 📌 FORM */}
            <div className="form-grid modal-form">

              <div className="form-group">
                <label>วันที่</label>
                <input
                  type="date"
                  value={scheduleForm.day}
                  onChange={e =>
                    setScheduleForm({ ...scheduleForm, day: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>เวลาเริ่ม</label>
                <input
                  type="time"
                  value={scheduleForm.start_time}
                  onChange={e =>
                    setScheduleForm({ ...scheduleForm, start_time: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>เวลาสิ้นสุด</label>
                <input
                  type="time"
                  value={scheduleForm.end_time}
                  onChange={e =>
                    setScheduleForm({ ...scheduleForm, end_time: e.target.value })
                  }
                />
              </div>

            </div>

            <button className="btn-secondary" onClick={handleAddSchedule}>
              + เพิ่มช่วงเวลา
            </button>

            {/* 📌 รายการใหม่ */}
            <div className="schedule-list">
              {scheduleList.map((s, i) => (
                <div key={i} className="list-item">
                  <span>{s.day}</span>
                  <span>{s.start_time} - {s.end_time}</span>
                  <button onClick={() => handleRemoveSlot(i)}>❌</button>
                </div>
              ))}
            </div>

            {/* ACTION */}
            <div className="modal-actions">

              <button className="btn-primary" onClick={handleSaveSchedule}>
                บันทึก
              </button>

              <button
                className="btn-outline"
                onClick={() => {
                  setSelectedDoctor(null)
                  setScheduleList([])
                }}
              >
                ปิด
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  )
}