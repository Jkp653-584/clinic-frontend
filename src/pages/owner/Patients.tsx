import { useEffect, useState } from "react"
import { useApi } from "../../api"

type MedicalRecord = {
  record_id: number
  appointment_date: string
  doctor_name: string
  symptoms: string
  diagnosis: string
  treatment_plan: string
}

type Patient = {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string
  birth_date: string
  gender: string
  blood_group: string
  id_card: string
  medical_records: MedicalRecord[]
}

export default function OwnerPatients() {
  const { getPatientsApi } = useApi()

  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getPatientsApi()
        const mapped = data.map((p: any) => ({
          id: p.formatted_patient_id,
          first_name: p.first_name,
          last_name: p.last_name,
          phone: p.phone_number,
          email: p.email,
          birth_date: p.birth_date,
          gender: p.gender,
          blood_group: p.blood_group ?? "-",
          id_card: p.id_card_number,
          medical_records: p.medical_records ?? [],
        }))
        setPatients(mapped)
      } catch (err) {
        console.error(err)
      }
    }
    fetch()
  }, [])

  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name}`.includes(search)
  )

  return (
    <div className="patients-page list-container">
      <h2 className="section-header">รายชื่อคนไข้</h2>

      <div className="search-box">
        <input
          placeholder="ค้นหา..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="list-box">
        {filtered.map(p => (
          <div key={p.id} className="patients-list-item-wrapper">

            <div
              className="patients-list-item"
              onClick={() => setOpenId(openId === p.id ? null : p.id)}
            >
              <span className="id">{p.id}</span>
              <span className="name">{p.first_name} {p.last_name}</span>
              <span className="arrow">{openId === p.id ? "▲" : "▼"}</span>
            </div>

            {openId === p.id && (
              <div className="expand-box">
                <p>เบอร์: {p.phone}</p>
                <p>อีเมล: {p.email}</p>
                <p>วันเกิด: {p.birth_date}</p>
                <p>เพศ: {p.gender}</p>
                <p>กรุ๊ปเลือด: {p.blood_group}</p>
                <p>เลขบัตร: {p.id_card}</p>

                <div className="medical-records-container">
                  <h4>Medical Records</h4>
                  {p.medical_records.length === 0 && <p>ไม่มีประวัติ</p>}
                  {p.medical_records.map((m) => (
                    <div key={m.record_id} className="medical-record">
                      <p>วันที่นัด: {m.appointment_date}</p>
                      <p>แพทย์: {m.doctor_name}</p>
                      <p>อาการ: {m.symptoms}</p>
                      <p>วินิจฉัย: {m.diagnosis}</p>
                      <p>แผนการรักษา: {m.treatment_plan}</p>
                      <hr/>
                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  )
}