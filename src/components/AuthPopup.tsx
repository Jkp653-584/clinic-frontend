import { useState } from 'react'
import { useApi } from '../api'

type Mode = 'login' | 'register' | 'forgot'

export default function PopupAuthentication({
  onAuthSuccess,
  onClose,
}: {
  onAuthSuccess: () => void
  onClose: () => void
}) {
  const { loginApi, registerApi, updatePasswordApi, requestOtpApi } = useApi()

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

  // 🔥 Forgot/Reset fields
  const [newPassword, setNewPassword] = useState('')
  const [otp, setOtp] = useState('')

  function closePopup() {
    setClosing(true)
    setTimeout(onClose, 250)
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
    setFieldErrors({})
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setEmail('')
    setNewPassword('')
    setOtp('')
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
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- FORGOT / RESET PASSWORD ---------------- */
  const handleRequestOtp = async () => {
    if (!email) {
      setError('กรุณากรอกอีเมล')
      return
    }
    try {
      setLoading(true)
      await requestOtpApi(email)
      alert('ส่ง OTP ไปยังอีเมลเรียบร้อย 📧')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email || !newPassword || !otp) {
      setError('กรุณากรอกอีเมล, OTP และรหัสผ่านใหม่')
      return
    }

    try {
      setLoading(true)
      await updatePasswordApi({
        email,
        new_password: newPassword,
        otp,
      })
      alert('รีเซ็ตรหัสผ่านสำเร็จ 🎉')
      switchMode('login')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- FIELD CONFIG ---------------- */
  const loginFields = [
    { name: 'username', placeholder: 'Username', value: username, set: setUsername, type: 'text' },
    { name: 'password', placeholder: 'Password', value: password, set: setPassword, type: 'password' },
  ]

  const registerFields = [
    ...loginFields,
    { name: 'confirm_password', placeholder: 'Confirm password', value: confirmPassword, set: setConfirmPassword, type: 'password' },
    { name: 'email', placeholder: 'Email', value: email, set: setEmail, type: 'text' },
    { name: 'first_name', placeholder: 'First name', value: firstName, set: setFirstName, type: 'text' },
    { name: 'last_name', placeholder: 'Last name', value: lastName, set: setLastName, type: 'text' },
    { name: 'id_card_number', placeholder: 'ID Card Number', value: idCardNumber, set: setIdCardNumber, type: 'text' },
    { name: 'phone_number', placeholder: 'Phone number', value: phoneNumber, set: setPhoneNumber, type: 'text' },
  ]

  return (
    <>
      <div
        className={`popup-overlay ${closing ? 'closing' : ''}`}
        onClick={closePopup}
      />

      <div className={`auth-modal ${mode} ${closing ? 'closing' : ''}`}>
        <div className="auth-modal-scroll">
          <button className="auth-close" onClick={closePopup}>❌</button>

          <h2>
            {mode === 'login' ? 'เข้าสู่ระบบ'
              : mode === 'register' ? 'สร้างบัญชีผู้ป่วย'
                : 'รีเซ็ตรหัสผ่าน'}
          </h2>

          {mode === 'login' && (
            <div className="description" style={{ textAlign: "center", paddingBottom: 16 }}>
              เข้าสู่ระบบเพื่อจัดการข้อมูลการรักษาและการนัดหมาย
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <>
              {(mode === 'login' ? loginFields : registerFields).map(f => (
                <div key={f.name} className="field">
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={f.value}
                    className={fieldErrors[f.name] ? 'error' : ''}
                    onChange={(e) => {
                      f.set(e.target.value)
                      setFieldErrors(prev => ({ ...prev, [f.name]: '' }))
                    }}
                  />
                  {renderFieldError(f.name)}
                </div>
              ))}
            </>
          )}

          {mode === 'register' && (
            <>
              <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
              <select value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <div className="field-email-otp">
                <input
                  type="text"
                  placeholder="อีเมลของคุณ"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <button style={{ marginBottom: '8px' }} onClick={handleRequestOtp} disabled={loading}>
                  ขอ OTP
                </button>
              </div>

              <input
                type="text"
                placeholder="OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
              />
              <input
                type="password"
                placeholder="รหัสผ่านใหม่"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </>
          )}

          {error && <p className="error">{error}</p>}

          <div className="auth-button">
            {mode === 'login' && (
              <button disabled={loading} onClick={handleLogin}>
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            )}
            {mode === 'register' && (
              <button disabled={loading} onClick={handleRegister}>
                {loading ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชี'}
              </button>
            )}
            {mode === 'forgot' && (
              <button disabled={loading} onClick={handleResetPassword}>
                {loading ? 'กำลังรีเซ็ตรหัสผ่าน...' : 'รีเซ็ตรหัสผ่าน'}
              </button>
            )}
          </div>

          <p className="switch" style={{ textAlign: 'center' }}>
            {mode === 'login' && (
              <>
                ยังไม่มีบํญชี? <span onClick={() => switchMode('register')}>สมัครใช้งาน</span> |{' '}
                <span onClick={() => switchMode('forgot')}>ลืมรหัสผ่าน?</span>
              </>
            )}
            {mode === 'register' && (
              <>มีบัญชีอยูแล้ว? <span onClick={() => switchMode('login')}>เข้าสู่ระบบ</span></>
            )}
            {mode === 'forgot' && (
              <>กลับไปเข้าสู่ระบบ? <span onClick={() => switchMode('login')}>เข้าสู่ระบบ</span></>
            )}
          </p>
        </div>
      </div>
    </>
  )
}