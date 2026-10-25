import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import PrescriptionHistory from "../../components/PrescriptionHistory";

const PatientDetails = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [history, setHistory] = useState([]);
  const [diagnosis, setDiagnosis] = useState("");
  const [prescriptionText, setPrescriptionText] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    const res = await api.get(`/appointments/${appointmentId}`);
    setAppointment(res.data);

    const presRes = await api.get(`/doctors/patients/${res.data.patient._id}/prescriptions`);
    setHistory(presRes.data);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const startConsultation = async () => {
    setError("");
    try {
      const res = await api.put(`/appointments/${appointmentId}/status`, { status: "In Consultation" });
      setAppointment((current) => ({ ...current, status: res.data.status }));
    } catch (err) {
      setError(err.response?.data?.message || "Could not start this consultation");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!prescriptionText.trim()) {
      setError("Prescription cannot be empty");
      return;
    }

    try {
      const res = await api.post("/prescriptions", {
        appointmentId,
        patientId: appointment.patient._id,
        diagnosis,
        prescriptionText,
        notes,
      });
      setHistory((current) => [res.data, ...current]);
      setAppointment((current) => ({ ...current, status: "Completed" }));
      setSuccess("Appointment marked attended and prescription saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save prescription");
    }
  };

  if (!appointment) return <p className="muted">Loading...</p>;

  return (
    <div>
      <h3>Attend Patient</h3>

      <div className="card" style={{ maxWidth: 480, marginBottom: 20 }}>
        <p>
          <strong>Patient:</strong> {appointment.patient?.user?.name}
        </p>
        <p>
          <strong>Email:</strong> {appointment.patient?.user?.email}
        </p>
        <p>
          <strong>Appointment Date:</strong> {appointment.appointmentDate}
        </p>
        <p>
          <strong>Appointment Time:</strong> {appointment.appointmentTime}
        </p>
        <p>
          <strong>Token:</strong> {String(appointment.tokenNumber).padStart(2, "0")}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          {appointment.status === "In Consultation"
            ? "Attending"
            : appointment.status === "Completed"
              ? "Attended"
              : appointment.status}
        </p>
      </div>

      <h4>Previous Prescription History</h4>
      <PrescriptionHistory prescriptions={history} />

      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}
      {appointment.status === "Booked" || appointment.status === "Waiting" ? (
        <button className="btn btn-primary" type="button" onClick={startConsultation}>
          Start attending
        </button>
      ) : appointment.status === "In Consultation" ? (
        <>
          <h4 className="section-title">Consultation</h4>
          <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
            <div className="form-group">
              <label>Diagnosis</label>
              <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Prescription</label>
              <textarea
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                placeholder="e.g. Paracetamol 500mg - 3 days"
              />
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit">
              Save prescription and mark attended
            </button>
          </form>
        </>
      ) : appointment.status === "Completed" ? (
        <button className="btn btn-outline" type="button" onClick={() => navigate("/doctor/dashboard")}>
          Back to appointments
        </button>
      ) : (
        <p className="muted">This appointment is {appointment.status.toLowerCase()}.</p>
      )}
    </div>
  );
};

export default PatientDetails;
