const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();
router.use(protect, allowRoles("admin"));

router.get("/summary", async (req, res) => {
  try {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const [totalPatients, totalDoctors, todaysAppointments, completedAppointments] =
      await Promise.all([
        Patient.countDocuments(),
        Doctor.countDocuments(),
        Appointment.countDocuments({ appointmentDate: todayStr }),
        Appointment.countDocuments({ status: "Completed" }),
      ]);

    res.json({ totalPatients, totalDoctors, todaysAppointments, completedAppointments });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/patients", async (req, res) => {
  try {
    const patients = await Patient.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/patients/:id/history", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate("user", "name email");
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const [appointments, prescriptions] = await Promise.all([
      Appointment.find({ patient: patient._id })
        .populate({ path: "doctor", populate: { path: "user", select: "name" } })
        .sort({ appointmentDate: -1 }),
      Prescription.find({ patient: patient._id })
        .populate({ path: "doctor", populate: { path: "user", select: "name" } })
        .populate({ path: "appointment", select: "appointmentDate appointmentTime" })
        .sort({ createdAt: -1 }),
    ]);

    res.json({ patient, appointments, prescriptions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/doctors/unavailable", async (req, res) => {
  try {
    const doctors = await Doctor.find({ available: false })
      .populate("user", "name")
      .sort({ updatedAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/doctors", async (req, res) => {
  try {
    const { name, email, password, specialty, experience, phone } = req.body;
    if (!name || !email || !password || !specialty) {
      return res.status(400).json({ message: "Name, email, password and specialty are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "doctor",
    });

    const doctor = await Doctor.create({
      user: user._id,
      specialty,
      experience: experience || 0,
      phone: phone || "",
      available: true,
    });

    const populated = await doctor.populate("user", "name email");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/doctors/:id", async (req, res) => {
  try {
    const { specialty, experience, phone, available } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (specialty !== undefined) doctor.specialty = specialty;
    if (experience !== undefined) doctor.experience = experience;
    if (phone !== undefined) doctor.phone = phone;
    if (available !== undefined) doctor.available = available;

    await doctor.save();
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({ path: "patient", populate: { path: "user", select: "name" } })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .sort({ appointmentDate: -1, tokenNumber: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/prescriptions", async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate({ path: "patient", populate: { path: "user", select: "name" } })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .populate({ path: "appointment", select: "appointmentDate appointmentTime" })
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Always creates a new record - previous prescriptions are never touched.
router.post("/prescriptions", async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, diagnosis, prescriptionText, notes } = req.body;

    if (!prescriptionText || !prescriptionText.trim()) {
      return res.status(400).json({ message: "Prescription text cannot be empty" });
    }
    if (!patientId || !doctorId || !appointmentId) {
      return res.status(400).json({ message: "Patient, doctor and appointment are required" });
    }

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: doctorId,
      appointment: appointmentId,
      diagnosis: diagnosis || "",
      prescriptionText,
      notes: notes || "",
    });

    await Appointment.findByIdAndUpdate(appointmentId, { status: "Completed" });

    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Admin may only add clarifying notes - prescriptionText/diagnosis stay as
// the doctor entered them, per the "never overwrite history" rule.
router.put("/prescriptions/:id", async (req, res) => {
  try {
    const { notes } = req.body;
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    if (notes !== undefined) prescription.notes = notes;
    await prescription.save();

    res.json(prescription);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
