import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const sidebarItems = [
  { to: "/admin/dashboard", label: "Dashboard", end: true },
  { to: "/admin/patients", label: "Patients" },
  { to: "/admin/doctors", label: "Doctors" },
  { to: "/admin/appointments", label: "Appointments" },
  { to: "/admin/prescriptions", label: "Prescriptions" },
];

const AdminLayout = () => {
  return (
    <div className="app-layout">
      <Sidebar items={sidebarItems} />
      <div className="main-content">
        <Navbar title="Hospital Management Dashboard" />
        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
