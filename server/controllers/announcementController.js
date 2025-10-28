const Announcement = require('../models/Announcement');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// Helper function to get Teacher/Student MongoDB ID from Firebase UID (ensure these exist in your main controllers or import them)
const getTeacherMongoId = async (firebaseUid) => {
    if (!firebaseUid) return null;
    const teacher = await Teacher.findOne({ firebaseUid: firebaseUid }).select('_id');
    return teacher ? teacher._id : null;
};
const getStudentMongoId = async (firebaseUid) => {
    if (!firebaseUid) return null;
    const student = await Student.findOne({ firebaseUid: firebaseUid }).select('_id');
    return student ? student._id : null;
};

// --- TEACHER CRUD OPERATIONS ---

// @desc    Create a new announcement
// @route   POST /api/announcements
// @access  Private (Teacher)
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, subjectId, isUrgent } = req.body;
        const teacherFirebaseUid = req.user.uid;

        if (!title || !content || !subjectId) {
            return res.status(400).json({ message: "Title, content, and Subject ID are required." });
        }

        const teacherId = await getTeacherMongoId(teacherFirebaseUid);
        if (!teacherId) return res.status(404).json({ message: "Teacher profile not found." });

        const subject = await Subject.findById(subjectId);
        if (!subject || subject.teacher.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "You are not authorized for this subject." });
        }

        const announcement = new Announcement({
            title,
            content,
            subject: subjectId,
            teacher: teacherId,
            isUrgent: isUrgent || false,
        });

        await announcement.save();
        res.status(201).json(announcement);

    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).json({ message: "Server error creating announcement." });
    }
};

// @desc    Update an announcement
// @route   PUT /api/announcements/:announcementId
// @access  Private (Teacher - must be owner)
exports.updateAnnouncement = async (req, res) => {
    try {
        const { title, content, isUrgent } = req.body;
        const { announcementId } = req.params;
        const teacherFirebaseUid = req.user.uid;

        const teacherId = await getTeacherMongoId(teacherFirebaseUid);
        if (!teacherId) return res.status(404).json({ message: "Teacher profile not found." });

        const announcement = await Announcement.findById(announcementId);
        if (!announcement) return res.status(404).json({ message: "Announcement not found." });

        // Authorization: Check if the logged-in teacher is the owner
        if (announcement.teacher.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "You can only update your own announcements." });
        }

        // Update fields
        announcement.title = title || announcement.title;
        announcement.content = content || announcement.content;
        announcement.isUrgent = isUrgent !== undefined ? isUrgent : announcement.isUrgent;
        announcement.updatedAt = Date.now();

        await announcement.save();
        res.status(200).json(announcement);

    } catch (error) {
        console.error("Error updating announcement:", error);
        res.status(500).json({ message: "Server error updating announcement." });
    }
};

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:announcementId
// @access  Private (Teacher - must be owner)
exports.deleteAnnouncement = async (req, res) => {
    try {
        const { announcementId } = req.params;
        const teacherFirebaseUid = req.user.uid;

        const teacherId = await getTeacherMongoId(teacherFirebaseUid);
        if (!teacherId) return res.status(404).json({ message: "Teacher profile not found." });

        const announcement = await Announcement.findById(announcementId);
        if (!announcement) return res.status(404).json({ message: "Announcement not found." });

        // Authorization: Check if the logged-in teacher is the owner
        if (announcement.teacher.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "You can only delete your own announcements." });
        }

        await Announcement.findByIdAndDelete(announcementId);
        res.status(200).json({ message: "Announcement deleted successfully." });

    } catch (error) {
        console.error("Error deleting announcement:", error);
        res.status(500).json({ message: "Server error deleting announcement." });
    }
};

// @desc    Get all announcements for a teacher's subjects
// @route   GET /api/announcements/teacher/:subjectId
// @access  Private (Teacher)
exports.getTeacherSubjectAnnouncements = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const teacherFirebaseUid = req.user.uid;

        const teacherId = await getTeacherMongoId(teacherFirebaseUid);
        if (!teacherId) return res.status(404).json({ message: "Teacher profile not found." });

        // Basic authorization check: Ensure subject belongs to the teacher
        const subject = await Subject.findById(subjectId);
        if (!subject || subject.teacher.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "You are not authorized for this subject." });
        }

        const announcements = await Announcement.find({ subject: subjectId })
            .populate('teacher', 'name')
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json(announcements);

    } catch (error) {
        console.error("Error fetching teacher announcements:", error);
        res.status(500).json({ message: "Server error fetching announcements." });
    }
};

// --- STUDENT READ OPERATIONS (Simulating Join/Relationship lookup) ---

// @desc    Get all announcements for one subject (Student view)
// @route   GET /api/announcements/student/:subjectId
// @access  Private (Student - must be enrolled)
exports.getStudentSubjectAnnouncements = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const studentFirebaseUid = req.user.uid;

        const studentId = await getStudentMongoId(studentFirebaseUid);
        if (!studentId) return res.status(404).json({ message: "Student profile not found." });

        // Authorization: Check if student is enrolled in the subject
        const subject = await Subject.findOne({ _id: subjectId, students: studentId });
        if (!subject) {
            return res.status(403).json({ message: "You are not enrolled in this subject." });
        }

        // Fetch announcements for that subject
        const announcements = await Announcement.find({ subject: subjectId })
            .populate('teacher', 'name') // Show who made the announcement
            .sort({ createdAt: -1 });

        res.status(200).json(announcements);

    } catch (error) {
        console.error("Error fetching student announcements:", error);
        res.status(500).json({ message: "Server error fetching announcements." });
    }
};
