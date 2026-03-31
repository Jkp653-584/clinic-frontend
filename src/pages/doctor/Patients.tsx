import { useEffect, useState } from "react"

type Patient = {
  id: string
  first_name: string
  last_name: string
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState("")

  // 🔥 mock data
  useEffect(() => {
    setPatients([
      { id: "PT-001", first_name: "สมชาย", last_name: "ใจดี" },
      { id: "PT-002", first_name: "สมหญิง", last_name: "แก้วใส" },
      { id: "PT-003", first_name: "วิชัย", last_name: "บุญมาก" },
      { id: "PT-004", first_name: "อรทัย", last_name: "มีสุข" },
    ])
  }, [])

  // 🔥 future API
  // useEffect(() => {
  //   fetchPatientsApi().then(setPatients)
  // }, [])

  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.includes(search)
  )

  return (
    <div className="list-container">

      <h2 className="section-header">รายชื่อ</h2>

      <div className="search-box">
        <input
          placeholder="ค้นหา..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>

      <div className="list-box">
        {filtered.map(p => (
          <div key={p.id} className="list-item">
            <span className="id">{p.id}</span>
            <span className="name">{p.first_name} {p.last_name}</span>
            <span className="arrow">▾</span>
          </div>
        ))}
      </div>

    </div>
  )
}