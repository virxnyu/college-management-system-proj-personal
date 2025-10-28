const Note = require('../models/Note');
const Subject = require('../models/Subject');
const Student = require('../models/Student'); // Needed to find students for notifications
const Teacher = require('../models/Teacher'); // Needed to find teacher for validation
const Notification = require('../models/Notification'); // Needed for notifications
const mongoose = require('mongoose');

// Helper function to get Teacher's MongoDB ID from Firebase UID (ensure it's defined or imported)
const getTeacherMongoId = async (firebaseUid) => {
    if (!firebaseUid) return null;
    const teacher = await Teacher.findOne({ firebaseUid: firebaseUid }).select('_id');
    return teacher ? teacher._id : null;
};

// Helper function to get Student's MongoDB ID from Firebase UID (ensure it's defined or imported)
const getStudentMongoId = async (firebaseUid) => {
    if (!firebaseUid) return null;
    const student = await Student.findOne({ firebaseUid: firebaseUid }).select('_id');
    return student ? student._id : null;
};


// @desc     Teacher uploads a new note for a subject
// @route    POST /api/notes
// @access   Private (Teacher)
exports.uploadNoteController = async (req, res) => {
    try {
        console.log("✅ [NOTE UPLOAD 1/6] Received request to upload note.");
        const { title, subjectId, description } = req.body;
        const teacherFirebaseUid = req.user.uid;

        if (!title || !subjectId || !req.file) {
            console.error("❌ [NOTE UPLOAD FAIL] Missing title, subjectId, or file.");
            return res.status(400).json({ message: 'Title, Subject ID, and File are required.' });
        }
        console.log("✅ [NOTE UPLOAD 2/6] Basic fields validated.");
        console.log("Uploaded file details:", {
             path: req.file.path,
             mimetype: req.file.mimetype,
             originalname: req.file.originalname,
             size: req.file.size
        });

        const teacherMongoId = await getTeacherMongoId(teacherFirebaseUid);
        if (!teacherMongoId) {
            console.error(`❌ [NOTE UPLOAD FAIL] Teacher not found in DB for UID: ${teacherFirebaseUid}`);
            return res.status(403).json({ message: 'Teacher profile not found.' });
        }
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            console.error(`❌ [NOTE UPLOAD FAIL] Subject not found for ID: ${subjectId}`);
            return res.status(404).json({ message: 'Subject not found.' });
        }
        if (subject.teacher.toString() !== teacherMongoId.toString()) {
            console.error(`❌ [NOTE UPLOAD FAIL] Teacher ${teacherMongoId} does not own subject ${subjectId}`);
            return res.status(403).json({ message: 'You are not authorized to upload notes for this subject.' });
        }
        console.log("✅ [NOTE UPLOAD 3/6] Teacher authorization confirmed.");

        const newNote = new Note({
            title,
            subject: subjectId,
            teacher: teacherMongoId,
            description: description || '',
            fileUrl: req.file.path,
            fileType: req.file.mimetype || 'application/octet-stream'
        });
        console.log("✅ [NOTE UPLOAD 4/6] Note object created, attempting save...");
        await newNote.save();
        console.log("✅ [NOTE UPLOAD 5/6] Note saved successfully to DB.");

        if (subject.students && subject.students.length > 0) {
            const notifications = subject.students.map(studentId => ({
                recipient: studentId,
                recipientModel: 'Student',
                message: `New note "${title}" uploaded for "${subject.name}".`,
                link: `/subject/${subjectId}/notes`
            }));
            await Notification.insertMany(notifications);
            console.log(`✅ [NOTE UPLOAD 6/6] Created ${notifications.length} notifications for students.`);
        } else {
             console.log("✅ [NOTE UPLOAD 6/6] No students enrolled in this subject, skipping notifications.");
        }

        res.status(201).json({ message: 'Note uploaded successfully.', note: newNote });

    } catch (error) {
        console.error("--- ❌ ERROR in uploadNoteController ---");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.name === 'ValidationError') {
             console.error("Validation Errors:", JSON.stringify(error.errors, null, 2));
             const messages = Object.values(error.errors).map(val => val.message);
             const errorMessage = `Validation Failed: ${messages.join('. ')}`;
             return res.status(400).json({ message: errorMessage });
        }
        if (error.http_code) {
             console.error("Cloudinary HTTP Code:", error.http_code);
        }
         if (error.storageErrors && error.storageErrors.length > 0) {
             console.error("Multer/Cloudinary Storage Errors:", JSON.stringify(error.storageErrors, null, 2));
         }
        console.error("Full Error Object:", error);
        console.error("Error Stack:", error.stack);
        res.status(500).json({ message: `Server error during note upload: ${error.message || 'Unknown error'}` });
    }
};


// @desc     Get all notes for a specific subject
// @route    GET /api/notes/subject/:subjectId
// @access   Private (Student, Teacher)
exports.getNotesBySubject = async (req, res) => {
    try {
        console.log(req);
        const { subjectId } = req.params;
        const userFirebaseUid = req.user.uid;
        const userRole = req.user.role; // Assuming roleMiddleware adds this
        const userMongoId = req.user.mongoId; // Assuming roleMiddleware adds this (ObjectId)
        console.log("hello viranyu");
        // --- Add Debug Logs ---
        console.log(`[getNotesBySubject] Checking access for user role: ${userRole}, userMongoId: ${userMongoId}, subjectId: ${subjectId}`);
        // --- End Debug Logs ---

        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({ message: 'Invalid Subject ID format.' });
        }
        if (!userMongoId) { // Check if mongoId was actually found/attached by roleMiddleware
             console.error(`[getNotesBySubject] userMongoId is missing for user UID: ${userFirebaseUid}`);
             return res.status(404).json({ message: 'User profile mapping not found.' });
        }


        const subject = await Subject.findById(subjectId);
        if (!subject) {
            console.log(`[getNotesBySubject] Subject not found: ${subjectId}`);
            return res.status(404).json({ message: 'Subject not found.' });
        }

        // --- Log subject details for debugging ---
        console.log(`[getNotesBySubject] Subject Teacher ID: ${subject.teacher}, Enrolled Student IDs: ${subject.students}`);
        // --- End Debug Logs ---


        // Authorization check: User must be the teacher OR enrolled in the subject
        let isAuthorized = false;
        const userMongoIdString = userMongoId.toString(); // Convert user's ID to string once

        if (userRole === 'teacher' && subject.teacher.toString() === userMongoIdString) {
             console.log(`[getNotesBySubject] Access granted: User is the teacher.`);
            isAuthorized = true;
        } else if (userRole === 'student') {
             // Convert the array of ObjectIds to an array of strings for comparison
            const enrolledStudentIdStrings = subject.students.map(id => id.toString());
             console.log(`[getNotesBySubject] Checking if student ${userMongoIdString} is in ${enrolledStudentIdStrings}`);
             // --- CORRECTED COMPARISON ---
            if (enrolledStudentIdStrings.includes(userMongoIdString)) {
                console.log(`[getNotesBySubject] Access granted: User is an enrolled student.`);
                isAuthorized = true;
            }
             // --- END CORRECTION ---
             else {
                 console.log(`[getNotesBySubject] Access DENIED: Student ${userMongoIdString} not found in subject's student list.`);
             }
        } else {
             console.log(`[getNotesBySubject] Access DENIED: User role '${userRole}' is not teacher or student.`);
        }


        if (!isAuthorized) {
            console.log(`[getNotesBySubject] Final decision: Not Authorized.`);
            return res.status(403).json({ message: 'You are not authorized to view notes for this subject.' });
        }

        console.log(`[getNotesBySubject] Fetching notes...`);
        const notes = await Note.find({ subject: subjectId })
            .populate('teacher', 'name')
            .sort({ createdAt: -1 });

        console.log(`[getNotesBySubject] Found ${notes.length} notes. Sending response.`);
        res.status(200).json(notes);

    } catch (error) {
        console.error("--- ❌ ERROR in getNotesBySubject ---:", error);
        res.status(500).json({ message: 'Server error while fetching notes.' });
    }
};


// @desc     Teacher deletes a note
// @route    DELETE /api/notes/:noteId
// @access   Private (Teacher)
exports.deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const teacherFirebaseUid = req.user.uid;
        const teacherMongoId = req.user.mongoId; // Assuming roleMiddleware adds this

        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ message: 'Invalid Note ID format.' });
        }
         if (!teacherMongoId) { // Check if mongoId was actually found/attached
             console.error(`[deleteNote] teacherMongoId is missing for user UID: ${teacherFirebaseUid}`);
             return res.status(404).json({ message: 'Teacher profile mapping not found.' });
         }

        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: 'Note not found.' });
        }

        // Authorization: Ensure the logged-in teacher owns this note (compare strings)
        if (note.teacher.toString() !== teacherMongoId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this note.' });
        }

        await Note.findByIdAndDelete(noteId);

        res.status(200).json({ message: 'Note deleted successfully.' });

    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ message: 'Server error while deleting note.' });
    }
};

