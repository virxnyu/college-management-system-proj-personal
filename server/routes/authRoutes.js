const express = require("express");
const router = express.Router();
const {
  registerStudent,
  loginStudent,
  getOwnAttendance,
  getStudentAttendanceSummary,
  getStudentAttendanceTable,
  getStudentAttendanceByDateRange,
} = require("../controllers/authController");

const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// ✅ Basic dashboard greeting (can be used to verify token)
router.get("/dashboard", verifyToken, requireRole("student"), (req, res) => {
  res.json({ message: `Welcome Student ${req.user.email}` });
});

// ✅ Auth routes
router.post("/register", registerStudent);
router.post("/login", loginStudent);

// ✅ Attendance routes
router.get("/attendance", verifyToken, requireRole("student"), getOwnAttendance);
router.get("/attendance-summary", verifyToken, requireRole("student"), getStudentAttendanceSummary);
router.get("/attendance-table", verifyToken, requireRole("student"), getStudentAttendanceTable);
router.get("/attendance-range", verifyToken, requireRole("student"), getStudentAttendanceByDateRange);

// ✅ New: Marks route (dummy data for now)
router.get("/marks", verifyToken, requireRole("student"), (req, res) => {
  const dummyMarks = [
    { subject: "Math", score: 85 },
    { subject: "Physics", score: 78 },
    { subject: "Chemistry", score: 92 },
  ];
  res.json(dummyMarks);
});

module.exports = router;
