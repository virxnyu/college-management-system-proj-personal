const express = require("express");
const router = express.Router();

// Import controller functions
const {
  createSubject,
  enrollStudent,
  getSubjectsByTeacher,
  getSubjectsByStudent,
  getStudentsBySubject,
  getAllSubjects,
  getSubjectById
} = require("../controllers/subjectController");

// Import middleware
const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// --- Routes ---

// @route   POST /api/subjects
// @desc    Teacher creates a new subject
// @access  Private (Teacher)
router.post("/", verifyToken, requireRole("teacher"), createSubject);

// @route   POST /api/subjects/enroll
// @desc    Student enrolls in a subject
// @access  Private (Student)
router.post("/enroll", verifyToken, requireRole("student"), enrollStudent);

// @route   GET /api/subjects/teacher
// @desc    Teacher views their created subjects
// @access  Private (Teacher)
router.get("/teacher", verifyToken, requireRole("teacher"), getSubjectsByTeacher);

// @route   GET /api/subjects/student
// @desc    Student views their enrolled subjects
// @access  Private (Student)
router.get("/student", verifyToken, requireRole("student"), getSubjectsByStudent);

// @route   GET /api/subjects/:subjectId/students
// @desc    Teacher views students enrolled in a specific subject
// @access  Private (Teacher)
router.get("/:subjectId/students", verifyToken, requireRole("teacher"), getStudentsBySubject);

// @route   GET /api/subjects
// @desc    Get all subjects (for any authenticated user to see)
// @access  Private
router.get("/", verifyToken, getAllSubjects);

router.get("/:subjectId", verifyToken, getSubjectById);

module.exports = router;
