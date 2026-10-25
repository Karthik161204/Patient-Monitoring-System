import { useEffect, useState } from "react";
import api from "../../api/axios";

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

const emptyForm = { name: "", email: "", password: "", specialty: "", experience: "", phone: "" };

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const load = () => api.get("/admin/doctors").then((res) => setDoctors(res.data));

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.specialty) {
      setError("Name, email, password and specialty are required");
      return;
    }
    try {
      await api.post("/admin/doctors", form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add doctor");
    }
  };

  const toggleAvailability = async (doc) => {
    await api.put(`/admin/doctors/${doc._id}`, { available: !doc.available });
    load();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Doctors</h3>
        <button className="btn btn-primary btn-small" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Doctor"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 420, marginBottom: 20 }}>
          {error && <p className="error-text">{error}</p>}
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Specialty</label>
            <select name="specialty" value={form.specialty} onChange={handleChange}>
              <option value="">Select</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Experience (years)</label>
            <input type="number" name="experience" value={form.experience} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <button className="btn btn-primary" type="submit">
            Save Doctor
          </button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialty</th>
            <th>Experience</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((d) => (
            <tr key={d._id}>
              <td>{d.user?.name}</td>
              <td>{d.specialty}</td>
              <td>{d.experience} yrs</td>
              <td>{d.phone || "-"}</td>
              <td>
                <span className={d.available ? "status-available" : "status-unavailable"}>
                  {d.available ? "Available" : "Not Available"}
                </span>
              </td>
              <td>
                <button className="btn btn-small btn-outline" onClick={() => toggleAvailability(d)}>
                  Toggle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageDoctors;
