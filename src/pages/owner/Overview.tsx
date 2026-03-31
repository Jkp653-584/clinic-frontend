export default function Overview(){

  /* ---------- MOCK DATA (เปลี่ยนเป็น API ทีหลัง) ---------- */

  const stats = {
    today: 48,
    appointments: 62,
    treating: 12,
    cancel: 5
  }

  const chartData = [20, 26, 12, 21, 27, 30, 33]

  const events = [
    {
      type:"ระบบล่ม",
      date:"11/11/1111 16:00",
      detail:"เน็ตหลุด"
    }
  ]

  return (
    <div className="owner-page">

      <h1>ภาพรวมการดำเนินงานคลินิก</h1>

      {/* STAT CARDS */}

      <div className="stats">

        <div className="card">
          <p>คนไข้วันนี้</p>
          <h2>{stats.today}</h2>
        </div>

        <div className="card orange">
          <p>นัดหมายวันนี้</p>
          <h2>{stats.appointments}</h2>
        </div>

        <div className="card blue">
          <p>กำลังรักษา</p>
          <h2>{stats.treating}</h2>
        </div>

        <div className="card red">
          <p>ยกเลิกนัด</p>
          <h2>{stats.cancel}</h2>
        </div>

      </div>

      {/* CHART MOCK */}

      <div className="chart-box">
        <p>จำนวนผู้ป่วยย้อนหลัง 7 วัน</p>

        <div className="chart">
          {chartData.map((v,i)=>(
            <div key={i} className="dot" style={{bottom:v*2}}/>
          ))}
        </div>
      </div>

      {/* EVENTS TABLE */}

      <div className="event-box">

        <p>เหตุการณ์จากพนักงาน (วันนี้)</p>

        <table>
          <thead>
            <tr>
              <th>ประเภทเหตุการณ์</th>
              <th>วัน/เดือน/ปี เวลา</th>
              <th>รายละเอียด</th>
            </tr>
          </thead>

          <tbody>

            {events.map((e,i)=>(
              <tr key={i}>
                <td>{e.type}</td>
                <td>{e.date}</td>
                <td>{e.detail}</td>
              </tr>
            ))}

          </tbody>
        </table>

      </div>

    </div>
  )
}