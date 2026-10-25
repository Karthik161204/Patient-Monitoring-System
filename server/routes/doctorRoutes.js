const express = require("express");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const Patient = require("../models/Patient");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/me", protect, allowRoles("doctor"), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id }).populate("user", "name email");
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/me/availability", protect, allowRoles("doctor"), async (req, res) => {
  try {
    if (typeof req.body.available !== "boolean") {
      return res.status(400).json({ message: "Availability must be true or false" });
    }

    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    doctor.available = req.body.available;
    await doctor.save();
    await doctor.populate("user", "name email");
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { specialty, search } = req.query;
    const filter = {};

    if (specialty) {
      filter.specialty = specialty;
    } else if (search) {
      const keywordMap = {
        skin: "Dermatology",
        hair: "Dermatology",
        heart: "Cardiology",
        chest: "Cardiology",
        brain: "Neurology",
        nerve: "Neurology",
        bone: "Orthopedics",
        joint: "Orthopedics",
        fracture: "Orthopedics",
        child: "Pediatrics",
        kid: "Pediatrics",
        ear: "ENT",
        nose: "ENT",
        throat: "ENT",
        tooth: "Dentistry",
        teeth: "Dentistry",
        dental: "Dentistry",
        pregnan: "Gynecology",
        women: "Gynecology",
        eye: "Ophthalmology",
        vision: "Ophthalmology",
        fever: "General Medicine",
        cold: "General Medicine",
      };

      const lower = search.toLowerCase();
      let matchedSpecialty = null;
      for (const key in keywordMap) {
        if (lower.includes(key)) {
          matchedSpecialty = keywordMap[key];
          break;
        }
      }

      // Also search by doctor user's name
      const matchingUsers = await User.find({
        name: new RegExp(search, "i"),
        role: "doctor",
      }).select("_id");
      const userIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { specialty: new RegExp(search, "i") },
        ...(userIds.length > 0 ? [{ user: { $in: userIds } }] : []),
        ...(matchedSpecialty ? [{ specialty: matchedSpecialty }] : []),
      ];
    }

    const doctors = await Doctor.find(filter).populate("user", "name email");
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/my-appointments", protect, allowRoles("doctor"), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    const { date } = req.query;
    const filter = { doctor: doctor._id };
    if (date) filter.appointmentDate = date;

    const appointments = await Appointment.find(filter)
      .populate({ path: "patient", populate: { path: "user", select: "name email" } })
      .sort({ appointmentDate: 1, tokenNumber: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/patients/:patientId", protect, allowRoles("doctor", "admin"), async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId).populate("user", "name email");
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const appointments = await Appointment.find({ patient: patient._id })
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .sort({ appointmentDate: -1 });

    res.json({ patient, appointments });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get(
  "/patients/:patientId/prescriptions",
  protect,
  allowRoles("doctor", "admin"),
  async (req, res) => {
    try {
      const prescriptions = await Prescription.find({ patient: req.params.patientId })
        .populate({ path: "doctor", populate: { path: "user", select: "name" } })
        .populate({ path: "appointment", select: "appointmentDate appointmentTime" })
        .sort({ createdAt: -1 });
      res.json(prescriptions);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("user", "name email");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
