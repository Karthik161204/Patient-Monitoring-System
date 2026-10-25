const PrescriptionHistory = ({ prescriptions }) => {
  if (!prescriptions || prescriptions.length === 0) {
    return <p className="muted">No prescription history available.</p>;
  }

  return (
    <div className="prescription-list">
      {prescriptions.map((p) => (
        <div className="prescription-item" key={p._id}>
          <div className="prescription-header">
            <span>
              Appointment: {p.appointment?.appointmentDate || new Date(p.createdAt).toLocaleDateString()}
              {p.appointment?.appointmentTime ? ` at ${p.appointment.appointmentTime}` : ""}
            </span>
            <span>{p.doctor?.user?.name}</span>
          </div>
          {p.diagnosis && (
            <p>
              <strong>Diagnosis:</strong> {p.diagnosis}
            </p>
          )}
          <p>
            <strong>Prescription:</strong> {p.prescriptionText}
          </p>
          {p.notes && (
            <p>
              <strong>Notes:</strong> {p.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PrescriptionHistory;
