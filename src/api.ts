const API_BASE_URL = 'http://localhost:8000'
// const API_BASE_URL = 'https://project-wah5.onrender.com'
import type { User } from './App'
import { useFetchWithLoading } from './components/fetchWithLoading'

export function useApi() {
  const fetchWithLoading = useFetchWithLoading()
  return {
    loginApi: async (username: string, password: string) => {
      const res = await fetchWithLoading(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()
      if (!res.ok || data.success === false) {
        throw new Error(data.message)
      }

      return data
    },

    registerApi: async (data: any) => {
      const res = await fetchWithLoading(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (res.status === 422) {
        const fieldErrors: Record<string, string> = {}

        json.detail.forEach((err: any) => {
          const field = err.loc?.[1]
          if (field) {
            fieldErrors[field] = err.msg
          }
        })

        const error: any = new Error('Validation error')
        error.fieldErrors = fieldErrors
        throw error
      }

      if (!res.ok) {
        throw new Error(json.message || 'Register failed')
      }

      return json
    },
    /* ---------- ME (ROLE) ---------- */
    getMeApi: async (): Promise<User> => {
      const token = localStorage.getItem('token')

      console.log("TOKEN:", token)

      if (!token) {
        throw new Error("No token found (user not logged in)")
      }

      let res: Response

      try {
        res = await fetchWithLoading(`${API_BASE_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (err) {
        console.error("❌ Network error:", err)
        throw new Error("Network error - cannot connect to server")
      }

      console.log("STATUS:", res.status)

      let data: any

      try {
        data = await res.json()
      } catch (err) {
        console.error("❌ JSON parse error:", err)
        throw new Error("Invalid response format (not JSON)")
      }

      console.log("RESPONSE DATA:", data)

      // 🔴 401
      if (res.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Unauthorized (token expired)")
      }

      // 🔴 500
      if (res.status === 500) {
        console.error("🔥 Backend error:", data)
        throw new Error("Server error (500) - backend crash")
      }

      // 🔴 อื่น ๆ
      if (!res.ok) {
        console.error("❌ API error:", data)
        throw new Error(data?.message || "Failed to fetch user")
      }

      // 🔴 data structure check
      if (!data.role) {
        throw new Error("Invalid response: missing role")
      }

      if (data.role !== "owner" && !data.profile) {
        throw new Error("Invalid response: missing profile")
      }

      // ✅ flatten
      if (data.role === "owner") {
        return {
          role: data.role,
          username: "owner",
          email: "",
        }
      }

      return {
        role: data.role,
        ...data.profile,
      }
    },

    /* ---------- LOGOUT ---------- */
    logoutApi: async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      await fetchWithLoading(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    },

    /* ---------- OWNER: PATIENT ---------- */
    getPatientsApi: async () => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(`${API_BASE_URL}/patients/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "Fetch patients failed")

      return data.data
    },

    /* ---------- OWNER: STAFF ---------- */
    getStaffApi: async () => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(`${API_BASE_URL}/staff/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "Fetch staff failed")

      return data.data
    },

    createStaffApi: async (payload: any) => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(`${API_BASE_URL}/staff/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "Create staff failed")

      return data
    },

    /* ---------- OWNER: DOCTOR ---------- */
    getDoctorsApi: async () => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(`${API_BASE_URL}/doctor/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "Fetch doctors failed")

      return data.data
    },

    createDoctorApi: async (payload: any) => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(`${API_BASE_URL}/doctor/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "Create doctor failed")

      return data
    },

    // 🔥 DELETE DOCTOR / STAFF
    removeEmployeeApi: async (user_id: number, role: string, specific_id: string) => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(
        `${API_BASE_URL}/owner/employees/${user_id}?role=${role}&specific_id=${specific_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Delete failed")

      return data
    },

    // 🔥 CREATE DOCTOR SCHEDULE
    createDoctorScheduleApi: async (payload: any) => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(`${API_BASE_URL}/book/schedules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Create schedule failed")

      return data
    },
    getDoctorSchedulesApi: async () => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(
        `${API_BASE_URL}/book/schedules`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      return data.data
    },
    updateProfileApi: async <
      T extends "patient" | "doctor" | "staff"
    >(
      role: T,
      payload: any,
      user_id?: number // 🔥 optional
    ) => {
      const token = localStorage.getItem("token")

      if (!token) throw new Error("No token found")

      const rolePathMap = {
        patient: "patients",
        doctor: "doctor",
        staff: "staff",
      }

      const path = rolePathMap[role]

      // 🔥 แยก endpoint
      const url =
        role === "patient"
          ? `${API_BASE_URL}/${path}/me`
          : `${API_BASE_URL}/${path}/${user_id}` // 👈 owner ใช้ user_id

      const res = await fetchWithLoading(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Unauthorized")
      }

      if (!res.ok) {
        throw new Error(data.message || "Update failed")
      }

      return data
    },
    /* ---------------- REQUEST OTP ---------------- */
    requestOtpApi: async (email: string) => {
      const res = await fetchWithLoading(`${API_BASE_URL}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Request OTP failed")
      return data
    },

    /* ---------------- UPDATE / RESET PASSWORD ---------------- */
    updatePasswordApi: async (payload: {
      email: string
      new_password: string
      otp?: string
      old_password?: string
    }) => {
      // 🔥 ถ้า old_password มีค่า → change password (ต้องมี token)
      // 🔥 ถ้า otp มีค่า → forgot/reset password (ไม่ต้องใช้ token)
      const isChange = !!payload.old_password
      const token = isChange ? localStorage.getItem("token") : null

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }

      if (isChange && token) headers["Authorization"] = `Bearer ${token}`

      const res = await fetchWithLoading(`${API_BASE_URL}/auth/update-password`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Unauthorized")
      }

      if (!res.ok) throw new Error(data.message || "Update password failed")
      return data
    },
    /* ---------- PATIENT: APPOINTMENT ---------- */

    getMonthlySlotsApi: async (targetMonth: string) => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(
        `${API_BASE_URL}/appointment/monthly-slots?target_month=${targetMonth}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Fetch monthly slots failed")

      return data.data
    },

    getAvailableSlotsApi: async (targetDate: string) => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(
        `${API_BASE_URL}/appointment/available-slots?target_date=${targetDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Fetch slots failed")

      return data.slots
    },

    bookAppointmentApi: async (payload: {
      appointment_date: string
      start_time: string
      symptoms: string
    }) => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(`${API_BASE_URL}/appointment/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Booking failed")

      return data
    },
    /* ---------- PATIENT: APPOINTMENT HISTORY ---------- */

    // 🔥 ดึงประวัติการนัด
    getMyAppointmentsApi: async () => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(`${API_BASE_URL}/appointment/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (res.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Unauthorized")
      }

      if (!res.ok) {
        throw new Error(data.message || "Fetch appointments failed")
      }

      return data.data
    },

    // 🔥 เปลี่ยน status (ใช้ cancel)
    updateAppointmentStatusApi: async (
      appointment_id: number,
      status: string
    ) => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(
        `${API_BASE_URL}/appointment/${appointment_id}/status`,
        {
          method: "PATCH", // 🔥 ส่วนใหญ่ endpoint แบบนี้ใช้ PATCH
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      )

      const data = await res.json()

      if (res.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Unauthorized")
      }

      if (!res.ok) {
        throw new Error(data.message || "Update status failed")
      }

      return data
    },
    createMedicalRecordApi: async (
      appointment_id: number,
      body: {
        symptoms: string
        diagnosis: string
        treatment_plan: string
      }
    ) => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(
        `${API_BASE_URL}/appointment/${appointment_id}/medical-records`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      )

      const data = await res.json()

      if (res.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Unauthorized")
      }

      if (!res.ok) {
        throw new Error(data.message || "Create medical record failed")
      }

      return data
    },// =============================
    // 📅 APPOINTMENT API
    // =============================

    // 🔥 ดึงนัดหมายทั้งหมด (staff ใช้ Today + All)
    getAllAppointmentsApi: async () => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(
        `${API_BASE_URL}/appointment/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      if (res.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Unauthorized")
      }

      if (!res.ok) {
        throw new Error(data.message || "Fetch appointments failed")
      }

      return data.data
    },

    // =============================
    // 👤 PATIENT (SEARCH PAGE)
    // =============================

    // 🔥 คนไข้ที่มีนัด (ไม่ใช่ completed / cancelled)
    getActivePatientsApi: async () => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(
        `${API_BASE_URL}/appointment/with-active-appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      if (res.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Unauthorized")
      }

      if (!res.ok) {
        throw new Error(data.message || "Fetch patients failed")
      }

      return data.data
    },

    updateMedicalRecordApi: async (
      record_id: number,
      payload: {
        symptoms: string
        diagnosis: string
        treatment_plan: string
      }
    ) => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(
        `${API_BASE_URL}/appointment/medical-records/${record_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      const data = await res.json()

      if (res.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Unauthorized")
      }

      if (!res.ok) {
        throw new Error(data.message || "Update medical record failed")
      }

      return data
    },
    // ---------- STAFF: INCIDENT ----------
    reportIncidentApi: async (payload: {
      title: string
      description: string
      incident_date: string
      incident_time: string
    }) => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const res = await fetchWithLoading(`${API_BASE_URL}/incidents/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Unauthorized")
      }

      if (!res.ok) {
        throw new Error(data.message || "ส่งรายงานเหตุการณ์ไม่สำเร็จ")
      }

      return data
    },
    /* ---------- OWNER: DASHBOARD ---------- */
    getDashboardStatsApi: async () => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const res = await fetchWithLoading(`${API_BASE_URL}/owner/dashboard-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Fetch dashboard stats failed")
      }

      return data
    },

    getAllIncidentsApi: async () => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No token found")

      const res = await fetchWithLoading(`${API_BASE_URL}/incidents/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Fetch incidents failed")
      }

      return data
    },// 📝 สมัครคนไข้ walk-in
    walkInRegisterApi: async (payload: {
      first_name: string
      last_name: string
      phone_number: string
      email: string
      id_card_number: string
      gender: string
      birth_date: string
    }) => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(`${API_BASE_URL}/auth/walk-in-register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Unauthorized")
      }

      if (!res.ok) {
        throw new Error(data.message || "Register walk-in failed")
      }

      return data
    },

    // 📅 สร้างนัดหมาย walk-in
    walkInAppointmentApi: async (payload: {
      patient_id: number
      appointment_date: string
      start_time: string
      symptoms: string
      notes: string
    }) => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(`${API_BASE_URL}/appointment/walk-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Unauthorized")
      }

      if (!res.ok) {
        throw new Error(data.message || "Walk-in appointment failed")
      }

      return data
    },
    /* ---------- CHATBOT ---------- */

    // 📩 ส่งข้อความ + รูป (FormData)
    sendChatbotApi: async (payload: {
      session_id: string
      message: string
      image?: File | null
    }) => {
      const token = localStorage.getItem("token")

      const formData = new FormData()
      formData.append("session_id", payload.session_id)
      formData.append("message", payload.message)

      if (payload.image) {
        formData.append("image", payload.image)
      }

      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      const data = await res.json()

      if (res.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Unauthorized")
      }

      if (!res.ok) {
        throw new Error(data.message || "Chatbot send failed")
      }

      return data // 🔥 มี reply กลับมา
    },

    getChatbotHistoryApi: async (session_id: string) => {
      const token = localStorage.getItem("token")

      const res = await fetch(
        `${API_BASE_URL}/ai/chat/history/${session_id}`, // ถ้า backend ใช้ path param ก็โอเค
        {
          method: "GET",
          headers: {
            'Content-Type': 'application/json', // optional
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          // ❌ ไม่ต้องมี body ใน GET
        }
      )

      const data = await res.json()

      if (res.status === 401) {
        localStorage.removeItem("token")
        throw new Error("Unauthorized")
      }

      if (!res.ok) {
        throw new Error(data.message || "Fetch history failed")
      }

      return data.data
    }


  }
}

/* ---------- CHATBOT HOOK ---------- */
export function useChatbotApi() {
  const { sendChatbotApi, getChatbotHistoryApi } = useApi()

  return {
    sendMessage: sendChatbotApi,
    getHistory: getChatbotHistoryApi,
  }
}
