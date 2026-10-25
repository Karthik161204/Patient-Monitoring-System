import { useEffect, useState } from "react";
import api from "../../api/axios";

const DoctorPrescription = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/doctors/my-appointments").then((res) => {
      // Build a unique list of patients this doctor has seen (no duplicates)
      const seen = new Map();
      res.data.forEach((a) => {
        if (a.patient && !seen.has(a.patient._id)) {
          seen.set(a.patient._id, a.patient);
        }
      });
      setPatients(Array.from(seen.values()));
    });
  }, []);

  const viewHistory = async (patient) => {
    setSelectedPatient(patient);
    const res = await api.get(`/doctors/patients/${patient._id}/prescriptions`);
    setHistory(res.data);
  };

  return (
    <div>
      <h3>Prescription History</h3>
      <p className="muted">Select a patient to view their full prescription history.</p>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ minWidth: 220 }}>
          {patients.map((p) => (
            <div
              key={p._id}
              className="card"
              style={{
                marginBottom: 10,
                cursor: "pointer",
                borderColor: selectedPatient?._id === p._id ? "#1560bd" : undefined,
              }}
              onClick={() => viewHistory(p)}
            >
              {p.user?.name}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 280 }}>
          {selectedPatient ? (
            history.length === 0 ? (
              <p className="muted">No prescriptions recorded yet.</p>
            ) : (
              history.map((h) => (
                <div className="prescription-item" key={h._id}>
                  <div className="prescription-header">
                    <span>
                      Appointment: {h.appointment?.appointmentDate || new Date(h.createdAt).toLocaleDateString()}
                      {h.appointment?.appointmentTime ? ` at ${h.appointment.appointmentTime}` : ""}
                    </span>
                  </div>
                  {h.diagnosis && (
                    <p>
                      <strong>Diagnosis:</strong> {h.diagnosis}
                    </p>
                  )}
                  <p>
                    <strong>Prescription:</strong> {h.prescriptionText}
                  </p>
                </div>
              ))
            )
          ) : (
            <p className="muted">No patient selected.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPrescription;
