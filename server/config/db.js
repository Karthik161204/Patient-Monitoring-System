const mongoose = require("mongoose");

const connectDB = async () => {
  const primaryUri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hospital_appointment_system";
  const localFallbackUri = "mongodb://127.0.0.1:27017/hospital_appointment_system";

  try {
    // Attempt primary connection with 8s timeout
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(
      `MongoDB connected successfully: [${mongoose.connection.host}] database: [${mongoose.connection.name}]`
    );
  } catch (err) {
    console.warn(`Primary MongoDB connection error: ${err.message}`);

    // If primary was not already the local fallback, attempt fallback
    if (primaryUri !== localFallbackUri) {
      try {
        console.log("Attempting fallback connection to local MongoDB...");
        await mongoose.connect(localFallbackUri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(
          `Fallback connected to local MongoDB: [${mongoose.connection.host}] database: [${mongoose.connection.name}]`
        );
        return;
      } catch (fallbackErr) {
        console.error("Local MongoDB fallback also failed:", fallbackErr.message);
      }
    }

    console.error("Critical: Could not establish MongoDB connection.");
    process.exit(1);
  }
};

module.exports = connectDB;
