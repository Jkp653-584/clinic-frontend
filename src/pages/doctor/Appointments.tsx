export default function Appointments() {
  return (
    <div>
      <h1>Doctor Appointments</h1>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Patient</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2026-01-22</td>
            <td>09:00</td>
            <td>Mr. A</td>
            <td>Confirmed</td>
          </tr>
          <tr>
            <td>2026-01-22</td>
            <td>10:00</td>
            <td>Ms. B</td>
            <td>Waiting</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
