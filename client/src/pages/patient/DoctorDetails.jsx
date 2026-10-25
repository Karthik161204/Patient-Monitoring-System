import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

const DoctorDetails = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    api.get(`/doctors/${id}`).then((res) => setDoctor(res.data));
  }, [id]);

  if (!doctor) return <p className="muted">Loading...</p>;

  return (
    <div>
      <h3>{doctor.user?.name}</h3>
      <div className="card" style={{ maxWidth: 420 }}>
        <p>
          <strong>Specialty:</strong> {doctor.specialty}
        </p>
        <p>
          <strong>Experience:</strong> {doctor.experience} years
        </p>
        <p>
          <strong>Phone:</strong> {doctor.phone || "Not provided"}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={doctor.available ? "status-available" : "status-unavailable"}>
            {doctor.available ? "Available" : "Not Available"}
          </span>
        </p>
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

export default DoctorDetails;
