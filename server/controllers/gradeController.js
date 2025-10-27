// server/controllers/gradeController.js
const Grade = require('../models/Grade');
const Exam = require('../models/Exam');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// Helper function (if not already defined elsewhere)
const getTeacherMongoId = async (firebaseUid) => {
    if (!firebaseUid) return null;
    const teacher = await Teacher.findOne({ firebaseUid: firebaseUid }).select('_id');
    return teacher ? teacher._id : null;
};
// Helper function (if not already defined elsewhere)
const getStudentMongoId = async (firebaseUid) => {
    if (!firebaseUid) return null;
    const student = await Student.findOne({ firebaseUid: firebaseUid }).select('_id');
    return student ? student._id : null;
};


// @desc    Teacher bulk saves/updates grades for an exam
// @route   POST /api/grades/bulk
// @access  Private (Teacher)
exports.bulkSaveGrades = async (req, res) => {
    try {
        const { examId, gradesData } = req.body; // gradesData = [{ studentId: '...', marksObtained: '...' }, ...]
        const teacherFirebaseUid = req.user.uid;

        if (!examId || !Array.isArray(gradesData)) {
            return res.status(400).json({ message: 'Exam ID and an array of grades data are required.' });
        }

        const teacherMongoId = await getTeacherMongoId(teacherFirebaseUid);
        if (!teacherMongoId) {
            return res.status(404).json({ message: "Teacher profile not found." });
        }

        const exam = await Exam.findById(examId).select('teacher subject totalMarks');
        if (!exam) {
            return res.status(404).json({ message: "Exam not found." });
        }
        if (exam.teacher.toString() !== teacherMongoId.toString()) {
            return res.status(403).json({ message: "You are not authorized to enter grades for this exam." });
        }

        const operations = gradesData.map(({ studentId, marksObtained }) => {
            const marksNum = parseFloat(marksObtained);
            // Basic validation for marks
            if (isNaN(marksNum) || marksNum < 0 || marksNum > exam.totalMarks) {
                 // Throw an error to stop the bulk operation if validation fails for any entry
                 throw new Error(`Invalid marks (${marksObtained}) entered for student ${studentId}. Must be between 0 and ${exam.totalMarks}.`);
            }
            return {
                updateOne: {
                    filter: { exam: examId, student: studentId },
                    update: {
                        $set: {
                            marksObtained: marksNum,
                            subject: exam.subject, // Ensure subject is set/updated
                            markedAt: new Date()
                        }
                    },
                    upsert: true // Creates a new grade if not found, updates if found
                }
            };
        });

        if (operations.length > 0) {
            const result = await Grade.bulkWrite(operations);
            console.log("Bulk grade write result:", result);
            res.status(200).json({ message: `Successfully processed ${gradesData.length} grades.` });
            // TODO: Add notification logic here if needed
        } else {
            res.status(200).json({ message: "No grades data provided to process." });
        }

    } catch (error) {
        console.error("Error bulk saving grades:", error);
         // Handle validation error thrown from the map function
        if (error.message.startsWith('Invalid marks')) {
             return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error bulk saving grades.' });
    }
};

// @desc    Student gets their grades for a specific subject
// @route   GET /api/grades/student/subject/:subjectId
// @access  Private (Student)
exports.getStudentGradesBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const studentFirebaseUid = req.user.uid;

        const studentMongoId = await getStudentMongoId(studentFirebaseUid);
        if (!studentMongoId) {
            return res.status(404).json({ message: "Student profile not found." });
        }

         if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({ message: 'Invalid Subject ID format.' });
        }

        // Optional: Check if student is actually enrolled in this subject for extra security
        const subject = await Subject.findById(subjectId);
        if (!subject || !subject.students.map(id => id.toString()).includes(studentMongoId.toString())) {
             return res.status(403).json({ message: "You are not enrolled in this subject." });
        }


        // Find grades, populate exam details (name, totalMarks)
        const grades = await Grade.find({ student: studentMongoId, subject: subjectId })
            .populate('exam', 'name totalMarks')
            .sort({ markedAt: -1 }); // Show most recent first

        res.status(200).json(grades);

    } catch (error) {
        console.error("Error fetching student grades:", error);
        res.status(500).json({ message: 'Server error fetching grades.' });
    }
};