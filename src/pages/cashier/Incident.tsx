import { useState } from "react"
import { useApi } from "../../api"

type ReportType = "complaint" | "payment" | "system" | "other"

export default function Incident() {
  const { reportIncidentApi } = useApi()

  const [type, setType] = useState<ReportType>("other")
  const [other, setOther] = useState("")
  const [datetime, setDatetime] = useState(
    new Date().toISOString().slice(0, 16)
  )
  const [detail, setDetail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!detail) {
      alert("กรุณากรอกรายละเอียดเหตุการณ์")
      return
    }

    if (type === "other" && !other) {
      alert("กรุณาระบุประเภทเหตุการณ์")
      return
    }

    // map title
    const title =
      type === "other"
        ? other
        : type === "complaint"
        ? "ผู้ป่วยร้องเรียน"
        : type === "payment"
        ? "ปัญหาชำระเงิน"
        : "ระบบขัดข้อง"

    // แปลง datetime
    const dateObj = new Date(datetime)

    const incident_date = dateObj.toISOString().slice(0, 10) // YYYY-MM-DD
    const hours = String(dateObj.getHours()).padStart(2, "0")
    const minutes = String(dateObj.getMinutes()).padStart(2, "0")
    const seconds = String(dateObj.getSeconds()).padStart(2, "0")

    const incident_time = `${hours}:${minutes}:${seconds}` // HH:MM:SS

    const payload = {
      title,
      description: detail,
      incident_date,
      incident_time,
    }

    try {
      setLoading(true)
      await reportIncidentApi(payload)

      alert("ส่งรายงานสำเร็จ")

      // reset form
      setType("other")
      setOther("")
      setDatetime(new Date().toISOString().slice(0, 16))
      setDetail("")
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="staff-page">
      <h1>ส่งรายงานเหตุการณ์</h1>

      <div className="card">

        {/* TYPE */}
        <div>
          <label>ประเภทเหตุการณ์</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ReportType)}
          >
            <option value="complaint">ผู้ป่วยร้องเรียน</option>
            <option value="payment">ปัญหาชำระเงิน</option>
            <option value="system">ระบบขัดข้อง</option>
            <option value="other">อื่นๆ</option>
          </select>
        </div>

        {/* OTHER */}
        <div>
          <label>อื่นๆ</label>
          <input
            value={other}
            onChange={(e) => setOther(e.target.value)}
            disabled={type !== "other"}
          />
        </div>

        {/* DATETIME */}
        <div>
          <label>วัน/เดือน/ปี และ เวลา</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
          />
        </div>

        {/* DETAIL */}
        <div>
          <label>รายละเอียดเหตุการณ์</label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="อธิบายเหตุการณ์โดยสรุป..."
          />
        </div>

      </div>

      <button
        className="primary-btn"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "กำลังส่ง..." : "ส่งรายงาน"}
      </button>
    </div>
  )
}