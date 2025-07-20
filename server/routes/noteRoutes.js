const express = require('express');
const router = express.Router();

// Import controller functions
const {
    uploadNote,
    getNotesBySubject,
    deleteNote
} = require('../controllers/noteController');

// Import middleware
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
// Import the specific handler for note uploads
const { uploadNote: noteUploadMiddleware } = require('../middleware/uploadMiddleware');

// --- Teacher Routes ---

// @route   POST /api/notes
// @desc    Teacher uploads a new note for a subject
// @access  Private (Teacher)
// This route uses our specialized 'uploadNote' middleware to handle the file.
router.post(
    '/',
    verifyToken,
    requireRole('teacher'),
    noteUploadMiddleware.single('noteFile'), // 'noteFile' is the key the frontend will use
    uploadNote
);

// @route   DELETE /api/notes/:noteId
// @desc    Teacher deletes a note
// @access  Private (Teacher)
router.delete('/:noteId', verifyToken, requireRole('teacher'), deleteNote);


// --- Shared Routes (Teacher & Student) ---

// @route   GET /api/notes/subject/:subjectId
// @desc    Get all notes for a specific subject
// @access  Private (Authenticated Users)
router.get('/subject/:subjectId', verifyToken, getNotesBySubject);


module.exports = router;
