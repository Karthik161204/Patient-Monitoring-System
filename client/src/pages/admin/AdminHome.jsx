import { useEffect, useState } from "react";
import api from "../../api/axios";

const AdminHome = () => {
  const [summary, setSummary] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);

  useEffect(() => {
    api.get("/admin/summary").then((res) => setSummary(res.data));
    api.get("/admin/appointments").then((res) => setRecentAppointments(res.data.slice(0, 6)));
    api.get("/admin/prescriptions").then((res) => setRecentPrescriptions(res.data.slice(0, 6)));
  }, []);

  return (
    <div>
      <div className="summary-grid">
        <div className="summary-box">
          <div className="value">{summary?.totalPatients ?? "-"}</div>
          <div className="label">Total Patients</div>
        </div>
        <div className="summary-box">
          <div className="value">{summary?.totalDoctors ?? "-"}</div>
          <div className="label">Total Doctors</div>
        </div>
        <div className="summary-box">
          <div className="value">{summary?.todaysAppointments ?? "-"}</div>
          <div className="label">Today's Appointments</div>
        </div>
        <div className="summary-box">
          <div className="value">{summary?.completedAppointments ?? "-"}</div>
          <div className="label">Completed Appointments</div>
        </div>
      </div>

      <h3>Recent Appointments</h3>
      {recentAppointments.length === 0 ? (
        <p className="muted">No appointments yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Token</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentAppointments.map((a) => (
              <tr key={a._id}>
                <td>{a.patient?.user?.name}</td>
                <td>{a.doctor?.user?.name}</td>
                <td>{a.appointmentDate}</td>
                <td>{a.appointmentTime}</td>
                <td>{String(a.tokenNumber).padStart(2, "0")}</td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 className="section-title">Recent Prescription Updates</h3>
      {recentPrescriptions.length === 0 ? (
        <p className="muted">No prescriptions recorded yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Prescription</th>
            </tr>
          </thead>
          <tbody>
            {recentPrescriptions.map((p) => (
              <tr key={p._id}>
                <td>{p.patient?.user?.name}</td>
                <td>{p.doctor?.user?.name}</td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td>{p.prescriptionText}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminHome;
