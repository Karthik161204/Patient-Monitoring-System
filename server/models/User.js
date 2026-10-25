// Base user account used for authentication (patients, doctors, admins)
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["patient", "doctor", "admin"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
