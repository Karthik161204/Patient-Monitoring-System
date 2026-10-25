import { useEffect, useState } from "react";
import api from "../../api/axios";

const emptyForm = {
  patientId: "",
  doctorId: "",
  appointmentId: "",
  diagnosis: "",
  prescriptionText: "",
  notes: "",
};

const groupPrescriptionsByPatient = (prescriptions) => {
  const patientGroups = new Map();

  prescriptions.forEach((prescription) => {
    const patientId = prescription.patient?._id || prescription._id;
    if (!patientGroups.has(patientId)) {
      patientGroups.set(patientId, {
        patient: prescription.patient,
        prescriptions: [],
      });
    }
    patientGroups.get(patientId).prescriptions.push(prescription);
  });

  return Array.from(patientGroups.values());
};

// Admin can record a prescription for a completed appointment (e.g. from a
// paper chart). This always ADDS a new record - it never edits or removes
// an existing prescription, per the "complete medical history" requirement.
const ManagePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    api.get("/admin/prescriptions").then((res) => setPrescriptions(res.data));
    api.get("/admin/appointments").then((res) => setAppointments(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const patientLogs = groupPrescriptionsByPatient(prescriptions);

  const handleAppointmentSelect = (appointmentId) => {
    const appt = appointments.find((a) => a._id === appointmentId);
    if (!appt) {
      setForm({ ...form, appointmentId: "", patientId: "", doctorId: "" });
      return;
    }
    setForm({
      ...form,
      appointmentId,
      patientId: appt.patient?._id || "",
      doctorId: appt.doctor?._id || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.appointmentId || !form.prescriptionText.trim()) {
      setError("Appointment and prescription text are required");
      return;
    }
    try {
      await api.post("/admin/prescriptions", form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save prescription");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Prescriptions</h3>
        <button className="btn btn-primary btn-small" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Record Prescription"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 460, marginBottom: 20 }}>
          {error && <p className="error-text">{error}</p>}
          <div className="form-group">
            <label>Appointment</label>
            <select value={form.appointmentId} onChange={(e) => handleAppointmentSelect(e.target.value)}>
              <option value="">Select an appointment</option>
              {appointments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.patient?.user?.name} - {a.doctor?.user?.name} - {a.appointmentDate} {a.appointmentTime}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Diagnosis</label>
            <input value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Prescription</label>
            <textarea
              value={form.prescriptionText}
              onChange={(e) => setForm({ ...form, prescriptionText: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit">
            Save
          </button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Prescription History</th>
          </tr>
        </thead>
        <tbody>
          {patientLogs.map((patientLog) => (
            <tr key={patientLog.patient?._id || patientLog.prescriptions[0]._id}>
              <td>{patientLog.patient?.user?.name || "Unknown patient"}</td>
              <td>
                <details className="prescription-log">
                  <summary>{patientLog.prescriptions.length} prescription(s) · View patient log</summary>
                  <div className="prescription-log-entries">
                    {patientLog.prescriptions.map((prescription) => {
                      const appointmentDate = prescription.appointment?.appointmentDate;
                      const dateLabel = appointmentDate
                        ? new Date(`${appointmentDate}T00:00:00`).toLocaleDateString()
                        : new Date(prescription.createdAt).toLocaleDateString();

                      return (
                        <article className="prescription-log-entry" key={prescription._id}>
                          <div className="prescription-header">
                            <span>
                              Appointment: {dateLabel}
                              {prescription.appointment?.appointmentTime
                                ? ` at ${prescription.appointment.appointmentTime}`
                                : ""}
                            </span>
                            <span>{prescription.doctor?.user?.name}</span>
                          </div>
                          <p><strong>Diagnosis:</strong> {prescription.diagnosis || "-"}</p>
                          <p><strong>Prescription:</strong> {prescription.prescriptionText}</p>
                          {prescription.notes && <p><strong>Notes:</strong> {prescription.notes}</p>}
                        </article>
                      );
                    })}
                  </div>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagePrescriptions;
