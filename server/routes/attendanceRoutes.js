const express = require("express");
const router = express.Router();

const { markAttendance } = require("../controllers/attendanceController");

const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// ✅ Only teachers can mark attendance
router.post("/", verifyToken, requireRole("teacher"), markAttendance);

module.exports = router;
// This route allows teachers to mark attendance for students.
// It uses the `markAttendance` controller function to handle the logic.