const API_BASE_URL = 'https://project-wah5.onrender.com'
import { useFetchWithLoading } from './fetchWithLoading'

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
    getMeApi: async () => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('No token')

      const res = await fetchWithLoading(`${API_BASE_URL}/patients/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        throw new Error('Unauthorized')
      }

      if (!res.ok) {
        throw new Error('Failed to fetch user')
      }

      return res.json() // { id, username, role: 'patient' | 'doctor' }
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
  }
}
