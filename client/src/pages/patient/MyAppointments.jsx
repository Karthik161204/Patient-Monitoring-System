import { useEffect, useState } from "react";
import api from "../../api/axios";
import AppointmentCard from "../../components/AppointmentCard";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/patients/my-appointments")
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h3>My Appointments</h3>
      {loading ? (
        <p className="muted">Loading...</p>
      ) : appointments.length === 0 ? (
        <p className="muted">You have no appointments yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
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
              <AppointmentCard key={a._id} appointment={a} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyAppointments;
