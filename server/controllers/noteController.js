const Note = require('../models/Note');
const Subject = require('../models/Subject');
const Student = require('../models/Student'); // Needed to find students for notifications
const Teacher = require('../models/Teacher'); // Needed to find teacher for validation
const Notification = require('../models/Notification'); // Needed for notifications
const mongoose = require('mongoose');

// @desc    Teacher uploads a new note for a subject
// @route   POST /api/notes
// @access  Private (Teacher)
exports.uploadNoteController = async (req, res) => {
    try {
        console.log("✅ [NOTE UPLOAD 1/5] Received request to upload note.");
        const { title, subjectId, description } = req.body;
        const teacherFirebaseUid = req.user.uid; // From verifyFirebaseToken

        // --- Basic Validation ---
        if (!title || !subjectId || !req.file) {
             console.error("❌ [NOTE UPLOAD FAIL] Missing title, subjectId, or file.");
            return res.status(400).json({ message: 'Title, Subject ID, and File are required.' });
        }
        console.log("✅ [NOTE UPLOAD 2/5] Basic fields validated.");

        // --- Verify Teacher Ownership of Subject ---
        const teacher = await Teacher.findOne({ firebaseUid: teacherFirebaseUid });
        if (!teacher) {
            console.error(`❌ [NOTE UPLOAD FAIL] Teacher not found in DB for UID: ${teacherFirebaseUid}`);
            return res.status(403).json({ message: 'Teacher profile not found.' });
        }
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            console.error(`❌ [NOTE UPLOAD FAIL] Subject not found for ID: ${subjectId}`);
            return res.status(404).json({ message: 'Subject not found.' });
        }
        if (subject.teacher.toString() !== teacher._id.toString()) {
            console.error(`❌ [NOTE UPLOAD FAIL] Teacher ${teacher._id} does not own subject ${subjectId}`);
            return res.status(403).json({ message: 'You are not authorized to upload notes for this subject.' });
        }
        console.log("✅ [NOTE UPLOAD 3/5] Teacher authorization confirmed.");

        // --- Create and Save Note ---
        const newNote = new Note({
            title,
            subject: subjectId,
            teacher: teacher._id, // Store MongoDB ID of the teacher
            description: description || '',
            fileUrl: req.file.path // Get the Cloudinary URL from multer middleware
        });
        await newNote.save();
        console.log("✅ [NOTE UPLOAD 4/5] Note saved successfully to DB.");

        // --- Create Notifications for Enrolled Students ---
        if (subject.students && subject.students.length > 0) {
            const notifications = subject.students.map(studentId => ({
                recipient: studentId, // Store MongoDB ID of student
                recipientModel: 'Student',
                message: `New note "${title}" uploaded for "${subject.name}".`,
                link: `/subject/${subjectId}/notes` // Link to the notes page for this subject
            }));
            await Notification.insertMany(notifications);
            console.log(`✅ [NOTE UPLOAD 5/5] Created ${notifications.length} notifications for students.`);
        } else {
             console.log("✅ [NOTE UPLOAD 5/5] No students enrolled in this subject, skipping notifications.");
        }


        res.status(201).json({ message: 'Note uploaded successfully.', note: newNote });

    } catch (error) {
        // --- IMPROVED ERROR LOGGING ---
        console.error("--- ❌ ERROR in uploadNoteController ---");
        // Log the full error object, including stack trace
        console.error("Error Object:", error); 
        // Log specific properties if available
        if (error.message) console.error("Error Message:", error.message);
        if (error.stack) console.error("Error Stack:", error.stack);
        // --- END IMPROVED LOGGING ---
        
        // Send generic error response
        res.status(500).json({ message: 'Server error during note upload.' });
    }
};


// @desc    Get all notes for a specific subject
// @route   GET /api/notes/subject/:subjectId
// @access  Private (Student, Teacher)
exports.getNotesBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const userFirebaseUid = req.user.uid;
        const userRole = req.user.role; // Assuming roleMiddleware adds this
        const userMongoId = req.user.mongoId; // Assuming roleMiddleware adds this

        // Validate Subject ID format
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({ message: 'Invalid Subject ID format.' });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }

        // Authorization check: User must be the teacher OR enrolled in the subject
        let isAuthorized = false;
        if (userRole === 'teacher' && subject.teacher.toString() === userMongoId) {
            isAuthorized = true;
        } else if (userRole === 'student' && subject.students.map(id => id.toString()).includes(userMongoId)) {
            isAuthorized = true;
        }

        if (!isAuthorized) {
            return res.status(403).json({ message: 'You are not authorized to view notes for this subject.' });
        }

        const notes = await Note.find({ subject: subjectId })
            .populate('teacher', 'name') // Populate teacher's name
            .sort({ createdAt: -1 }); // Show newest notes first

        res.status(200).json(notes);

    } catch (error) {
        console.error("Error fetching notes by subject:", error);
        res.status(500).json({ message: 'Server error while fetching notes.' });
    }
};


// @desc    Teacher deletes a note
// @route   DELETE /api/notes/:noteId
// @access  Private (Teacher)
exports.deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const teacherFirebaseUid = req.user.uid;
        const teacherMongoId = req.user.mongoId; // Assuming roleMiddleware adds this

        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ message: 'Invalid Note ID format.' });
        }

        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: 'Note not found.' });
        }

        // Authorization: Ensure the logged-in teacher owns this note
        if (note.teacher.toString() !== teacherMongoId) {
            return res.status(403).json({ message: 'You are not authorized to delete this note.' });
        }

        // TODO: Optionally delete the file from Cloudinary here
        // This requires parsing the file public_id from note.fileUrl
        // and using the Cloudinary Admin API. For now, we just delete the DB record.
        // Example (needs cloudinary setup):
        // const publicId = extractPublicIdFromUrl(note.fileUrl);
        // if (publicId) {
        //    await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
        // }

        await Note.findByIdAndDelete(noteId);

        res.status(200).json({ message: 'Note deleted successfully.' });

    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ message: 'Server error while deleting note.' });
    }
};

