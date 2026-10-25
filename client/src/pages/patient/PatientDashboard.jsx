import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

const sidebarItems = [
  { to: "/patient/dashboard", label: "Find Doctor", end: true },
  { to: "/patient/appointments", label: "My Appointments" },
  { to: "/patient/prescriptions", label: "Prescription History" },
];

const PatientLayout = () => {
  const { user } = useAuth();
  return (
    <div className="app-layout">
      <Sidebar items={sidebarItems} />
      <div className="main-content">
        <Navbar title={`Welcome, ${user?.name || "Patient"}`} />
        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PatientLayout;
