const express = require("express");
const router = express.Router();
const { 
    getStudentSubjectDetails, 
    // getDailyReport, // Removed - Replaced by comprehensive report
    // getAttendanceGrid, // Removed - Part of old command center
    bulkUpdateAttendance,
    getAtRiskStudents,
    getTeacherAttendanceReport // Keep the comprehensive report function
} = require("../controllers/attendanceController");

// --- USE THE NEW FIREBASE MIDDLEWARE ---
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken"); 
const requireRole = require("../middleware/roleMiddleware"); // Keep requireRole (we'll update it later)
const Attendance = require("../models/attendance"); // Keep for the inline student route logic

// --- TEACHER ROUTES ---
// Removed old /teacher/report and /grid routes

// Use the comprehensive report endpoint
router.get("/teacher/comprehensive-report", verifyFirebaseToken, requireRole("teacher"), getTeacherAttendanceReport); // Use new middleware

// Bulk update remains the same route, just uses new middleware
router.post("/bulk-update", verifyFirebaseToken, requireRole("teacher"), bulkUpdateAttendance); // Use new middleware

// At-risk route remains the same, just uses new middleware
router.get("/at-risk", verifyFirebaseToken, requireRole("teacher"), getAtRiskStudents); // Use new middleware


// --- STUDENT ROUTES ---
// This route calculates the summary, logic remains here for now
router.get("/student", verifyFirebaseToken, requireRole("student"), async (req, res) => { // Use new middleware
    try {
        // --- IMPORTANT: Need to get student's MongoDB ID from Firebase UID ---
        const firebaseUid = req.user.uid;
        const Student = require('../models/Student'); // Import Student model if not already done
        const student = await Student.findOne({ firebaseUid: firebaseUid });
        if (!student) {
             console.error(`Student profile not found for UID: ${firebaseUid} in /student attendance route`);
             return res.status(404).json({ message: "Student profile not found." });
        }
        const studentId = student._id; // Use the MongoDB ID for the query
        // --- End of modification ---

        const records = await Attendance.find({ student: studentId }).populate("subject", "name");
        
        // ... rest of the summary calculation logic remains the same ...
        const attendanceBySubject = {};
        for (const entry of records) {
            // ... (calculate total/attended) ...
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
            percentage: subject.total > 0 ? ((subject.attended / subject.total) * 100).toFixed(0) : 0 // Keep percentages simple
        }));
        res.json(result);

    } catch (error) {
        console.error("Error fetching student attendance summary:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Subject details route remains the same, just uses new middleware
router.get("/student/subject/:subjectId", verifyFirebaseToken, requireRole("student"), getStudentSubjectDetails); // Use new middleware


module.exports = router;
