import { useState, useMemo } from "react"

type Patient = {
  id: string
  gender: string
  name: string
  phone: string
  lastVisit: string // YYYY-MM-DD
}

export default function Search() {

  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  /* MOCK DATA */
  const patients: Patient[] = [
    { id: "PT-001", gender: "ชาย", name: "สมชาย ใจดี", phone: "0123456789", lastVisit: "2026-03-20" },
    { id: "PT-002", gender: "ชาย", name: "สมชาย", phone: "1234567890", lastVisit: "2026-03-21" },
    { id: "PT-003", gender: "หญิง", name: "สมหญิง", phone: "2345678901", lastVisit: "2026-03-22" },
    { id: "PT-004", gender: "หญิง", name: "สมดำ", phone: "3456789012", lastVisit: "2026-03-23" },
  ]

  /* 🔥 FILTER */
  const filtered = useMemo(() => {
    return patients.filter(p => {

      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase())

      const matchStart =
        !startDate || p.lastVisit >= startDate

      const matchEnd =
        !endDate || p.lastVisit <= endDate

      return matchSearch && matchStart && matchEnd
    })
  }, [search, startDate, endDate])

  return (
    <div className="appointment-page">

      <h1>กรองคนไข้</h1>

      {/* FILTER ROW */}
      <div className="appointment-filter-bar" style={{ marginBottom: "14px" }}>
        <div className="appointment-filter-left">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <span style={{ marginLeft: "8px" , marginRight: "8px" }}> - </span>

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="appointment-filter-right">
          <input
            placeholder="ค้นหาชื่อ / รหัส"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="appointment-table-wrapper">
        <div className="appointment-table-area">

          <table className="appointment-table">

            <thead>
              <tr>
                <th>รหัส</th>
                <th>เพศ</th>
                <th>ชื่อ - นามสกุล</th>
                <th>เบอร์โทร</th>
                <th>นัดล่าสุด</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.gender}</td>
                  <td>{p.name}</td>
                  <td>{p.phone}</td>
                  <td>{p.lastVisit}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      </div>

    </div>
  )
}