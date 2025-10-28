const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const requireRole = require('../middleware/roleMiddleware');
const { uploadNote } = require('../middleware/uploadMiddleware'); // Multer middleware for Cloudinary

// --- Teacher Routes ---
router.post(
    '/',
    verifyFirebaseToken,
    requireRole('teacher'),
    (req, res, next) => {
        console.log('--- noteRoutes.js: POST / Request received, BEFORE Multer ---');
        console.log('Initial req.body (expected undefined):', req.body);
        next();
    },
    (req, res, next) => {
        uploadNote.single('file')(req, res, (err) => {
            if (err) {
                console.error('--- noteRoutes.js: ERROR during uploadNote.single("file") ---');
                console.error('Multer/Cloudinary Error Name:', err.name);
                console.error('Multer/Cloudinary Error Message:', err.message);
                console.error('Full Multer/Cloudinary Error:', err);
                const statusCode = err.http_code || (err.code === 'LIMIT_FILE_SIZE' ? 400 : 500);
                return res.status(statusCode).json({
                    message: `File upload failed: ${err.message || 'Check server logs.'}`,
                    error: err
                });
            }
            console.log('--- noteRoutes.js: Multer middleware executed successfully ---');
            next();
        });
    },
    (req, res, next) => {
        console.log('--- noteRoutes.js: POST / AFTER Multer middleware (Success) ---');
        console.log('req.body AFTER Multer:', req.body);
        if (req.file) {
            console.log('req.file AFTER Multer:', { path: req.file.path, mimetype: req.file.mimetype, size: req.file.size });
            next();
        } else {
            console.error('!!! AFTER Multer: req.file is missing, but no error was caught. This should not happen. !!!');
            if (!res.headersSent) {
                return res.status(500).json({ message: 'File upload middleware finished unexpectedly without a file or error.' });
            }
        }
    },
    noteController.uploadNoteController
);

// --- Student & Teacher Routes ---
router.get(
    '/subject/:subjectId',
    verifyFirebaseToken, // Middleware 1: Verify token
    (req, res, next) => { // <-- ADDED MIDDLEWARE FOR LOGGING
        console.log(`--- noteRoutes.js: GET /subject/${req.params.subjectId} Route Reached ---`);
        console.log(`User UID: ${req.user?.uid}, Role Middleware should run next.`);
        next(); // Call the next function in the chain (noteController.getNotesBySubject)
    },                  // <-- END ADDED MIDDLEWARE
    noteController.getNotesBySubject // Middleware 2 (Final Handler): Get notes
);

// --- Teacher Route ---
router.delete(
    '/:noteId',
    verifyFirebaseToken,
    requireRole('teacher'),
    noteController.deleteNote
);


module.exports = router;

