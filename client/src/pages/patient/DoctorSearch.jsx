import { useEffect, useState } from "react";
import api from "../../api/axios";
import DoctorCard from "../../components/DoctorCard";

const specialties = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "ENT",
  "Dentistry",
  "Gynecology",
  "Ophthalmology",
];

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDoctors = async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/doctors", { params });
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSpecialty("");
    fetchDoctors(search ? { search } : {});
  };

  const handleSpecialtyClick = (specialty) => {
    if (activeSpecialty === specialty) {
      setActiveSpecialty("");
      setSearch("");
      fetchDoctors();
    } else {
      setActiveSpecialty(specialty);
      setSearch("");
      fetchDoctors({ specialty });
    }
  };

  return (
    <div>
      <h3>Find a Doctor</h3>
      <p className="muted">Search by your medical issue, or pick a specialty below.</p>
      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSearch} className="search-bar">
        <input
          placeholder="e.g. skin problem, fever, tooth pain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>

      <div className="specialty-chips">
        {specialties.map((s) => (
          <div
            key={s}
            className={"chip" + (activeSpecialty === s ? " active" : "")}
            onClick={() => handleSpecialtyClick(s)}
          >
            {s}
          </div>
        ))}
      </div>

      {loading ? (
        <p className="muted">Loading doctors...</p>
      ) : doctors.length === 0 ? (
        <p className="muted">No doctors found for this search.</p>
      ) : (
        <div className="card-grid">
          {doctors.map((doc) => (
            <DoctorCard key={doc._id} doctor={doc} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorSearch;
