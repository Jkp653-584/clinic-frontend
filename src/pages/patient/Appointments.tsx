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

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const [currentMonth, setCurrentMonth] = useState(
    today.toISOString().slice(0, 7)
  )

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  const [hasAvailableDay, setHasAvailableDay] = useState(true)

  const [symptom, setSymptom] = useState("")
  const [note, setNote] = useState("")

  // =====================
  useEffect(() => {
    fetchCalendar()
  }, [currentMonth])

  useEffect(() => {
    if (selectedDate) {
      fetchTimeSlots(selectedDate)
    }
  }, [selectedDate])

  // =====================
  const fetchCalendar = async () => {
    try {
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

        days.push({
          date,
          day: i,
          disabled: !available,
        })
      }

      setCalendarDays(days)
      setHasAvailableDay(hasAvailable)

      setSelectedDate(null)
      setSelectedTime(null)
      setTimeSlots([])

    } catch (err: any) {
      showToast("error", err.message)
    }
  }

  // =====================
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

  // =====================
  const handlePrevMonth = () => {
    const date = new Date(currentMonth + "-01")
    date.setMonth(date.getMonth() - 1)
    setCurrentMonth(date.toISOString().slice(0, 7))
  }

  const handleNextMonth = () => {
    const date = new Date(currentMonth + "-01")
    date.setMonth(date.getMonth() + 1)
    setCurrentMonth(date.toISOString().slice(0, 7))
  }

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + "-01")
    return date.toLocaleDateString("th-TH", {
      month: "long",
      year: "numeric",
    })
  }

  const MAX_DAYS = 30

  const canGoPrev = () => {
    const [year, month] = currentMonth.split("-").map(Number)

    const current = new Date(year, month - 1, 1) // เดือนที่กำลังอยู่
    const today = new Date()
    const min = new Date(today.getFullYear(), today.getMonth(), 1) // เดือนปัจจุบัน (วันแรก)

    return current.getTime() > min.getTime()
  }
  const canGoNext = () => {
    const today = new Date()
    const maxDate = new Date()
    maxDate.setDate(today.getDate() + MAX_DAYS)

    const nextMonth = new Date(currentMonth + "-01")
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    return nextMonth <= maxDate
  }

  // =====================
  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      showToast("error", "กรุณาเลือกวันและเวลา")
      return
    }

    // 🔥 กันเคสวันเดียวกัน
    if (selectedDate === todayStr) {
      showToast("error", "การนัดหมายออนไลน์ต้องล่วงหน้าอย่างน้อย 1 วัน")
      return
    }

    try {
      await bookAppointmentApi({
        appointment_date: selectedDate,
        start_time: selectedTime,
        symptoms: symptom || note || "-",
      })

      showToast("success", "จองคิวสำเร็จ 🎉")

      setSelectedDate(null)
      setSelectedTime(null)
      setSymptom("")
      setNote("")
      setTimeSlots([])

      fetchCalendar()

    } catch (err: any) {
      showToast("error", err.message)
    }
  }

  const isTodaySelected = selectedDate === todayStr

  return (
    <div className="appointment-page">

      <h1>นัดหมายเข้ารับการรักษา</h1>
      <p>เลือกวันและเวลาที่สะดวก ระบบจะแสดงเฉพาะช่วงเวลาที่แพทย์ว่าง</p>

      <div className="calendar-header">
        <button className="nav-btn" onClick={handlePrevMonth} disabled={!canGoPrev()}>‹</button>
        <div className="month-label">{formatMonth(currentMonth)}</div>
        <button className="nav-btn" onClick={handleNextMonth} disabled={!canGoNext()}>›</button>
      </div>

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
        <>
          <h3>เลือกช่วงเวลา</h3>

          <div className="time-grid">
            {timeSlots.map(slot => {
              const isDisabled = slot.disabled

              return (
                <button
                  key={slot.time}
                  disabled={isDisabled}
                  className={`time-slot 
                    ${selectedTime === slot.time ? "active" : ""}
                    ${isDisabled ? "disabled" : ""}
                  `}
                  onClick={() => {
                    if (isTodaySelected) return
                    setSelectedTime(slot.time)
                  }}
                >
                  {slot.time}
                </button>
              )
            })}
          </div>
          {/* 🔥 แจ้งเตือน */}
          {isTodaySelected && (
            <div className="warning-box" style={{ marginTop: "25px" }}>
              ⚠️ การแสดงเวลานี้มีไว้เพื่อให้ทราบช่วงเวลาที่แพทย์ว่างเท่านั้น<br />
              หากต้องการนัดหมายออนไลน์ กรุณานัดล่วงหน้าอย่างน้อย 1 วัน<br />
              หรือสามารถเข้ารับบริการแบบ walk-in ได้
            </div>
          )}
        </>
      )}

      {selectedTime && (
        <>
          <div className="form-group">
            <label>อาการเบื้องต้น</label>
            <textarea
              placeholder="เช่น ไอ เจ็บคอ ปวดท้อง"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>หมายเหตุเพิ่มเติม (ถ้ามี)</label>
            <textarea
              placeholder="เช่น แพ้ยา หรือโรคประจำตัว"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button className="confirm-btn" onClick={handleSubmit}>
            ยืนยันการนัดหมาย
          </button>
        </>
      )}

    </div>
  )
}