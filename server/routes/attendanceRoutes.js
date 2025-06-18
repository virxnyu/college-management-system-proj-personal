const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { authenticateStudent } = require("../middleware/authMiddleware"); // or your exact path


const { markAttendance } = require("../controllers/attendanceController");

const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// ✅ Only teachers can mark attendance
router.post("/", verifyToken, requireRole("teacher"), markAttendance);

const Attendance = require("../models/attendance");

router.get("/student", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.user.id }).populate("subject");

    // Group by subject
    const attendanceBySubject = {};

    for (const entry of records) {
      const subjectId = entry.subject._id;
      const subjectName = entry.subject.name;

      if (!attendanceBySubject[subjectId]) {
        attendanceBySubject[subjectId] = {
          subjectId,
          subjectName,
          total: 0,
          attended: 0
        };
      }

      attendanceBySubject[subjectId].total += 1;

      if (entry.status === "Present" || entry.status === "Late") {
        attendanceBySubject[subjectId].attended += 1;
      }
    }

    // Convert to array and calculate percentage
    const result = Object.values(attendanceBySubject).map((subject) => ({
      ...subject,
      percentage: ((subject.attended / subject.total) * 100).toFixed(2) + "%"
    }));

    res.json(result);
  } catch (error) {
    console.error("❌ Error fetching student attendance:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Subject-wise attendance stats for a student
router.get("/student/subject/:subjectId", verifyToken, requireRole("student"), async (req, res) => {
  try {
    const { subjectId } = req.params;
    const records = await Attendance.find({
      student: req.user.id,
      subject: subjectId
    });

    const total = records.length;
    const attended = records.filter(r => r.status === "Present" || r.status === "Late").length;
    const percentage = total > 0 ? ((attended / total) * 100).toFixed(2) : "0.00";

    res.json({ total, attended, percentage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// This route allows teachers to mark attendance for students.
// It uses the `markAttendance` controller function to handle the logic.