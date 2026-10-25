const express = require("express");
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();
const appointmentTimes = Array.from({ length: 16 }, (_, index) => {
  const totalMinutes = 9 * 60 + index * 30;
  const hour24 = Math.floor(totalMinutes / 60);
  const hour = hour24 % 12 || 12;
  const minutes = totalMinutes % 60;
  const suffix = hour24 < 12 ? "AM" : "PM";
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
});

// Booking is only allowed within the current calendar month
const isWithinBookingWindow = (dateStr) => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const currentYearMonth = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

  // Must be in the current calendar month and not in the past
  return dateStr.startsWith(currentYearMonth) && dateStr >= todayStr;
};

router.get("/availability/:doctorId", protect, allowRoles("patient"), async (req, res) => {
  try {
    const { date } = req.query;
    if (!isWithinBookingWindow(date)) {
      return res.status(400).json({ message: "Choose a valid date in the current month" });
    }

    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (!doctor.available) return res.json({ availableSlots: [] });

    const bookedTimes = await Appointment.distinct("appointmentTime", {
      doctor: doctor._id,
      appointmentDate: date,
      status: { $ne: "Cancelled" },
    });
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const availableSlots = appointmentTimes.filter((time) => {
      if (bookedTimes.includes(time)) return false;
      if (date !== today) return true;

      const [clock, suffix] = time.split(" ");
      let [hour, minutes] = clock.split(":").map(Number);
      if (suffix === "PM" && hour !== 12) hour += 12;
      if (suffix === "AM" && hour === 12) hour = 0;
      return hour * 60 + minutes > currentMinutes;
    });

    res.json({ availableSlots });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/", protect, allowRoles("patient"), async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: "Doctor, appointment date, and time are required" });
    }

    if (!isWithinBookingWindow(appointmentDate)) {
      return res.status(400).json({
        message: "Appointments can only be booked within the current month",
      });
    }

    if (!appointmentTimes.includes(appointmentTime)) {
      return res.status(400).json({ message: "Choose a valid appointment time" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    if (!doctor.available) {
      return res.status(409).json({ message: "This doctor is currently unavailable for appointments" });
    }

    const patient = await Patient.findOne({ user: req.user.id });
    if (!patient) return res.status(404).json({ message: "Patient profile not found" });

    const activeSlot = `${doctor._id}:${appointmentDate}:${appointmentTime}`;
    let appointment;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const latestAppointment = await Appointment.findOne({
        doctor: doctor._id,
        appointmentDate,
      })
        .sort({ tokenNumber: -1 })
        .select("tokenNumber");

      try {
        appointment = await Appointment.create({
          patient: patient._id,
          doctor: doctor._id,
          appointmentDate,
          appointmentTime,
          activeSlot,
          tokenNumber: (latestAppointment?.tokenNumber || 0) + 1,
          status: "Booked",
        });
        break;
      } catch (err) {
        if (err.code !== 11000) throw err;

        const slotIsTaken = await Appointment.exists({ activeSlot });
        if (slotIsTaken) {
          return res.status(409).json({ message: "That time slot was just booked. Choose another time." });
        }
        if (attempt === 4) {
          return res.status(409).json({ message: "Could not reserve this appointment. Please try again." });
        }
      }
    }

    const populated = await appointment.populate([
      { path: "doctor", populate: { path: "user", select: "name" } },
      { path: "patient", populate: { path: "user", select: "name" } },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: "doctor", populate: { path: "user", select: "name" } })
      .populate({ path: "patient", populate: { path: "user", select: "name email" } });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor || String(appointment.doctor._id) !== String(doctor._id)) {
        return res.status(403).json({ message: "Not authorized to view this appointment" });
      }
    } else if (req.user.role === "patient") {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient || String(appointment.patient._id) !== String(patient._id)) {
        return res.status(403).json({ message: "Not authorized to view this appointment" });
      }
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/:id/status", protect, allowRoles("doctor", "admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Booked", "Waiting", "In Consultation", "Completed", "Cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor || String(appointment.doctor) !== String(doctor._id)) {
        return res.status(403).json({ message: "Not authorized to update this appointment" });
      }

      if (status === "Completed") {
        return res.status(400).json({ message: "Save the prescription to complete this appointment" });
      }

      if (status === "In Consultation") {
        if (!["Booked", "Waiting"].includes(appointment.status)) {
          return res.status(400).json({ message: "This appointment cannot be started from its current status" });
        }

        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        if (appointment.appointmentDate !== today) {
          return res.status(400).json({ message: "An appointment can only be started on its scheduled date" });
        }

        if (appointment.appointmentTime) {
          const [clock, suffix] = appointment.appointmentTime.split(" ");
          let [hour, minutes] = clock.split(":").map(Number);
          if (suffix === "PM" && hour !== 12) hour += 12;
          if (suffix === "AM" && hour === 12) hour = 0;
          if (hour * 60 + minutes > now.getHours() * 60 + now.getMinutes()) {
            return res.status(400).json({ message: "This appointment slot has not started yet" });
          }
        }
      }
    }

    if (status === "Cancelled") {
      appointment.set("activeSlot", undefined);
    } else if (appointment.status === "Cancelled" && appointment.appointmentTime) {
      const activeSlot = `${appointment.doctor}:${appointment.appointmentDate}:${appointment.appointmentTime}`;
      const slotIsTaken = await Appointment.exists({ activeSlot, _id: { $ne: appointment._id } });
      if (slotIsTaken) {
        return res.status(409).json({ message: "That time slot has already been booked" });
      }
      appointment.set("activeSlot", activeSlot);
    }

    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "That time slot has already been booked" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
