import { useState } from "react"
import type { User } from "../App"
import { useApi } from "../api"
import { useToast } from "../components/ToastContext"

export default function Settings({ user }: { user: User }) {
  const { showToast } = useToast()
  const { updatePasswordApi, requestOtpApi } = useApi()

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  const [resetNewPassword, setResetNewPassword] = useState("")
  const [otp, setOtp] = useState("") // 🔥 OTP สำหรับ reset
  const [showResetForm, setShowResetForm] = useState(false)

  const [showChangePassword, setShowChangePassword] = useState(false)

  const [loading, setLoading] = useState(false)

  /* ===================== */
  /* 🔐 CHANGE PASSWORD */
  /* ===================== */
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      return showToast("error", "กรุณากรอกข้อมูลให้ครบ")
    }

    try {
      setLoading(true)

      await updatePasswordApi({
        email: user.email,
        old_password: oldPassword,
        new_password: newPassword,
      })

      showToast("success", "เปลี่ยนรหัสผ่านสำเร็จ 🎉")

      setOldPassword("")
      setNewPassword("")
      setShowChangePassword(false)
    } catch (error: any) {
      showToast("error", error.message || "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  /* ===================== */
  /* 📧 RESET PASSWORD */
  /* ===================== */
  const handleRequestOtp = async () => {
    if (!user.email) return
    try {
      setLoading(true)
      await requestOtpApi(user.email)
      showToast("success", "ส่ง OTP ไปยังอีเมลเรียบร้อย 📧")
    } catch (error: any) {
      showToast("error", error.message || "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!resetNewPassword || !otp) {
      return showToast("error", "กรุณากรอกรหัสใหม่และ OTP")
    }

    try {
      setLoading(true)

      // 🔥 แบบเดียวกับ authpop: reset password ส่ง email + new_password + otp ไม่ใช้ token
      await updatePasswordApi({
        email: user.email,
        new_password: resetNewPassword,
        otp,
      })

      showToast("success", "รีเซ็ตรหัสผ่านสำเร็จ 🎉")

      setResetNewPassword("")
      setOtp("")
      setShowResetForm(false)
    } catch (error: any) {
      showToast("error", error.message || "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings-container">
      <h1 className="settings-title">ตั้งค่า</h1>

      {/* ===================== */}
      {/* 📧 RESET PASSWORD */}
      {/* ===================== */}
      <div className="settings-section">
        <h2>รีเซ็ตรหัสผ่าน</h2>

        {!showResetForm && (
          <button className="reset-btn" onClick={() => setShowResetForm(true)}>
            รีเซ็ตรหัสผ่าน
          </button>
        )}

        {showResetForm && (
          <>
            <div className="form-group form-group-email-otp">
              <label>อีเมล</label>
              <div className="email-otp-row">
                <input value={user.email} disabled />
                <button onClick={handleRequestOtp} disabled={loading}>
                  ขอ OTP
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>รหัสใหม่</label>
              <input
                type="password"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div className="button-row">
              <button
                className="save-btn"
                onClick={handleResetPassword}
                disabled={loading}
              >
                {loading ? "กำลังส่ง..." : "ยืนยันรีเซ็ต"}
              </button>

              <button
                className="cancel-btn"
                onClick={() => {
                  setShowResetForm(false)
                  setResetNewPassword("")
                  setOtp("")
                }}
              >
                ยกเลิก
              </button>
            </div>
          </>
        )}
      </div>

      {/* ===================== */}
      {/* 🔐 CHANGE PASSWORD */}
      {/* ===================== */}
      <div className="settings-section">
        <h2>เปลี่ยนรหัสผ่าน</h2>

        {!showChangePassword && (
          <button className="edit-btn" onClick={() => setShowChangePassword(true)}>
            เปลี่ยนรหัสผ่าน
          </button>
        )}

        {showChangePassword && (
          <>
            <div className="form-group">
              <label>รหัสผ่านเก่า</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>รหัสผ่านใหม่</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="button-row">
              <button
                className="save-btn"
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? "กำลังบันทึก..." : "ยืนยันเปลี่ยนรหัส"}
              </button>

              <button
                className="cancel-btn"
                onClick={() => {
                  setShowChangePassword(false)
                  setOldPassword("")
                  setNewPassword("")
                }}
              >
                ยกเลิก
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}