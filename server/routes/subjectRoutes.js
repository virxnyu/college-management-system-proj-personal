const express = require("express");
const router = express.Router();
const {
  createSubject,
  enrollStudent,
  getSubjectsByTeacher,
  getSubjectsByStudent
} = require("../controllers/subjectController");

const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// 📌 Teacher: create a new subject
router.post("/create", verifyToken, requireRole("teacher"), createSubject);

// 📌 Student: enroll in a subject
router.post("/enroll", verifyToken, requireRole("student"), enrollStudent);

// 📌 Teacher: view their subjects
router.get("/teacher", verifyToken, requireRole("teacher"), getSubjectsByTeacher);

// 📌 Student: view enrolled subjects
router.get("/student", verifyToken, requireRole("student"), getSubjectsByStudent);

// 📌 Get all subjects (for students to enroll)
router.get("/", require("../controllers/subjectController").getAllSubjects);

router.get(
  "/:subjectId/students",
  verifyToken,
  requireRole("teacher"),
  require("../controllers/subjectController").getStudentsBySubject
);

module.exports = router;
