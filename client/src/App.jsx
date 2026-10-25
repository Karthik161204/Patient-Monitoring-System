import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import InstallApp from "./components/InstallApp";

import PatientLogin from "./pages/auth/PatientLogin";
import PatientRegister from "./pages/auth/PatientRegister";
import DoctorLogin from "./pages/auth/DoctorLogin";
import AdminLogin from "./pages/auth/AdminLogin";

import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorSearch from "./pages/patient/DoctorSearch";
import DoctorDetails from "./pages/patient/DoctorDetails";
import BookAppointment from "./pages/patient/BookAppointment";
import MyAppointments from "./pages/patient/MyAppointments";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import PatientDetails from "./pages/doctor/PatientDetails";
import DoctorPrescription from "./pages/doctor/DoctorPrescription";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHome from "./pages/admin/AdminHome";
import ManagePatients from "./pages/admin/ManagePatients";
import PatientHistory from "./pages/admin/PatientHistory";
import ManageDoctors from "./pages/admin/ManageDoctors";
import ManageAppointments from "./pages/admin/ManageAppointments";
import ManagePrescriptions from "./pages/admin/ManagePrescriptions";

function App() {
  return (
    <>
      <InstallApp />
      <Routes>
        <Route path="/" element={<Navigate to="/patient/login" replace />} />

        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/register" element={<PatientRegister />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/patient"
          element={
            <ProtectedRoute role="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DoctorSearch />} />
          <Route path="doctors/:id" element={<DoctorDetails />} />
          <Route path="book/:id" element={<BookAppointment />} />
          <Route path="appointments" element={<MyAppointments />} />
          <Route path="prescriptions" element={<PatientPrescriptions />} />
        </Route>

        <Route
          path="/doctor"
          element={
            <ProtectedRoute role="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DoctorAppointments />} />
          <Route path="attend/:appointmentId" element={<PatientDetails />} />
          <Route path="prescriptions" element={<DoctorPrescription />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminHome />} />
          <Route path="patients" element={<ManagePatients />} />
          <Route path="patients/:id/history" element={<PatientHistory />} />
          <Route path="doctors" element={<ManageDoctors />} />
          <Route path="appointments" element={<ManageAppointments />} />
          <Route path="prescriptions" element={<ManagePrescriptions />} />
        </Route>

        <Route path="*" element={<Navigate to="/patient/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
