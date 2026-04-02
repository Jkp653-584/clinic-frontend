import { useEffect, useState } from "react"
import { useApi } from "../../api"
import { useToast } from "../../components/ToastContext"

type Patient = {
    patient_id: number
    id_card_number: string
    first_name: string
    last_name: string
}

type CalendarDay = {
    date: string
    day: number
    disabled: boolean
}

type TimeSlot = {
    time: string
    disabled: boolean
}

export default function WalkIn() {
    const {
        getPatientsApi,
        walkInRegisterApi,
        getMonthlySlotsApi,
        getAvailableSlotsApi,
        walkInAppointmentApi,
    } = useApi()

    const { showToast } = useToast()

    // =====================
    // PATIENT
    // =====================
    const [idCard, setIdCard] = useState("")
    const [patientId, setPatientId] = useState<number | "">("")
    const [patient, setPatient] = useState<Patient | null>(null)

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
        gender: "",
        birth_date: "",
        id_card_number: "",
    })

    // =====================
    // SEARCH
    // =====================
    const handleSearch = async () => {
        try {
            const data = await getPatientsApi()
            const found = data.find((p: any) => p.id_card_number === idCard)

            if (found) {
                setPatient(found)
                setPatientId(found.patient_id)
                showToast("success", `พบ: ${found.first_name}`)
            } else {
                setPatient(null)
                setForm((prev) => ({ ...prev, id_card_number: idCard }))
                showToast("error", "ไม่พบข้อมูล → สมัครได้เลย")
            }
        } catch (err: any) {
            showToast("error", err.message)
        }
    }

    // =====================
    // REGISTER
    // =====================
    const handleRegister = async () => {
        try {
            console.log("FORM:", form)
            const res = await walkInRegisterApi(form)

            // ✅ ใส่ patientId อัตโนมัติ
            setPatientId(res.patient_id)

            // ✅ เคลียร์ฟอร์มสมัคร
            setForm({
                first_name: "",
                last_name: "",
                phone_number: "",
                email: "",
                gender: "",
                birth_date: "",
                id_card_number: "",
            })

            showToast("success", `สมัครสำเร็จ ID: ${res.patient_id}`)
        } catch (err: any) {
            showToast("error", err.message)
        }
    }

    // =====================
    // APPOINTMENT
    // =====================
    const today = new Date()
    const [currentMonth, setCurrentMonth] = useState(today.toISOString().slice(0, 7))
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
    const [hasAvailableDay, setHasAvailableDay] = useState(true)
    const [symptom, setSymptom] = useState("")
    const [note, setNote] = useState("")

    useEffect(() => { fetchCalendar() }, [currentMonth])
    useEffect(() => { if (selectedDate) fetchTimeSlots(selectedDate) }, [selectedDate])

    const fetchCalendar = async () => {
        const data = await getMonthlySlotsApi(currentMonth)
        const days: CalendarDay[] = []
        const [year, month] = currentMonth.split("-").map(Number)
        const daysInMonth = new Date(year, month, 0).getDate()
        let hasAvailable = false

        for (let i = 1; i <= daysInMonth; i++) {
            const date = `${currentMonth}-${String(i).padStart(2, "0")}`
            const slots = data[date] || []
            const available = slots.some((s: any) => s.is_available)
            if (available) hasAvailable = true
            days.push({ date, day: i, disabled: !available })
        }

        setCalendarDays(days)
        setHasAvailableDay(hasAvailable)
        setSelectedDate(null)
        setSelectedTime(null)
        setTimeSlots([])
    }

    const fetchTimeSlots = async (date: string) => {
        const slots = await getAvailableSlotsApi(date)
        setTimeSlots(slots.map((s: any) => ({
            time: s.time,
            disabled: !s.is_available || s.remaining_capacity <= 0,
        })))
    }

    const handleSubmit = async () => {
        if (!patientId) return showToast("error", "ใส่ patient id")
        if (!selectedDate || !selectedTime) return showToast("error", "เลือกวันเวลา")

        await walkInAppointmentApi({
            patient_id: patientId,
            appointment_date: selectedDate,
            start_time: selectedTime,
            symptoms: symptom || "-",
            notes: note || "-",
        })

        showToast("success", "นัดหมายสำเร็จ 🎉")

        // ✅ เคลียร์ selection หลังนัดสำเร็จ
        setSelectedDate(null)
        setSelectedTime(null)
        setSymptom("")
        setNote("")
    }

    return (
        <div className="wi-container">
            <h1 className="wi-title">Check-in / นัดหมาย</h1>

            <div className="wi-layout">

                {/* LEFT */}
                <div className="wi-left">

                    <div className="wi-card">
                        <h3>ค้นหาคนไข้</h3>
                        <input
                            placeholder="เลขบัตรประชาชน"
                            value={idCard}
                            onChange={(e) => setIdCard(e.target.value)}
                        />
                        <button onClick={handleSearch}>ค้นหา</button>

                        {patient && (
                            <div className="wi-found">
                                ✔ {patient.first_name} {patient.last_name}
                            </div>
                        )}
                    </div>

                    <div className="wi-card">
                        <h3>สมัครคนไข้ใหม่</h3>

                        <input
                            placeholder="เลขบัตร"
                            value={form.id_card_number}
                            onChange={(e) => setForm({ ...form, id_card_number: e.target.value })}
                        />
                        <input placeholder="ชื่อ"
                            value={form.first_name}
                            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                        />
                        <input placeholder="นามสกุล"
                            value={form.last_name}
                            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                        />
                        <input placeholder="เบอร์"
                            value={form.phone_number}
                            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                        />
                        <input placeholder="Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />

                        <div className="wi-gender">
                            <label>เพศ</label>
                            <div className="wi-gender-options">
                                <label>
                                    <input
                                        type="radio"
                                        value="male"
                                        checked={form.gender === "male"}
                                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                    />
                                    ชาย
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="female"
                                        checked={form.gender === "female"}
                                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                    />
                                    หญิง
                                </label>
                            </div>
                        </div>

                        <input type="date"
                            value={form.birth_date}
                            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                        />

                        <button onClick={handleRegister}>สมัคร</button>
                    </div>

                </div>

                {/* RIGHT */}
                <div className="wi-right appointment-page">
                    <div className="wi-bind">
                        <label>Patient ID</label>
                        <input
                            value={patientId}
                            onChange={(e) => setPatientId(Number(e.target.value))}
                        />
                    </div>
                    {/* ===================== */}
                    {/* MONTH HEADER */}
                    {/* ===================== */}
                    <div className="calendar-header">
                        <button className="nav-btn" onClick={() => {
                            const date = new Date(currentMonth + "-01");
                            date.setMonth(date.getMonth() - 1);
                            setCurrentMonth(date.toISOString().slice(0, 7));
                        }}>‹</button>

                        <div className="month-label">
                            {new Date(currentMonth + "-01").toLocaleDateString("th-TH", {
                                month: "long",
                                year: "numeric",
                            })}
                        </div>

                        <button className="nav-btn" onClick={() => {
                            const date = new Date(currentMonth + "-01");
                            date.setMonth(date.getMonth() + 1);
                            setCurrentMonth(date.toISOString().slice(0, 7));
                        }}>›</button>
                    </div>
                    {/* ===================== */}
                    {/* STEP 1: CALENDAR */}
                    {/* ===================== */}
                    {!hasAvailableDay ? (

                        <div className="no-available">
                            ❌ ไม่มีคิวว่างในเดือนนี้<br />
                            กรุณาเลือกเดือนอื่น
                        </div>

                    ) : (

                        <div className="calendar-grid">
                            {calendarDays.map(day => (
                                <button
                                    key={day.date}
                                    disabled={day.disabled}
                                    className={`calendar-day 
                                    ${selectedDate === day.date ? "active" : ""}
                                    `}
                                    onClick={() => {
                                        setSelectedDate(day.date)
                                        setSelectedTime(null)
                                    }}
                                >
                                    {day.day}
                                </button>
                            ))}
                        </div>

                    )}

                    {selectedDate && (
                        <div className="time-grid">
                            {timeSlots.map(slot => (
                                <button
                                    key={slot.time}
                                    disabled={slot.disabled}
                                    className={`time-slot ${selectedTime === slot.time ? "active" : ""}`}
                                    onClick={() => setSelectedTime(slot.time)}
                                >
                                    {slot.time}
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedTime && (
                        <div className="wi-textarea-group">
                            <textarea
                                placeholder="อาการ"
                                value={symptom}
                                onChange={(e) => setSymptom(e.target.value)}
                            />
                            <textarea
                                placeholder="หมายเหตุ"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />

                            <button className="confirm-btn" onClick={handleSubmit}>
                                ยืนยันการนัดหมาย
                            </button>
                        </div>
                    )}

                </div>

            </div>
        </div>
    )
}