import { useState } from 'react'
import { useApi } from './api'

type Mode = 'login' | 'register'

export default function popup_authentication({
  onAuthSuccess,
  onClose,
}: {
  onAuthSuccess: () => void
  onClose: () => void
}) {
  const { loginApi, registerApi } = useApi()

  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [closing, setClosing] = useState(false)

  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // fields
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [idCardNumber, setIdCardNumber] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [gender, setGender] = useState('')

  function closePopup() {
    setClosing(true)
    setTimeout(onClose, 250)
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
    setFieldErrors({})
  }

  function renderFieldError(name: string) {
    if (!fieldErrors[name]) return null
    return <p className="field-error">{fieldErrors[name]}</p>
  }

  /* ---------------- LOGIN ---------------- */

  async function handleLogin() {
    try {
      setLoading(true)
      setError('')
      setFieldErrors({})

      const res = await loginApi(username, password)
      localStorage.setItem('token', res.access_token)
      onAuthSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- REGISTER ---------------- */

  async function handleRegister() {
    // frontend validation
    if (password !== confirmPassword) {
      setFieldErrors({ confirm_password: 'Passwords do not match' })
      return
    }

    try {
      setLoading(true)
      setError('')
      setFieldErrors({})

      await registerApi({
        username,
        password,
        email,
        role: 'patient',
        id_card_number: idCardNumber,
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate,
        phone_number: phoneNumber,
        gender,
      })

      setMode('login')
    } catch (err: any) {
      // 🔥 รองรับ field errors จาก backend
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- FIELD CONFIG ---------------- */

  const loginFields = [
    {
      name: 'username',
      placeholder: 'Username',
      value: username,
      set: setUsername,
      type: 'text',
    },
    {
      name: 'password',
      placeholder: 'Password',
      value: password,
      set: setPassword,
      type: 'password',
    },
  ]

  const registerFields = [
    ...loginFields,
    {
      name: 'confirm_password',
      placeholder: 'Confirm password',
      value: confirmPassword,
      set: setConfirmPassword,
      type: 'password',
    },
    {
      name: 'email',
      placeholder: 'Email',
      value: email,
      set: setEmail,
      type: 'text',
    },
    {
      name: 'first_name',
      placeholder: 'First name',
      value: firstName,
      set: setFirstName,
      type: 'text',
    },
    {
      name: 'last_name',
      placeholder: 'Last name',
      value: lastName,
      set: setLastName,
      type: 'text',
    },
    {
      name: 'id_card_number',
      placeholder: 'ID Card Number',
      value: idCardNumber,
      set: setIdCardNumber,
      type: 'text',
    },
    {
      name: 'phone_number',
      placeholder: 'Phone number',
      value: phoneNumber,
      set: setPhoneNumber,
      type: 'text',
    },
  ]

  const fields = mode === 'login' ? loginFields : registerFields

  return (
    <>
      <div
        className={`popup-overlay ${closing ? 'closing' : ''}`}
        onClick={closePopup}
      />

      <div className={`auth-modal ${mode} ${closing ? 'closing' : ''}`}>
        <button className="auth-close" onClick={closePopup}>×</button>

        <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>

        {fields.map((f) => (
          <div key={f.name} className="field">
            <input
              type={f.type}
              placeholder={f.placeholder}
              value={f.value}
              className={fieldErrors[f.name] ? 'error' : ''}
              onChange={(e) => {
                f.set(e.target.value)
                setFieldErrors((prev) => ({ ...prev, [f.name]: '' }))
              }}
            />
            {renderFieldError(f.name)}
          </div>
        ))}

        {mode === 'register' && (
          <>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </>
        )}

        {error && <p className="error">{error}</p>}

        {mode === 'login' ? (
          <button disabled={loading} onClick={handleLogin}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        ) : (
          <button disabled={loading} onClick={handleRegister}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        )}

        <p className="switch">
          {mode === 'login'
            ? <>No account? <span onClick={() => switchMode('register')}>Register</span></>
            : <>Already have account? <span onClick={() => switchMode('login')}>Login</span></>
          }
        </p>
      </div>
    </>
  )
}
