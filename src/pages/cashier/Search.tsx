import { useState, useMemo } from "react"

/* ---------- TYPE ---------- */

type Patient = {
  id: string
  gender: string
  name: string
  phone: string
  lastVisit: string
  nextAppointment: string | null
}

export default function Search() {

  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  /* ---------- MOCK DATA ---------- */

  const patients: Patient[] = [
    {
      id: "PT-001",
      gender: "ชาย",
      name: "สมชาย ใจดี",
      phone: "0123456789",
      lastVisit: "2026-03-20",
      nextAppointment: "2026-04-02"
    },
    {
      id: "PT-002",
      gender: "หญิง",
      name: "สมหญิง",
      phone: "1234567890",
      lastVisit: "2026-03-21",
      nextAppointment: null
    },
    {
      id: "PT-003",
      gender: "หญิง",
      name: "อรทัย",
      phone: "2345678901",
      lastVisit: "2026-03-22",
      nextAppointment: "2026-04-05"
    },
  ]

  /* ---------- FILTER + SORT ---------- */

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase()

    return patients
      .filter(p => {

        const matchSearch =
          p.name.toLowerCase().includes(keyword) ||
          p.id.toLowerCase().includes(keyword) ||
          p.phone.includes(keyword)

        const matchStart =
          !startDate || p.lastVisit >= startDate

        const matchEnd =
          !endDate || p.lastVisit <= endDate

        return matchSearch && matchStart && matchEnd
      })
      .sort((a, b) => b.lastVisit.localeCompare(a.lastVisit))

  }, [search, startDate, endDate])

  /* ---------- COPY ---------- */

  const handleCopy = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone)
    setCopiedId(id)

    setTimeout(() => {
      setCopiedId(null)
    }, 1200)
  }

  return (
    <div className="appointment-page">

      <h1>ค้นหาคนไข้</h1>

      {/* FILTER BAR */}
      <div className="appointment-filter-bar" style={{ marginBottom: "14px" }}>

        <div className="appointment-filter-left">

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <span style={{ margin: "0 8px" }}>-</span>

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

        </div>

        <div className="appointment-filter-right">

          <input
            placeholder="ค้นหา ชื่อ / รหัส / เบอร์"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>

      {/* TABLE */}
      <div className="appointment-table-wrapper">

        <table className="appointment-table">

          <thead>
            <tr>
              <th>รหัส</th>
              <th>ชื่อ</th>
              <th>เบอร์</th>
              <th>นัดล่าสุด</th>
              <th>นัดถัดไป</th>
            </tr>
          </thead>

          <tbody>

            {/* EMPTY */}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}

            {filtered.map((p) => (
              <tr key={p.id}>

                <td>{p.id}</td>

                <td>{p.name}</td>

                <td>
                  {p.phone}

                  <button
                    style={{
                      marginLeft: "6px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                    onClick={() => handleCopy(p.id, p.phone)}
                  >
                    {copiedId === p.id ? "✔" : "📋"}
                  </button>
                </td>

                <td>{p.lastVisit}</td>

                <td
                  style={{
                    color: p.nextAppointment ? "#2563eb" : undefined
                  }}
                >
                  {p.nextAppointment || "-"}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}