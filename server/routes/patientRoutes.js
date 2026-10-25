const express = require("express");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/me", protect, allowRoles("patient"), async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id }).populate("user", "name email");
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/my-appointments", protect, allowRoles("patient"), async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });

    const appointments = await Appointment.find({ patient: patient._id })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .sort({ appointmentDate: -1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/prescriptions", protect, allowRoles("patient"), async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });

    const prescriptions = await Prescription.find({ patient: patient._id })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .populate({ path: "appointment", select: "appointmentDate appointmentTime" })
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
