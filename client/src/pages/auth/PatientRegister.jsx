import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const PatientRegister = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required");
      return;
    }

    try {
      const res = await api.post("/auth/patient/register", form);
      login(res.data.token, res.data.user);
      navigate("/patient/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ width: 380 }}>
        <h2>Patient Registration</h2>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
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
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button className="btn btn-primary btn-block" type="submit">
            Register
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 14, fontSize: 13 }}>
          Already have an account? <Link to="/patient/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default PatientRegister;
