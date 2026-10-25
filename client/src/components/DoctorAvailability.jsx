import { useEffect, useState } from "react";
import api from "../api/axios";

const DoctorAvailability = () => {
  const [available, setAvailable] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api.get("/doctors/me")
      .then((res) => {
        if (active) setAvailable(res.data.available);
      })
      .catch((err) => {
        if (active) {
          setError(err.response?.data?.message || err.message || "Could not load your availability");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const toggleAvailability = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await api.put("/doctors/me/availability", { available: !available });
      setAvailable(res.data.available);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not update your availability");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="card doctor-availability" aria-label="Doctor appointment availability">
      <div>
        <h3>Appointment availability</h3>
        <p>
          Your status:{" "}
          <strong className={available ? "status-available" : "status-unavailable"}>
            {available === null ? "Loading..." : available ? "Available" : "Unavailable"}
          </strong>
        </p>
        {error && <p className="error-text" role="alert">{error}</p>}
      </div>
      <button
        className={`btn ${available ? "btn-outline" : "btn-primary"}`}
        type="button"
        onClick={toggleAvailability}
        disabled={available === null || saving}
      >
        {saving ? "Updating..." : available === null ? "Loading..." : available ? "Set unavailable" : "Set available"}
      </button>
    </section>
  );
};

export default DoctorAvailability;
