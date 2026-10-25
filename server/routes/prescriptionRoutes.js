const express = require("express");
const Prescription = require("../models/Prescription");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

// Doctor creates a NEW prescription record for a consultation.
// Old prescriptions for the same patient are never touched or overwritten.
router.post("/", protect, allowRoles("doctor"), async (req, res) => {
  try {
    const { appointmentId, patientId, diagnosis, prescriptionText, notes } = req.body;

    if (!prescriptionText || !prescriptionText.trim()) {
      return res.status(400).json({ message: "Prescription text cannot be empty" });
    }
    if (!appointmentId || !patientId) {
      return res.status(400).json({ message: "Appointment and patient are required" });
    }

    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (String(appointment.doctor) !== String(doctor._id)) {
      return res.status(403).json({ message: "This appointment belongs to another doctor" });
    }
    if (String(appointment.patient) !== String(patientId)) {
      return res.status(400).json({ message: "Patient does not match this appointment" });
    }
    if (appointment.status !== "In Consultation") {
      return res.status(400).json({ message: "Start the consultation before saving a prescription" });
    }

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: doctor._id,
      appointment: appointmentId,
      diagnosis: diagnosis || "",
      prescriptionText,
      notes: notes || "",
    });

    appointment.status = "Completed";
    await appointment.save();

    await prescription.populate({ path: "appointment", select: "appointmentDate appointmentTime" });
    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
