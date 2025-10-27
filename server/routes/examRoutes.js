// server/routes/examRoutes.js
const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const requireRole = require("../middleware/roleMiddleware");

// POST /api/exams (Teacher creates an exam)
router.post("/", verifyFirebaseToken, requireRole("teacher"), examController.createExam);

// GET /api/exams/subject/:subjectId (Get exams for a subject)
router.get("/subject/:subjectId", verifyFirebaseToken, examController.getExamsBySubject); // Role check happens inside controller


module.exports = router;