import { useEffect, useState } from "react";
import api from "../../api/axios";
import PrescriptionHistory from "../../components/PrescriptionHistory";

const PatientPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/patients/prescriptions")
      .then((res) => setPrescriptions(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h3>Prescription History</h3>
      {loading ? <p className="muted">Loading...</p> : <PrescriptionHistory prescriptions={prescriptions} />}
    </div>
  );
};

export default PatientPrescriptions;
