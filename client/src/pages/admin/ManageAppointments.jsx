import { useEffect, useState } from "react";
import api from "../../api/axios";

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/appointments")
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h3>Appointments</h3>
      {loading ? (
        <p className="muted">Loading...</p>
      ) : appointments.length === 0 ? (
        <p className="muted">No appointments found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Specialty</th>
              <th>Date</th>
              <th>Time</th>
              <th>Token</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id}>
                <td>{a.patient?.user?.name}</td>
                <td>{a.doctor?.user?.name}</td>
                <td>{a.doctor?.specialty}</td>
                <td>{a.appointmentDate}</td>
                <td>{a.appointmentTime}</td>
                <td>{String(a.tokenNumber).padStart(2, "0")}</td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageAppointments;
