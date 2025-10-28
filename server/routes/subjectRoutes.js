    const express = require("express");
    const router = express.Router();
    const subjectController = require("../controllers/subjectController"); // Import the controller
    const verifyFirebaseToken = require('../middleware/verifyFirebaseToken'); // Use Firebase auth middleware
    const requireRole = require('../middleware/roleMiddleware'); // Use updated role middleware

    // --- Routes ---

    // GET /api/subjects (Get all subjects - for student enrollment list)
    router.get("/", verifyFirebaseToken, subjectController.getAllSubjects);

    // GET /api/subjects/teacher (Teacher gets their created subjects)
    router.get("/teacher", verifyFirebaseToken, requireRole("teacher"), subjectController.getSubjectsByTeacher);

    // GET /api/subjects/student (Student gets their enrolled subjects)
    router.get("/student", verifyFirebaseToken, requireRole("student"), subjectController.getSubjectsByStudent);

    // --- CORRECT ORDER: '/search' MUST COME BEFORE '/:subjectId' ---
    // GET /api/subjects/search?q=... (Search subjects by name or code)
    router.get("/search", verifyFirebaseToken, subjectController.searchSubjects);
    // --- END CORRECT ORDER ---

    // GET /api/subjects/:subjectId (Get details for a single subject - used by MyAttendance etc.)
    // This MUST come AFTER /search so "search" isn't treated as an ID
    router.get("/:subjectId", verifyFirebaseToken, subjectController.getSubjectById);

    // GET /api/subjects/:subjectId/students (Teacher gets students for a specific subject)
    // This is okay here as it's more --specific than just /:subjectId
    router.get("/:subjectId/students", verifyFirebaseToken, requireRole("teacher"), subjectController.getStudentsBySubject);

    // POST /api/subjects (Teacher creates a new subject)
    router.post("/", verifyFirebaseToken, requireRole("teacher"), subjectController.createSubject);

    // POST /api/subjects/enroll (Student enrolls in a subject)
    router.post("/enroll", verifyFirebaseToken, requireRole("student"), subjectController.enrollStudent);

    // DELETE /api/subjects/:subjectId (Teacher deletes a subject - cascading delete)
    router.delete("/:subjectId", verifyFirebaseToken, requireRole("teacher"), subjectController.deleteSubject);


    module.exports = router;
    
