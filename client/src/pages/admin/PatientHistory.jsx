import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import PrescriptionHistory from "../../components/PrescriptionHistory";

// Grouped view: one patient, all their appointments and all their
// prescriptions in one place - not repeated per appointment.
const PatientHistory = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/admin/patients/${id}/history`).then((res) => setData(res.data));
  }, [id]);

  if (!data) return <p className="muted">Loading...</p>;

  const { patient, appointments, prescriptions } = data;

  return (
    <div>
      <h3>Patient History - {patient.user?.name}</h3>
      <p className="muted">{patient.user?.email}</p>

      <h4 className="section-title">Appointment History</h4>
      {appointments.length === 0 ? (
        <p className="muted">No appointments recorded.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Token</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a._id}>
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

      <h4 className="section-title">Prescription History</h4>
      <PrescriptionHistory prescriptions={prescriptions} />
    </div>
  );
};

export default PatientHistory;
