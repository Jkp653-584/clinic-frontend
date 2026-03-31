import { useEffect, useState } from "react"
import { useApi } from "../../api"

export default function ManageStaff() {
  const { getStaffApi, createStaffApi, removeEmployeeApi } = useApi()

  const [employees, setEmployees] = useState<any[]>([])
  const [openId, setOpenId] = useState<string | null>(null)

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    id_card_number: "",
    phone_number: "",
    email: "",
  })

  // 🔥 parse S-001 → 1
  const parseStaffId = (displayId: string) => {
    const num = Number(displayId.replace("E-", ""))

    if (isNaN(num)) {
      throw new Error("Invalid staff_display_id format")
    }

    return num
  }

  const fetchStaff = async () => {
    const data = await getStaffApi()

    const mapped = data.map((e: any) => ({
      id: e.staff_display_id,
      user_id: e.user_id,
      name: `${e.first_name} ${e.last_name}`,
      phone: e.phone_number,
      email: e.email,
      id_card: e.id_card_number,
      position: e.position,
    }))

    setEmployees(mapped)
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const handleCreate = async () => {
    try {
      await createStaffApi({
        ...form,
        position: "Staff",
      })

      alert("เพิ่มพนักงานสำเร็จ")

      setForm({
        first_name: "",
        last_name: "",
        id_card_number: "",
        phone_number: "",
        email: "",
      })

      fetchStaff()
    } catch (err) {
      console.error(err)
      alert("เพิ่มไม่สำเร็จ")
    }
  }

  // 🔥 delete
  const handleDelete = async (e: any) => {
    if (!confirm("ยืนยันการลบพนักงาน?")) return

    try {
      await removeEmployeeApi(
        e.user_id,
        "staff",
        String(parseStaffId(e.id))
      )

      alert("ลบสำเร็จ")
      fetchStaff()
    } catch (err) {
      console.error(err)
      alert("ลบไม่สำเร็จ")
    }
  }

  return (
    <div className="owner-page">

      <h2>เพิ่มพนักงาน</h2>

      <div className="form-grid">
        <input placeholder="ชื่อจริง"
          value={form.first_name}
          onChange={e => setForm({ ...form, first_name: e.target.value })}
        />
        <input placeholder="นามสกุล"
          value={form.last_name}
          onChange={e => setForm({ ...form, last_name: e.target.value })}
        />
        <input placeholder="เลขบัตรประชาชน"
          value={form.id_card_number}
          onChange={e => setForm({ ...form, id_card_number: e.target.value })}
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
        เพิ่มพนักงาน
      </button>

      <h3>รายชื่อพนักงาน</h3>

      <div className="list">
        {employees.map(e => (
          <div key={e.id} className="list-item-wrapper">

            {/* ROW */}
            <div
              className="list-item"
              onClick={() => setOpenId(openId === e.id ? null : e.id)}
            >
              <span>{e.id}</span>
              <span>{e.name}</span>
              <span>{openId === e.id ? "▲" : "▼"}</span>
            </div>

            {/* EXPAND */}
            {openId === e.id && (
              <div className="expand-box">

                <p>ตำแหน่ง: {e.position}</p>
                <p>เบอร์: {e.phone}</p>
                <p>อีเมล: {e.email}</p>
                <p>เลขบัตร: {e.id_card}</p>

                <div className="expand-actions">

                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(e)}
                  >
                    🗑 ลบ
                  </button>

                </div>

              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  )
}