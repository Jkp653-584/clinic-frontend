export default function Dashboard() {
  return (
    <div>
      <h1>Doctor Dashboard</h1>

      <div className="cards">
        <div className="card">
          <h3>Appointments Today</h3>
          <p>12</p>
        </div>

        <div className="card">
          <h3>Patients Today</h3>
          <p>8</p>
        </div>
      </div>

      <h2>Today's Schedule</h2>

      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Patient</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>09:00</td>
            <td>Mr. A</td>
            <td>Check-up</td>
          </tr>
          <tr>
            <td>10:00</td>
            <td>Ms. B</td>
            <td>Follow-up</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
