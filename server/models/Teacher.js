const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  firebaseUid: { // --- ADDED ---
    type: String,
    required: true,
    unique: true, // Each Firebase user should only have one teacher profile
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // Keep this
    lowercase: true
  },
  // --- PASSWORD REMOVED ---
});

module.exports = mongoose.model("Teacher", teacherSchema);
