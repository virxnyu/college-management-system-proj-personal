const Note = require('../models/Note');
const Subject = require('../models/Subject');
const Notification = require('../models/Notification'); // --- 1. IMPORT THE NOTIFICATION MODEL ---

// @desc    Teacher uploads a new note/resource for a subject
// @route   POST /api/notes
// @access  Private (Teacher)
// --- THIS FUNCTION IS NOW UPGRADED ---
// @desc    Teacher uploads a new note/resource for a subject
exports.uploadNote = async (req, res) => {
    try {
        const { title, description, subjectId } = req.body;
        const teacherId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: "A file is required to create a note." });
        }
        const { path: fileUrl, mimetype: fileType } = req.file;

        const subject = await Subject.findById(subjectId);
        if (!subject || subject.teacher.toString() !== teacherId) {
            return res.status(403).json({ message: "You are not authorized to add notes to this subject." });
        }

        const newNote = new Note({
            title,
            description,
            fileUrl,
            fileType,
            subject: subjectId,
            teacher: teacherId,
        });

        await newNote.save();

        // --- 2. CREATE NOTIFICATIONS FOR ALL ENROLLED STUDENTS ---
        if (subject.students && subject.students.length > 0) {
            const notifications = subject.students.map(studentId => ({
                recipient: studentId,
                recipientModel: 'Student',
                message: `A new note, "${title}", was added to ${subject.name}.`,
                link: `/subject/${subjectId}/notes`
            }));
            // Use insertMany for high efficiency
            await Notification.insertMany(notifications);
        }
        // --- END OF NOTIFICATION LOGIC ---

        res.status(201).json({ message: "Note uploaded successfully.", note: newNote });

    } catch (error) {
        console.error("Error uploading note:", error);
        res.status(500).json({ message: "Server error while uploading note." });
    }
};

// @desc    Get all notes for a specific subject
// @route   GET /api/notes/subject/:subjectId
// @access  Private (Teacher, Student)
exports.getNotesBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;

        // Optional: Add validation here to ensure the requesting student is enrolled
        // or the teacher owns the subject. For now, we'll allow any authenticated user.

        const notes = await Note.find({ subject: subjectId })
            .sort({ createdAt: -1 }); // Show the newest notes first

        res.status(200).json(notes);

    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ message: "Server error while fetching notes." });
    }
};

// @desc    Teacher deletes a note
// @route   DELETE /api/notes/:noteId
// @access  Private (Teacher)
exports.deleteNote = async (req, res) => {
    try {
        const { noteId } = req.params;
        const teacherId = req.user.id;

        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: "Note not found." });
        }

        // Verify that the teacher deleting the note is the one who created it
        if (note.teacher.toString() !== teacherId) {
            return res.status(403).json({ message: "You are not authorized to delete this note." });
        }

        // Optional: Add logic here to delete the file from Cloudinary as well
        // For simplicity, we are just deleting the database record for now.

        await Note.findByIdAndDelete(noteId);

        res.status(200).json({ message: "Note deleted successfully." });

    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ message: "Server error while deleting note." });
    }
};
