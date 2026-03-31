export default function Appointments() {
  return (
    <div>
      <h1>My Appointments</h1>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Doctor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2026-01-25</td>
            <td>14:00</td>
            <td>Dr. Smith</td>
            <td>Confirmed</td>
          </tr>
          <tr>
            <td>2026-02-01</td>
            <td>10:30</td>
            <td>Dr. Jane</td>
            <td>Waiting</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
