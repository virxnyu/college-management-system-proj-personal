const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "Late"],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true
  }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
// This model defines the structure for attendance records, linking students and teachers.
// It includes fields for the student ID, date of attendance, status (Present, Absent, Late),
// and the teacher who marked the attendance.