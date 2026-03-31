import { useState } from "react"

type ReportType = "complaint" | "payment" | "system" | "other"

export default function Incident() {
  const [type, setType] = useState<ReportType>("other")
  const [other, setOther] = useState("")
  const [datetime, setDatetime] = useState("2026-03-21T10:00")
  const [detail, setDetail] = useState("")

  const handleSubmit = () => {
    const payload = {
      type,
      other,
      datetime,
      detail,
    }

    console.log("SEND API:", payload)
  }

  return (
    <div className="cashier-page">
      <h1>ส่งรายงานเหตุการณ์</h1>

      <div className="cashier-card">

        <div className="cashier-grid">

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

        </div>

        {/* DATETIME */}
        <div className="mt-16">
          <label>วัน/เดือน/ปี และ เวลา</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
          />
        </div>

        {/* DETAIL */}
        <div className="mt-16">
          <label>รายละเอียดเหตุการณ์</label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="อธิบายเหตุการณ์โดยสรุป..."
          />
        </div>

      </div>

      <button className="primary-btn mt-16" onClick={handleSubmit}>
        ส่งรายงาน
      </button>
    </div>
  )
}