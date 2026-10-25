// Tokens and active appointment slots are unique for each doctor and date.
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String },
    activeSlot: { type: String, select: false },
    tokenNumber: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Booked", "Waiting", "In Consultation", "Completed", "Cancelled"],
      default: "Booked",
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctor: 1, appointmentDate: 1, tokenNumber: 1 }, { unique: true });
appointmentSchema.index({ activeSlot: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
