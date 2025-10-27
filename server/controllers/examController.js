// server/controllers/examController.js
const Exam = require('../models/Exam');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const mongoose = require('mongoose');

// Helper function (if not already defined elsewhere)
const getTeacherMongoId = async (firebaseUid) => {
    if (!firebaseUid) return null;
    const teacher = await Teacher.findOne({ firebaseUid: firebaseUid }).select('_id');
    return teacher ? teacher._id : null;
};

// @desc    Teacher creates a new exam for a subject
// @route   POST /api/exams
// @access  Private (Teacher)
exports.createExam = async (req, res) => {
    try {
        const { name, subjectId, totalMarks } = req.body;
        const teacherFirebaseUid = req.user.uid;

        if (!name || !subjectId || !totalMarks) {
            return res.status(400).json({ message: 'Exam name, Subject ID, and Total Marks are required.' });
        }
        if (isNaN(parseInt(totalMarks)) || parseInt(totalMarks) < 1) {
             return res.status(400).json({ message: 'Total Marks must be a positive number.' });
        }

        const teacherMongoId = await getTeacherMongoId(teacherFirebaseUid);
        if (!teacherMongoId) {
            return res.status(404).json({ message: "Teacher profile not found." });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found." });
        }
        if (subject.teacher.toString() !== teacherMongoId.toString()) {
            return res.status(403).json({ message: "You are not authorized to create exams for this subject." });
        }

        const newExam = new Exam({
            name,
            subject: subjectId,
            teacher: teacherMongoId,
            totalMarks: parseInt(totalMarks),
        });

        await newExam.save();
        res.status(201).json(newExam);

    } catch (error) {
        console.error("Error creating exam:", error);
         if (error.code === 11000) { // Handle potential unique index errors if added later
             return res.status(400).json({ message: "An exam with this name might already exist for this subject." });
         }
        res.status(500).json({ message: 'Server error creating exam.' });
    }
};

// @desc    Get all exams for a specific subject
// @route   GET /api/exams/subject/:subjectId
// @access  Private (Teacher, possibly Student later)
exports.getExamsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const userFirebaseUid = req.user.uid; // Verify the user has access
        const userRole = req.user.role; // Assuming roleMiddleware adds this
        const userMongoId = req.user.mongoId; // Assuming roleMiddleware adds this


        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({ message: 'Invalid Subject ID format.' });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }

        // Authorization: User must be the teacher OR enrolled in the subject
        let isAuthorized = false;
        if (userRole === 'teacher' && subject.teacher.equals(userMongoId)) {
            isAuthorized = true;
        } else if (userRole === 'student' && subject.students.map(id => id.toString()).includes(userMongoId)) {
             isAuthorized = true; // Allow students to see exam list too
        }

        if (!isAuthorized) {
            return res.status(403).json({ message: 'You are not authorized to view exams for this subject.' });
        }

        const exams = await Exam.find({ subject: subjectId }).sort({ createdAt: -1 }); // Newest first
        res.status(200).json(exams);

    } catch (error) {
        console.error("Error fetching exams by subject:", error);
        res.status(500).json({ message: 'Server error fetching exams.' });
    }
};