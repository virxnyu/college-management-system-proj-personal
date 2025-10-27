const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  firebaseUid: { // --- ADDED ---
    type: String,
    required: true,
    unique: true, // Each Firebase user should only have one student profile
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // Keep this, useful for lookups, ensure consistency with Firebase
    lowercase: true
  },
  // --- PASSWORD REMOVED ---
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
