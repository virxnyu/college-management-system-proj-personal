// server/routes/gradeRoutes.js
const express = require("express");
const router = express.Router();
const gradeController = require("../controllers/gradeController");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const requireRole = require("../middleware/roleMiddleware");

// POST /api/grades/bulk (Teacher saves/updates grades for an exam)
router.post("/bulk", verifyFirebaseToken, requireRole("teacher"), gradeController.bulkSaveGrades);

// GET /api/grades/student/subject/:subjectId (Student gets their grades for a subject)
router.get("/student/subject/:subjectId", verifyFirebaseToken, requireRole("student"), gradeController.getStudentGradesBySubject);

module.exports = router;