import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import DoctorAvailability from "../../components/DoctorAvailability";
import { useAuth } from "../../context/AuthContext";

const sidebarItems = [
  { to: "/doctor/dashboard", label: "Today's Appointments", end: true },
  { to: "/doctor/prescriptions", label: "Prescription History" },
];

const DoctorLayout = () => {
  const { user } = useAuth();
  return (
    <div className="app-layout">
      <Sidebar items={sidebarItems} />
      <div className="main-content">
        <Navbar title={`Welcome, ${user?.name || "Doctor"}`} />
        <div className="page-body">
          <DoctorAvailability />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DoctorLayout;
