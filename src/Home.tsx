export default function Home({
  onLoginClick,
}: {
  onLoginClick: () => void
}) {
  return (
    <div className="home-overlay">
      <div className="home-topbar">
        <h2>Clinic Management System</h2>
        <button onClick={onLoginClick}>Login</button>
      </div>

      <div className="home-content">
        <div className="home-inner">
          <h1>ระบบจัดการการทำงานภายในคลินิก</h1>

          <div className="home-description">
            จัดการนัดหมายผู้ป่วย ตารางแพทย์ ระบบเช็คอิน <br />
            และข้อมูลการรักษาในระบบเดียว
          </div>

          <button className="home-cta" onClick={onLoginClick}>
            เริ่มต้นใช้งาน
          </button>
        </div>
      </div>
      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section">
        <div className="container">
          <p className="section-sub">
            ระบบสนับสนุนการจัดการข้อมูลและการนัดหมายภายในคลินิก
          </p>

          <h2 className="section-title">ฟีเจอร์หลักของระบบ</h2>

          <p className="section-desc">
            รองรับการทำงานของทีมคลินิก ตั้งแต่การนัดหมาย ไปจนถึงการติดตามข้อมูลผู้ป่วย
          </p>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="icon">🩺</div>
              <h3>จัดการนัดหมายผู้ป่วย</h3>
              <p>สร้าง แก้ไข และติดตามสถานะการนัดหมายได้แบบเรียลไทม์</p>
            </div>

            <div className="feature-card">
              <div className="icon">🗂</div>
              <h3>ระบบเช็คอินผู้ป่วย</h3>
              <p>บันทึกการมาถึงของผู้ป่วย เพื่ออัปเดตสถานะการนัดหมายอัตโนมัติ</p>
            </div>

            <div className="feature-card">
              <div className="icon">👩‍⚕️</div>
              <h3>ตารางเวลาของแพทย์</h3>
              <p>ช่วยให้การจัดคิวและการให้บริการเป็นไปอย่างมีประสิทธิภาพ</p>
            </div>

            <div className="feature-card">
              <div className="icon">📁</div>
              <h3>จัดการข้อมูลคลินิก</h3>
              <p>รวมข้อมูลผู้ป่วย ประวัติการรักษา และข้อมูลสำคัญไว้ในระบบเดียว</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WORKFLOW SECTION ===== */}
      <section className="workflow-section">
        <div className="container">
          <h2 className="section-title">การทำงานของระบบ</h2>
          <p className="section-desc">
            ออกแบบให้สอดคล้องกับขั้นตอนการทำงานจริงของคลินิก
          </p>

          <div className="workflow-grid">
            <div className="workflow-step">
              <h4>Step 1</h4>
              <strong>ลงทะเบียน / เข้าสู่ระบบ</strong>
              <p>บุคลากรเข้าสู่ระบบตามสิทธิ์ที่ได้รับ</p>
            </div>

            <div className="workflow-step">
              <h4>Step 2</h4>
              <strong>จัดการข้อมูลและนัดหมาย</strong>
              <p>บันทึกข้อมูลผู้ป่วยและสร้างการนัดหมาย</p>
            </div>

            <div className="workflow-step">
              <h4>Step 3</h4>
              <strong>ให้บริการและติดตามผล</strong>
              <p>เช็คอินผู้ป่วยและติดตามข้อมูลการรักษา</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="container">
          <h3>MediCare Clinic System</h3>
          <p>ระบบสำหรับสนับสนุนการทำงานภายในคลินิก เพื่อเพิ่มประสิทธิภาพการให้บริการผู้ป่วย</p>
          <small>© 2026 MediCare Clinic. All rights reserved.</small>
        </div>
      </footer>
    </div>
  )
}