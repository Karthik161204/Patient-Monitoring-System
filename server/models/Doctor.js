// Extra profile info for a doctor, linked 1-1 with a User document
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialty: { type: String, required: true },
    experience: { type: Number, default: 0 },
    phone: { type: String, default: "" },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
