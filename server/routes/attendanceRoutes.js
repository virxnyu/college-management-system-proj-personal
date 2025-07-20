const express = require("express");
const router = express.Router();
const { 
    getStudentSubjectDetails, 
    getDailyReport,
    getAttendanceGrid,
    bulkUpdateAttendance,
    getAtRiskStudents,
    getTeacherAttendanceReport
} = require("../controllers/attendanceController");
const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// --- THIS IS THE FIX ---
// We need to import the Attendance model here because it's used directly in the student route below.
const Attendance = require("../models/attendance");

// --- TEACHER ROUTES ---
router.get("/teacher/report", getDailyReport);
router.get("/grid", verifyToken, requireRole("teacher"), getAttendanceGrid);
router.post("/bulk-update", verifyToken, requireRole("teacher"), bulkUpdateAttendance);
router.get("/at-risk", verifyToken, requireRole("teacher"), getAtRiskStudents);
router.get("/teacher/comprehensive-report", verifyToken, requireRole("teacher"), getTeacherAttendanceReport);


// --- STUDENT ROUTES ---
router.get("/student", verifyToken, requireRole("student"), async (req, res) => {
  try {
    // This line will now work correctly because 'Attendance' is defined.
    const records = await Attendance.find({ student: req.user.id }).populate("subject", "name");
    
    const attendanceBySubject = {};

    for (const entry of records) {
      if (!entry.subject) continue; 

      const subjectId = entry.subject._id;

      if (!attendanceBySubject[subjectId]) {
        attendanceBySubject[subjectId] = {
          subjectId,
          subjectName: entry.subject.name,
          total: 0,
          attended: 0
        };
      }

      attendanceBySubject[subjectId].total += 1;
      if (entry.status === "Present") {
        attendanceBySubject[subjectId].attended += 1;
      }
    }

    const result = Object.values(attendanceBySubject).map((subject) => ({
      ...subject,
      percentage: subject.total > 0 ? ((subject.attended / subject.total) * 100) : 0
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching student attendance summary:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/student/subject/:subjectId", verifyToken, requireRole("student"), getStudentSubjectDetails);


module.exports = router;
