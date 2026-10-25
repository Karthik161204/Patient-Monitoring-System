// Run with: npm run seed
// Creates admin account, sample doctors across specialties, sample patient, appointment and prescription.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Doctor = require("./models/Doctor");
const Patient = require("./models/Patient");
const Appointment = require("./models/Appointment");
const Prescription = require("./models/Prescription");

const doctorsData = [
  { name: "Dr. Kumar", email: "kumar@hospital.com", specialty: "Dermatology", experience: 8, phone: "9000000001" },
  { name: "Dr. Priya", email: "priya@hospital.com", specialty: "Dermatology", experience: 5, phone: "9000000002" },
  { name: "Dr. Anand", email: "anand@hospital.com", specialty: "Cardiology", experience: 12, phone: "9000000003" },
  { name: "Dr. Meera", email: "meera@hospital.com", specialty: "Neurology", experience: 9, phone: "9000000004" },
  { name: "Dr. Suresh", email: "suresh@hospital.com", specialty: "Orthopedics", experience: 15, phone: "9000000005" },
  { name: "Dr. Divya", email: "divya@hospital.com", specialty: "Pediatrics", experience: 6, phone: "9000000006" },
  { name: "Dr. Ravi", email: "ravi@hospital.com", specialty: "ENT", experience: 10, phone: "9000000007" },
  { name: "Dr. Latha", email: "latha@hospital.com", specialty: "Dentistry", experience: 7, phone: "9000000008" },
  { name: "Dr. Vidya", email: "vidya@hospital.com", specialty: "Gynecology", experience: 11, phone: "9000000009" },
  { name: "Dr. Arjun", email: "arjun@hospital.com", specialty: "Ophthalmology", experience: 4, phone: "9000000010" },
  { name: "Dr. Sathish", email: "sathish@hospital.com", specialty: "General Medicine", experience: 14, phone: "9000000011" },
];

const pad = (n) => String(n).padStart(2, "0");
const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const run = async () => {
  await connectDB();
  const defaultPassword = await bcrypt.hash("password123", 10);

  // 1. Admin
  let admin = await User.findOne({ email: "admin@hospital.com" });
  if (!admin) {
    admin = await User.create({
      name: "Hospital Admin",
      email: "admin@hospital.com",
      password: defaultPassword,
      role: "admin",
    });
    console.log("Created admin: admin@hospital.com / password123");
  } else {
    console.log("Admin already exists, skipping");
  }

  // 2. Doctors
  const doctorDocs = [];
  for (const d of doctorsData) {
    let user = await User.findOne({ email: d.email });
    let doctor;
    if (!user) {
      user = await User.create({
        name: d.name,
        email: d.email,
        password: defaultPassword,
        role: "doctor",
      });
      doctor = await Doctor.create({
        user: user._id,
        specialty: d.specialty,
        experience: d.experience,
        phone: d.phone,
        available: true,
      });
      console.log(`Created doctor: ${d.email} / password123 (${d.specialty})`);
    } else {
      doctor = await Doctor.findOne({ user: user._id });
    }
    if (doctor) doctorDocs.push(doctor);
  }

  // 3. Sample Patient
  let patientUser = await User.findOne({ email: "patient@hospital.com" });
  let patientDoc;
  if (!patientUser) {
    patientUser = await User.create({
      name: "Ramesh Sharma",
      email: "patient@hospital.com",
      password: defaultPassword,
      role: "patient",
    });
    patientDoc = await Patient.create({
      user: patientUser._id,
      phone: "9876543210",
      age: 34,
      gender: "Male",
    });
    console.log("Created sample patient: patient@hospital.com / password123");
  } else {
    patientDoc = await Patient.findOne({ user: patientUser._id });
  }

  // 4. Sample Appointment & Prescription (if doctors exist)
  if (doctorDocs.length > 0 && patientDoc) {
    const todayStr = getTodayStr();
    const sampleAppointmentTime = "09:00 AM";
    const existingAppt = await Appointment.findOne({
      patient: patientDoc._id,
      doctor: doctorDocs[0]._id,
      appointmentDate: todayStr,
      appointmentTime: sampleAppointmentTime,
    });

    if (!existingAppt) {
      const appt = await Appointment.create({
        patient: patientDoc._id,
        doctor: doctorDocs[0]._id,
        appointmentDate: todayStr,
        appointmentTime: sampleAppointmentTime,
        activeSlot: `${doctorDocs[0]._id}:${todayStr}:${sampleAppointmentTime}`,
        tokenNumber: 1,
        status: "Completed",
      });

      await Prescription.create({
        patient: patientDoc._id,
        doctor: doctorDocs[0]._id,
        appointment: appt._id,
        diagnosis: "Eczema flare-up",
        prescriptionText: "Hydrocortisone cream 1% - apply twice daily for 7 days. Cetirizine 10mg once at bedtime.",
        notes: "Advised to avoid hot showers and keep skin moisturized. Review in 10 days if symptoms persist.",
      });

      console.log("Created sample appointment and prescription for today.");
    }
  }

  console.log("\nSeeding complete!");
  console.log("------------------------------------------");
  console.log("Admin Login:   admin@hospital.com   / password123");
  console.log("Doctor Login:  kumar@hospital.com   / password123");
  console.log("Patient Login: patient@hospital.com / password123");
  console.log("------------------------------------------");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
