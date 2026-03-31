import { useEffect, useState } from "react"
import type { PatientProfile } from "../../App"
import { useApi } from "../../api"

export default function Profile({ user, setUser, }: {
  user: PatientProfile
  setUser: React.Dispatch<React.SetStateAction<any>>
}) {
  const { updateProfileApi, getMeApi } = useApi()

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<PatientProfile>(user)
  const [loading, setLoading] = useState(false)

  // 🔥 sync user (กัน async bug)
  useEffect(() => {
    setForm(user)
  }, [user])

  const isPatient = user.role === "patient"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    if (!isPatient) return

    try {
      setLoading(true)

      const payload = {
        first_name: form.first_name || "",
        last_name: form.last_name || "",
        phone_number: form.phone_number || "",
        birth_date: form.birth_date || "",
        gender: form.gender === "female" ? "female" : "male",
      }

      await updateProfileApi("patient", payload)

      // 🔥 ดึงข้อมูลใหม่
      const updatedUser = await getMeApi()

      if (updatedUser.role === "patient") {
        setUser(updatedUser)
        setForm(updatedUser)
      }
      setIsEditing(false)

    } catch (error: any) {
      console.error("❌ update error", error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setForm(user)
    setIsEditing(false)
  }

  return (
    <div className="profile-container">

      <h2 className="section-header">ข้อมูลบัญชีผู้ใช้งาน</h2>

      <div className="form-grid">

        <div>
          <label>ชื่อผู้ใช้</label>
          <input value={form.username || ""} disabled />
        </div>

        <div>
          <label>อีเมล</label>
          <input
            value={form.email || ""}
            disabled
          />
        </div>

      </div>

      <h2 className="section-header">ข้อมูลส่วนตัว</h2>

      <div className="form-grid">

        <div>
          <label>ชื่อ</label>
          <input
            name="first_name"
            value={form.first_name || ""}
            onChange={handleChange}
            disabled={!isEditing || !isPatient}
          />
        </div>

        <div>
          <label>นามสกุล</label>
          <input
            name="last_name"
            value={form.last_name || ""}
            onChange={handleChange}
            disabled={!isEditing || !isPatient}
          />
        </div>

        <div>
          <label>เพศ</label>

          <div className="radio-group">
            <label className="radio-item">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={form.gender === "male"}
                onChange={handleChange}
                disabled={!isEditing || !isPatient}
              />
              ชาย
            </label>

            <label className="radio-item">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={form.gender === "female"}
                onChange={handleChange}
                disabled={!isEditing || !isPatient}
              />
              หญิง
            </label>
          </div>
        </div>

        <div>
          <label>เลขบัตรประชาชน</label>
          <input value={form.id_card_number || ""} disabled />
        </div>

        <div>
          <label>วันเกิด</label>
          <input
            type="date"
            name="birth_date"
            value={form.birth_date || ""}
            onChange={handleChange}
            disabled={!isEditing || !isPatient}
          />
        </div>

        <div>
          <label>เบอร์โทร</label>
          <input
            name="phone_number"
            value={form.phone_number || ""}
            onChange={handleChange}
            disabled={!isEditing || !isPatient}
          />
        </div>

      </div>

      <div className="button-row">

        {/* 🔥 patient เท่านั้นที่แก้ได้ */}
        {isPatient && !isEditing && (
          <button
            className="edit-btn"
            onClick={() => setIsEditing(true)}
          >
            แก้ไขข้อมูล
          </button>
        )}

        {isPatient && isEditing && (
          <>
            <button
              className="save-btn"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>

            <button
              className="cancel-btn"
              onClick={handleCancel}
            >
              ยกเลิก
            </button>
          </>
        )}

      </div>

    </div>
  )
}