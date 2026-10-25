import { Link } from "react-router-dom";

const DoctorCard = ({ doctor }) => {
  return (
    <div className="card doctor-card">
      <h3>{doctor.user?.name}</h3>
      <p className="specialty-tag">{doctor.specialty}</p>
      <p>Experience: {doctor.experience} years</p>
      <p>
        Status:{" "}
        <span className={doctor.available ? "status-available" : "status-unavailable"}>
          {doctor.available ? "Available" : "Not Available"}
        </span>
      </p>
      <div className="card-actions">
        <Link className="btn btn-outline" to={`/patient/doctors/${doctor._id}`}>
          View Doctor
        </Link>
        {doctor.available ? (
          <Link className="btn btn-primary" to={`/patient/book/${doctor._id}`}>
            Book Appointment
          </Link>
        ) : (
          <button className="btn btn-primary" type="button" disabled>
            Unavailable
          </button>
        )}
      </div>
    </div>
  );
};

export default DoctorCard;
