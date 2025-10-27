    const express = require('express');
    const router = express.Router();
    const noteController = require('../controllers/noteController');
    const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
    const requireRole = require('../middleware/roleMiddleware'); // Assuming this is the correct name
    const { uploadNote } = require('../middleware/uploadMiddleware'); // Keep this import for now

 

    // --- Teacher Routes ---
    router.post(
    '/',
    verifyFirebaseToken,
    requireRole('teacher'),
    // --- CHANGE THIS BACK ---
    uploadNote.single('file'), // Use the Cloudinary uploader again
    noteController.uploadNoteController
);

    // --- Student & Teacher Routes ---
    router.get(
        '/subject/:subjectId',
        verifyFirebaseToken, // Any logged-in user can view notes for their subjects
        noteController.getNotesBySubject
    );

    // --- Teacher Route ---
    router.delete(
        '/:noteId',
        verifyFirebaseToken,
        requireRole('teacher'),
        noteController.deleteNote
    );


    module.exports = router;
    

