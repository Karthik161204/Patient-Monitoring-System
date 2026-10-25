// Extra profile info for a patient, linked 1-1 with a User document
const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    phone: { type: String, default: "" },
    age: { type: Number, default: null },
    gender: { type: String, enum: ["Male", "Female", "Other", ""], default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
