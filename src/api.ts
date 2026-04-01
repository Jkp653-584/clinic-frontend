const API_BASE_URL = 'https://project-wah5.onrender.com'
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
    updatePasswordApi: async (payload: {
      email: string
      new_password: string
      old_password?: string // 🔥 optional
    }) => {
      const token = localStorage.getItem("token")

      const res = await fetchWithLoading(`${API_BASE_URL}/auth/update-password`, {
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
        throw new Error(data.message || "Change password failed")
      }

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

  }
}
