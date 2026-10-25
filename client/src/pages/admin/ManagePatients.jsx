import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

// Patients are listed ONCE each here (one row per patient, not per appointment).
const ManagePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/patients")
      .then((res) => setPatients(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h3>Patients</h3>
      {loading ? (
        <p className="muted">Loading...</p>
      ) : patients.length === 0 ? (
        <p className="muted">No patients registered yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p._id}>
                <td>{p.user?.name}</td>
                <td>{p.user?.email}</td>
                <td>{p.phone || "-"}</td>
                <td>{p.age || "-"}</td>
                <td>{p.gender || "-"}</td>
                <td>
                  <Link className="btn btn-small btn-outline" to={`/admin/patients/${p._id}/history`}>
                    View History
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManagePatients;
