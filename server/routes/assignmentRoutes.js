const express = require('express');
const router = express.Router();

// Import controller functions
const {
    createAssignment,
    getAssignmentsBySubject,
    getSubmissionsForAssignment,
    createSubmission,
    getStudentDashboardAssignments,
    getAssignmentDetails,
    getTeacherAssignments
} = require('../controllers/assignmentController');

// Import middleware
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
// --- THIS IS THE FIX ---
// We now import the specific handler for assignments
const { uploadAssignment } = require('../middleware/uploadMiddleware');

// --- Teacher Routes ---
router.post('/', verifyToken, requireRole('teacher'), createAssignment);
router.get('/:assignmentId/submissions', verifyToken, requireRole('teacher'), getSubmissionsForAssignment);
router.get('/teacher/all', verifyToken, requireRole('teacher'), getTeacherAssignments);


// --- Student Routes ---
router.get('/student/all', verifyToken, requireRole('student'), getStudentDashboardAssignments);

// This route now correctly uses the dedicated assignment upload middleware
router.post(
    '/:assignmentId/submit', 
    verifyToken, 
    requireRole('student'), 
    uploadAssignment.single('submissionFile'), 
    createSubmission
);


// --- Shared Routes ---
router.get('/subject/:subjectId', verifyToken, getAssignmentsBySubject);
router.get('/:assignmentId', verifyToken, getAssignmentDetails);


module.exports = router;
