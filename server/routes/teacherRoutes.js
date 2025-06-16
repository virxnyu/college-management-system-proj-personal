const express = require("express");
const router = express.Router();
const { registerTeacher, loginTeacher, markAttendance, getAttendanceForStudent, getClassAttendanceByDate } = require("../controllers/teacherController");
const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const Student = require("../models/Student");

router.post("/attendance", verifyToken, requireRole("teacher"), markAttendance);

// TEMP test route
router.get("/test-dashboard", (req, res) => {
  res.json({ message: "✅ Test dashboard works WITHOUT token" });
});

router.get("/dashboard", verifyToken, (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Access denied: Teachers only" });
  }
  res.json({ message: `Welcome Teacher ${req.user.email}` });
});

router.get("/attendance/:studentId", verifyToken, requireRole("teacher"), getAttendanceForStudent);
router.get("/class-attendance", verifyToken, requireRole("teacher"), getClassAttendanceByDate);


router.post("/register", registerTeacher);
router.post("/login", loginTeacher);
// POST /api/teacher/attendance
router.get("/students", verifyToken, requireRole("teacher"), async (req, res) => {
  try {
    const students = await Student.find({}, "name email _id");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

module.exports = router;
