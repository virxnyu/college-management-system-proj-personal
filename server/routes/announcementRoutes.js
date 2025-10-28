const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken");
const requireRole = require("../middleware/roleMiddleware");

// --- TEACHER ROUTES (CRUD) ---

// POST /api/announcements (Create new announcement)
router.post(
    "/",
    verifyFirebaseToken,
    requireRole("teacher"),
    announcementController.createAnnouncement
);

// PUT /api/announcements/:announcementId (Update existing announcement)
router.put(
    "/:announcementId",
    verifyFirebaseToken,
    requireRole("teacher"),
    announcementController.updateAnnouncement
);

// DELETE /api/announcements/:announcementId (Delete announcement)
router.delete(
    "/:announcementId",
    verifyFirebaseToken,
    requireRole("teacher"),
    announcementController.deleteAnnouncement
);

// GET /api/announcements/teacher/:subjectId (Teacher views their subject announcements for management)
router.get(
    "/teacher/:subjectId",
    verifyFirebaseToken,
    requireRole("teacher"),
    announcementController.getTeacherSubjectAnnouncements
);


// --- STUDENT ROUTES (READ) ---

// GET /api/announcements/student/:subjectId (Student views announcements for an enrolled subject)
router.get(
    "/student/:subjectId",
    verifyFirebaseToken,
    requireRole("student"),
    announcementController.getStudentSubjectAnnouncements
);

module.exports = router;
