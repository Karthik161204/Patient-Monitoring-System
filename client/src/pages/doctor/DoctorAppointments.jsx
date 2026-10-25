import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const todayISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const statusClass = {
  Booked: "badge badge-blue",
  Waiting: "badge badge-orange",
  "In Consultation": "badge badge-purple",
  Completed: "badge badge-green",
  Cancelled: "badge badge-red",
};
const statusLabel = {
  "In Consultation": "Attending",
  Completed: "Attended",
};

const DoctorAppointments = () => {
  const [todaysList, setTodaysList] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [todayRes, allRes] = await Promise.all([
        api.get("/doctors/my-appointments", { params: { date: todayISO() } }),
        api.get("/doctors/my-appointments"),
      ]);
      setTodaysList(todayRes.data);
      setUpcoming(allRes.data.filter((a) => a.appointmentDate > todayISO()));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h3>Today's Appointments</h3>
      {loading ? (
        <p className="muted">Loading...</p>
      ) : todaysList.length === 0 ? (
        <p className="muted">No appointments scheduled for today.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {todaysList.map((a) => (
              <tr key={a._id}>
                <td>{String(a.tokenNumber).padStart(2, "0")}</td>
                <td>{a.patient?.user?.name}</td>
                <td>{a.appointmentDate}</td>
                <td>{a.appointmentTime}</td>
                <td>
                  <span className={statusClass[a.status] || "badge"}>{statusLabel[a.status] || a.status}</span>
                </td>
                <td>
                  {a.status === "Completed" || a.status === "Cancelled" ? (
                    <span className="muted">-</span>
                  ) : (
                    <Link className="btn btn-small btn-primary" to={`/doctor/attend/${a._id}`}>
                      Attend
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 className="section-title">Upcoming Appointments</h3>
      {upcoming.length === 0 ? (
        <p className="muted">No upcoming appointments this month.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((a) => (
              <tr key={a._id}>
                <td>{String(a.tokenNumber).padStart(2, "0")}</td>
                <td>{a.patient?.user?.name}</td>
                <td>{a.appointmentDate}</td>
                <td>{a.appointmentTime}</td>
                <td>
                  <span className={statusClass[a.status] || "badge"}>{statusLabel[a.status] || a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DoctorAppointments;
