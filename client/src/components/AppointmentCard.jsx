const statusClass = {
  Booked: "badge badge-blue",
  Waiting: "badge badge-orange",
  "In Consultation": "badge badge-purple",
  Completed: "badge badge-green",
  Cancelled: "badge badge-red",
};

const AppointmentCard = ({ appointment, showPatient }) => {
  return (
    <tr>
      {showPatient && <td>{appointment.patient?.user?.name}</td>}
      <td>{appointment.doctor?.user?.name}</td>
      <td>{appointment.doctor?.specialty}</td>
      <td>{appointment.appointmentDate}</td>
      <td>{appointment.appointmentTime}</td>
      <td>{String(appointment.tokenNumber).padStart(2, "0")}</td>
      <td>
        <span className={statusClass[appointment.status] || "badge"}>{appointment.status}</span>
      </td>
    </tr>
  );
};

export default AppointmentCard;
