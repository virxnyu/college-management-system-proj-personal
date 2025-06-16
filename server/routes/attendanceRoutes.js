const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { markAttendance } = require("../controllers/attendanceController");

const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// ✅ Only teachers can mark attendance
router.post("/", verifyToken, requireRole("teacher"), markAttendance);

const Attendance = require("../models/attendance");

// This route allows students to view their attendance records.
router.get("/student", verifyToken, requireRole("student"), async (req, res) => {
  console.log("✅ Route Hit: /api/attendance/student");
  console.log("🎓 Student ID from token:", req.user.id);

  try {
    const records = await Attendance.find({ student: req.user.id });
    console.log("📄 Attendance Records Found:", records);
    res.json(records);
  } catch (error) {
    console.error("❌ Error fetching attendance records:", error);
    res.status(500).json({ error: "Server error" });
  }
});





module.exports = router;
// This route allows teachers to mark attendance for students.
// It uses the `markAttendance` controller function to handle the logic.