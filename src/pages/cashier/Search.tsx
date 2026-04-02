import { useEffect, useMemo, useState } from "react"
import { useApi } from "../../api"

/* ---------- TYPE ---------- */

type Patient = {
  id: string
  name: string
  phone: string
  gender: string
  nextAppointment: string | null
}

/* ---------- MAP ---------- */

const mapPatient = (p: any): Patient => ({
  id: p.formatted_patient_id,
  name: p.fullname,
  phone: p.phone_number,
  gender: p.gender,
  nextAppointment: p.appointment_dates?.[0] || null
})

export default function Search() {

  const { getActivePatientsApi } = useApi()

  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  /* ---------- FETCH ---------- */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getActivePatientsApi()
        setPatients(res.map(mapPatient))
      } catch (err) {
        console.error(err)
      }
    }

    fetchData()
  }, [])

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
          !startDate || (p.nextAppointment && p.nextAppointment >= startDate)

        const matchEnd =
          !endDate || (p.nextAppointment && p.nextAppointment <= endDate)

        return matchSearch && matchStart && matchEnd
      })
      .sort((a, b) => {
        if (!a.nextAppointment) return 1
        if (!b.nextAppointment) return -1
        return b.nextAppointment.localeCompare(a.nextAppointment)
      })

  }, [patients, search, startDate, endDate])

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
              <th>นัดถัดไป</th>
            </tr>
          </thead>

          <tbody>

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="empty">
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