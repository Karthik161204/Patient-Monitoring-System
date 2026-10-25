import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const DoctorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      const res = await api.post("/auth/doctor/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/doctor/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Doctor Login</h2>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-block" type="submit">
            Login
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 14, fontSize: 12 }}>
          Doctor accounts are created by the hospital admin.
        </p>
        <p style={{ textAlign: "center", marginTop: 10, fontSize: 12 }}>
          <Link to="/patient/login">Patient Login</Link> &nbsp;|&nbsp; <Link to="/admin/login">Admin Login</Link>
        </p>
      </div>
    </div>
  );
};

export default DoctorLogin;
