const express = require("express");
const router = express.Router();
const {
    createAssignment,
    getAssignmentsBySubject, // Used by both Teacher and Student, logic inside controller differentiates
    getSubmissionsForAssignment,
    createSubmission,
    getStudentDashboardAssignments,
    getAssignmentDetails,
    getTeacherAssignments
} = require("../controllers/assignmentController");

// --- USE THE NEW FIREBASE MIDDLEWARE ---
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken"); 
const requireRole = require("../middleware/roleMiddleware"); // Keep requireRole
const { uploadAssignment } = require('../middleware/uploadMiddleware'); // Ensure correct import

// --- TEACHER ROUTES ---
// Create a new assignment
router.post("/", verifyFirebaseToken, requireRole("teacher"), createAssignment); // Use new middleware

// Get all assignments created BY the logged-in teacher (for teacher dashboard list)
router.get("/teacher/all", verifyFirebaseToken, requireRole("teacher"), getTeacherAssignments); // Use new middleware

// Get all student submissions for a specific assignment
router.get("/:assignmentId/submissions", verifyFirebaseToken, requireRole("teacher"), getSubmissionsForAssignment); // Use new middleware

// --- STUDENT ROUTES ---
// Submit work for an assignment (includes file upload middleware)
router.post("/:assignmentId/submit", verifyFirebaseToken, requireRole("student"), uploadAssignment.single('file'), createSubmission); // Use new middleware

// Get all assignments for subjects the logged-in student is ENROLLED IN (for student dashboard)
router.get("/student/all", verifyFirebaseToken, requireRole("student"), getStudentDashboardAssignments); // Use new middleware

// --- SHARED ROUTES --- 
// Get assignments FOR a specific subject (used by teacher/student subject view)
router.get("/subject/:subjectId", verifyFirebaseToken, getAssignmentsBySubject); // Use new middleware (role check inside controller maybe?)

// Get details for a SINGLE assignment (e.g., for viewing submission page header)
router.get("/:assignmentId", verifyFirebaseToken, getAssignmentDetails); // Use new middleware


module.exports = router;
