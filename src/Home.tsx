export default function Home({
  onLoginClick,
}: {
  onLoginClick: () => void
}) {
  return (
    <div className="home-overlay">
      <div className="home-topbar">
        <h2>🏥 Clinic</h2>
        <button onClick={onLoginClick}>Login</button>
      </div>

      <div className="home-content">
        <div className="home-card">
          <h1>Welcome to Clinic System</h1>
          <div>
            ระบบจัดการนัดหมายแพทย์และผู้ป่วย
          </div>
        </div>
      </div>
    </div>
  )
}
