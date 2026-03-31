import { useEffect, useState } from "react"
import { useApi } from "../../api"
import { useToast } from "../../components/ToastContext"

type CalendarDay = {
  date: string
  day: number
  disabled: boolean
}

type TimeSlot = {
  time: string
  disabled: boolean
}

export default function Appointments() {
  const { getMonthlySlotsApi, getAvailableSlotsApi, bookAppointmentApi } = useApi()
  const { showToast } = useToast()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  const [symptom, setSymptom] = useState("")
  const [note, setNote] = useState("")

  // โหลดปฏิทิน
  useEffect(() => {
    fetchCalendar()
  }, [])

  // โหลดเวลาเมื่อเลือกวัน
  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate)
    }
  }, [selectedDate])

  // mock calendar
  const fetchCalendar = async () => {
    try {
      const today = new Date()
      const month = today.toISOString().slice(0, 7) // YYYY-MM

      const data = await getMonthlySlotsApi(month)

      const days: CalendarDay[] = []

      const daysInMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      ).getDate()

      for (let i = 1; i <= daysInMonth; i++) {
        const date = `${month}-${String(i).padStart(2, "0")}`

        const slots = data[date] || []

        // 🔥 logic: ถ้ามี slot ที่ available อย่างน้อย 1 = ใช้ได้
        const hasAvailable = slots.some((s: any) => s.is_available)

        days.push({
          date,
          day: i,
          disabled: !hasAvailable,
        })
      }

      setCalendarDays(days)

    } catch (err: any) {
      showToast("error", err.message)
    }
  }

  // mock timeslot
  const fetchTimeSlots = async (date: string) => {
    try {
      const slots = await getAvailableSlotsApi(date)

      const mapped: TimeSlot[] = slots.map((s: any) => ({
        time: s.time,
        disabled: !s.is_available || s.remaining_capacity <= 0,
      }))

      setTimeSlots(mapped)

    } catch (err: any) {
      showToast("error", err.message)
    }
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      showToast("error", "กรุณาเลือกวันและเวลา")
      return
    }

    try {
      await bookAppointmentApi({
        appointment_date: selectedDate,
        start_time: selectedTime,
        symptoms: symptom || note || "-",
      })

      showToast("success", "จองคิวสำเร็จ 🎉")

      // reset
      setSelectedDate(null)
      setSelectedTime(null)
      setSymptom("")
      setNote("")
      setTimeSlots([])

      fetchCalendar() // refresh

    } catch (err: any) {
      showToast("error", err.message)
    }
  }

  return (

    <div className="appointment-page">

      <h1>นัดหมายเข้ารับการรักษา</h1>
      <p>เลือกวันและเวลาที่สะดวก ระบบจะแสดงเฉพาะช่วงเวลาที่แพทย์ว่าง</p>

      {/* CALENDAR */}

      <div className="calendar-grid">

        {calendarDays.map(day => (

          <button
            key={day.date}
            disabled={day.disabled}
            className={`calendar-day 
              ${selectedDate === day.date ? "active" : ""}
            `}
            onClick={() => setSelectedDate(day.date)}
          >
            {day.day}
          </button>

        ))}

      </div>


      {/* TIME SLOTS */}

      {selectedDate && (

        <>
          <h3>เลือกช่วงเวลา</h3>

          <div className="time-grid">

            {timeSlots.map(slot => (

              <button
                key={slot.time}
                disabled={slot.disabled}
                className={`time-slot 
                  ${selectedTime === slot.time ? "active" : ""}
                `}
                onClick={() => setSelectedTime(slot.time)}
              >
                {slot.time}
              </button>

            ))}

          </div>
        </>

      )}


      {/* SYMPTOM */}

      <div className="form-group">

        <label>อาการเบื้องต้น</label>

        <textarea
          placeholder="เช่น ไอ เจ็บคอ ปวดท้อง"
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
        />

      </div>


      {/* NOTE */}

      <div className="form-group">

        <label>หมายเหตุเพิ่มเติม (ถ้ามี)</label>

        <textarea
          placeholder="เช่น แพ้ยา หรือโรคประจำตัว"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

      </div>


      <button
        className="confirm-btn"
        onClick={handleSubmit}
      >
        ยืนยันการนัดหมาย
      </button>

    </div>
  )
}