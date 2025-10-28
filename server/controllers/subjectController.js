// const Subject = require("../models/Subject");
// const Student = require("../models/Student");
// const Teacher = require('../models/Teacher'); // Import Teacher model
// const Attendance = require('../models/attendance'); // Import Attendance model
// const Assignment = require('../models/Assignment'); // Import Assignment model
// const Submission = require('../models/Submission'); // Import Submission model
// const Note = require('../models/Note'); // Import Note model
// const mongoose = require('mongoose');

// // Helper function to get Teacher's MongoDB ID from Firebase UID
// const getTeacherMongoId = async (firebaseUid) => {
//     if (!firebaseUid) return null;
//     const teacher = await Teacher.findOne({ firebaseUid: firebaseUid }).select('_id');
//     return teacher ? teacher._id : null;
// };
// // Helper function to get Student's MongoDB ID from Firebase UID
// const getStudentMongoId = async (firebaseUid) => {
//     if (!firebaseUid) return null;
//     const student = await Student.findOne({ firebaseUid: firebaseUid }).select('_id');
//     return student ? student._id : null;
// };


// // @desc    Teacher creates a new subject
// // @route   POST /api/subjects
// // @access  Private (Teacher)
// exports.createSubject = async (req, res) => {
//     try {
//         const { name, code } = req.body;
//         const teacherFirebaseUid = req.user.uid; // UID from verifyFirebaseToken

//         if (!name || !code) {
//             return res.status(400).json({ message: "Please provide a name and code for the subject" });
//         }
//         if (!teacherFirebaseUid) {
//              return res.status(401).json({ message: "Teacher authentication failed." });
//         }

//         // Find the Teacher's MongoDB ID
//         const teacherMongoId = await getTeacherMongoId(teacherFirebaseUid);
//         if (!teacherMongoId) {
//             console.error(`Teacher not found in DB for firebaseUid: ${teacherFirebaseUid}`);
//             return res.status(404).json({ message: "Teacher profile not found in database." });
//         }

//         const existingSubject = await Subject.findOne({ code });
//         if (existingSubject) {
//             return res.status(400).json({ message: "A subject with this code already exists" });
//         }

//         const subject = new Subject({
//             name,
//             code,
//             teacher: teacherMongoId, // Use MongoDB ID
//         });
//         await subject.save();

//         res.status(201).json({ message: "Subject created successfully", subject });
//     } catch (err) {
//         console.error("Error creating subject:", err);
//         res.status(500).json({ message: "Server error while creating subject" });
//     }
// };

// // @desc    Student enrolls in a subject
// // @route   POST /api/subjects/enroll
// // @access  Private (Student)
// exports.enrollStudent = async (req, res) => {
//     try {
//         const { subjectId } = req.body;
//         const studentFirebaseUid = req.user.uid; // UID from verifyFirebaseToken

//         if (!studentFirebaseUid) {
//              return res.status(401).json({ message: "Student authentication failed." });
//         }
//          // Find the Student's MongoDB ID
//         const studentMongoId = await getStudentMongoId(studentFirebaseUid);
//         if (!studentMongoId) {
//             console.error(`Student not found in DB for firebaseUid: ${studentFirebaseUid}`);
//             return res.status(404).json({ message: "Student profile not found in database." });
//         }

//         const subject = await Subject.findById(subjectId);
//         if (!subject) {
//             return res.status(404).json({ message: "Subject not found" });
//         }

//         // Check if student's MongoDB ID is already in the array
//         const isEnrolled = subject.students.some(id => id.equals(studentMongoId));
//         if (isEnrolled) {
//             return res.status(400).json({ message: "You are already enrolled in this subject" });
//         }

//         subject.students.push(studentMongoId); // Add MongoDB ID
//         await subject.save();

//         res.status(200).json({ message: "Enrolled successfully", subject });
//     } catch (err) {
//         console.error("Error enrolling in subject:", err);
//         res.status(500).json({ message: "Server error while enrolling in subject" });
//     }
// };

// // @desc    Teacher gets all subjects they created
// // @route   GET /api/subjects/teacher
// // @access  Private (Teacher)
// exports.getSubjectsByTeacher = async (req, res) => {
//     try {
//         const teacherFirebaseUid = req.user.uid;
//         if (!teacherFirebaseUid) return res.status(401).json({ message: "Authentication failed." });

//         const teacherMongoId = await getTeacherMongoId(teacherFirebaseUid);
//         if (!teacherMongoId) return res.status(404).json({ message: "Teacher profile not found." });

//         const subjects = await Subject.find({ teacher: teacherMongoId })
//                                       .populate("students", "name email"); // Populate student details
//         res.status(200).json(subjects);
//     } catch (err) {
//         console.error("Error fetching teacher's subjects:", err);
//         res.status(500).json({ message: "Error fetching subjects" });
//     }
// };

// // @desc    Student gets all subjects they are enrolled in
// // @route   GET /api/subjects/student
// // @access  Private (Student)
// exports.getSubjectsByStudent = async (req, res) => {
//      try {
//         const studentFirebaseUid = req.user.uid;
//         if (!studentFirebaseUid) return res.status(401).json({ message: "Authentication failed." });

//         const studentMongoId = await getStudentMongoId(studentFirebaseUid);
//         if (!studentMongoId) return res.status(404).json({ message: "Student profile not found." });

//         const subjects = await Subject.find({ students: studentMongoId }) // Query using MongoDB ID
//                                       .populate("teacher", "name email"); // Populate teacher details
//         res.status(200).json(subjects);
//     } catch (err) {
//         console.error("Error fetching student's subjects:", err);
//         res.status(500).json({ message: "Error fetching subjects" });
//     }
// };

// // @desc    Teacher gets all students for a specific subject
// // @route   GET /api/subjects/:subjectId/students
// // @access  Private (Teacher)
// exports.getStudentsBySubject = async (req, res) => {
//     try {
//         const teacherFirebaseUid = req.user.uid;
//         if (!teacherFirebaseUid) return res.status(401).json({ message: "Authentication failed." });

//         const teacherMongoId = await getTeacherMongoId(teacherFirebaseUid);
//         if (!teacherMongoId) return res.status(404).json({ message: "Teacher profile not found." });

//         const subject = await Subject.findById(req.params.subjectId)
//                                       .populate("students", "name email _id"); // Populate student details needed
//         if (!subject) {
//             return res.status(404).json({ message: "Subject not found" });
//         }

//         // Authorization: Check using MongoDB ID
//         if (!subject.teacher.equals(teacherMongoId)) {
//             return res.status(403).json({ message: "Not authorized to view students for this subject" });
//         }

//         res.status(200).json(subject.students);
//     } catch (err) {
//         console.error("Error fetching students by subject:", err);
//         res.status(500).json({ message: "Error fetching students for the subject" });
//     }
// };

// // @desc    Get all subjects (e.g., for a student enrollment list)
// // @route   GET /api/subjects
// // @access  Private (Authenticated Users)
// exports.getAllSubjects = async (req, res) => {
//     try {
//         // Find all subjects and populate the teacher's name
//         const subjects = await Subject.find({}).populate("teacher", "name");
//         res.status(200).json(subjects);
//     } catch (err) {
//         console.error("Error fetching all subjects:", err);
//         res.status(500).json({ message: "Error fetching all subjects" });
//     }
// };

// // @desc    Get details for a single subject by ID
// // @route   GET /api/subjects/:subjectId
// // @access  Private (Authenticated users - used by MyAttendance)
// exports.getSubjectById = async (req, res) => {
//     console.log(`✅ [SUBJECT 1/3] Received request for subject ID: ${req.params.subjectId}`);
//     try {
//         const subject = await Subject.findById(req.params.subjectId)
//                                       .populate('teacher', 'name email') // Optionally populate teacher details
//                                       .populate('students', 'name email'); // Optionally populate student details
//         console.log("✅ [SUBJECT 2/3] Subject found in DB.");

//         if (!subject) {
//             console.warn(`Subject not found for ID: ${req.params.subjectId}`);
//             return res.status(404).json({ message: 'Subject not found' });
//         }

//         res.status(200).json(subject);
//         console.log("✅ [SUBJECT 3/3] Subject details sent successfully.");
//     } catch (error) {
//         console.error(`--- ❌ ERROR in getSubjectById for ID: ${req.params.subjectId} ---:`, error);
//         // Handle potential CastError if the ID format is invalid
//         if (error instanceof mongoose.Error.CastError) {
//              return res.status(400).json({ message: 'Invalid Subject ID format.' });
//         }
//         res.status(500).json({ message: 'Server error retrieving subject details.' });
//     }
// };

// // @desc    Teacher deletes a subject and related data
// // @route   DELETE /api/subjects/:subjectId
// // @access  Private (Teacher)
// exports.deleteSubject = async (req, res) => {
//     console.log(`[DELETE Subject 1/6] Received request to delete subject ID: ${req.params.subjectId}`);
//     try {
//         const { subjectId } = req.params;
//         const firebaseUid = req.user.uid;

//         if (!firebaseUid) return res.status(401).json({ message: "Authentication failed." });
//         const teacherMongoId = await getTeacherMongoId(firebaseUid);
//         if (!teacherMongoId) return res.status(404).json({ message: "Teacher profile not found." });
//         console.log(`[DELETE Subject 2/6] Teacher found with ID: ${teacherMongoId}`);

//         // Find the subject to ensure it exists and belongs to the teacher
//         const subject = await Subject.findById(subjectId);
//         if (!subject) {
//             console.log(`[DELETE Subject WARN] Subject not found: ${subjectId}`);
//             return res.status(404).json({ message: "Subject not found" });
//         }
//         if (!subject.teacher.equals(teacherMongoId)) {
//             console.log(`[DELETE Subject FORBIDDEN] Teacher ${teacherMongoId} does not own subject ${subjectId}`);
//             return res.status(403).json({ message: "You are not authorized to delete this subject" });
//         }
//         console.log(`[DELETE Subject 3/6] Authorization confirmed.`);

//         // Perform cascading deletes (using Promise.all for parallel execution)
//         console.log(`[DELETE Subject 4/6] Starting cascading deletes for subject ${subjectId}...`);
//         // Find assignments related to the subject first to delete their submissions
//         const assignmentsToDelete = await Assignment.find({ subject: subjectId }).select('_id');
//         const assignmentIds = assignmentsToDelete.map(a => a._id);

//         const deletePromises = [
//             Attendance.deleteMany({ subject: subjectId }),
//             Assignment.deleteMany({ subject: subjectId }),
//             Note.deleteMany({ subject: subjectId }),
//             // Delete submissions linked directly to the subject OR linked to assignments being deleted
//             Submission.deleteMany({ $or: [{ subject: subjectId }, { assignment: { $in: assignmentIds } }] })
//         ];

//         await Promise.all(deletePromises);
//         console.log(`[DELETE Subject 5/6] Cascading deletes completed.`);

//         // Finally, delete the subject itself
//         await Subject.findByIdAndDelete(subjectId); // Changed from deleteOne to findByIdAndDelete
//         console.log(`[DELETE Subject 6/6] Subject ${subjectId} deleted successfully.`);

//         res.status(200).json({ message: "Subject and all associated data deleted successfully" });

//     } catch (error) {
//         console.error(`--- ❌ ERROR in deleteSubject for ID: ${req.params.subjectId} ---:`, error);
//         res.status(500).json({ message: "Server error during subject deletion." });
//     }
// };


// // --- THIS IS THE NEW SEARCH FUNCTION ---
// // @desc    Search for subjects by name or code using text index
// // @route   GET /api/subjects/search?q=...
// // @access  Private (Authenticated Users)
// exports.searchSubjects = async (req, res) => {
//     try {
//         const query = req.query.q; // Get search term from query param ?q=...
//         if (!query || query.trim() === '') {
//             // Return empty array if query is empty or just whitespace
//             return res.status(200).json([]);
//         }

//         console.log(`Searching subjects for query: "${query}"`);

//         // Use the $text operator which utilizes the text index
//         // Ensure the text index exists on the Subject collection in MongoDB Atlas
//         const subjects = await Subject.find(
//             { $text: { $search: query } },
//             { score: { $meta: "textScore" } } // Include relevance score
//         ).sort({ score: { $meta: "textScore" } }) // Sort by relevance
//          .populate('teacher', 'name') // Include teacher name for context
//          .limit(20); // Limit results for performance and prevent overload

//         console.log(`Found ${subjects.length} subjects matching query.`);
//         res.status(200).json(subjects);

//     } catch (error) {
//         console.error("--- ❌ ERROR searching subjects ---:", error);
//         // Handle specific errors if needed, e.g., if text index doesn't exist
//         if (error.message && error.message.includes('text index required')) {
//              console.error("Text index missing on 'subjects' collection.");
//              return res.status(500).json({ message: "Search failed: Database index configuration error." });
//         }
//         res.status(500).json({ message: "Server error during subject search." });
//     }
// };
// // --- END NEW SEARCH FUNCTION ---

const Subject = require("../models/Subject");
const Student = require("../models/Student");
const Teacher = require('../models/Teacher'); // Import Teacher model
const Attendance = require('../models/attendance'); // Import Attendance model
const Assignment = require('../models/Assignment'); // Import Assignment model
const Submission = require('../models/Submission'); // Import Submission model
const Note = require('../models/Note'); // Import Note model
const mongoose = require('mongoose');

// Helper function to get Teacher's MongoDB ID from Firebase UID
const getTeacherMongoId = async (firebaseUid) => {
    if (!firebaseUid) return null;
    const teacher = await Teacher.findOne({ firebaseUid: firebaseUid }).select('_id');
    return teacher ? teacher._id : null;
};
// Helper function to get Student's MongoDB ID from Firebase UID
const getStudentMongoId = async (firebaseUid) => {
    if (!firebaseUid) return null;
    const student = await Student.findOne({ firebaseUid: firebaseUid }).select('_id');
    return student ? student._id : null;
};


// @desc     Teacher creates a new subject
// @route    POST /api/subjects
// @access   Private (Teacher)
exports.createSubject = async (req, res) => {
    try {
        const { name, code } = req.body;
        const teacherFirebaseUid = req.user.uid; // UID from verifyFirebaseToken

        if (!name || !code) {
            return res.status(400).json({ message: "Please provide a name and code for the subject" });
        }
        if (!teacherFirebaseUid) {
             return res.status(401).json({ message: "Teacher authentication failed." });
        }

        const teacherMongoId = await getTeacherMongoId(teacherFirebaseUid);
        if (!teacherMongoId) {
            console.error(`Teacher not found in DB for firebaseUid: ${teacherFirebaseUid}`);
            return res.status(404).json({ message: "Teacher profile not found in database." });
        }

        const existingSubject = await Subject.findOne({ code });
        if (existingSubject) {
            return res.status(400).json({ message: "A subject with this code already exists" });
        }

        const subject = new Subject({
            name,
            code,
            teacher: teacherMongoId, // Use MongoDB ID
        });
        await subject.save();

        res.status(201).json({ message: "Subject created successfully", subject });
    } catch (err) {
        console.error("Error creating subject:", err);
        res.status(500).json({ message: "Server error while creating subject" });
    }
};

// @desc     Student enrolls in a subject
// @route    POST /api/subjects/enroll
// @access   Private (Student)
exports.enrollStudent = async (req, res) => {
    try {
        const { subjectId } = req.body;
        const studentFirebaseUid = req.user.uid; // UID from verifyFirebaseToken

        if (!studentFirebaseUid) {
             return res.status(401).json({ message: "Student authentication failed." });
        }
       const studentMongoId = await getStudentMongoId(studentFirebaseUid);
        if (!studentMongoId) {
            console.error(`Student not found in DB for firebaseUid: ${studentFirebaseUid}`);
            return res.status(404).json({ message: "Student profile not found in database." });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        const isEnrolled = subject.students.some(id => id.equals(studentMongoId));
        if (isEnrolled) {
            return res.status(400).json({ message: "You are already enrolled in this subject" });
        }

        subject.students.push(studentMongoId); // Add MongoDB ID
        await subject.save();

        res.status(200).json({ message: "Enrolled successfully", subject });
    } catch (err) {
        console.error("Error enrolling in subject:", err);
        res.status(500).json({ message: "Server error while enrolling in subject" });
    }
};

// @desc     Teacher gets all subjects they created
// @route    GET /api/subjects/teacher
// @access   Private (Teacher)
exports.getSubjectsByTeacher = async (req, res) => {
    try {
        const teacherFirebaseUid = req.user.uid;
        if (!teacherFirebaseUid) return res.status(401).json({ message: "Authentication failed." });

        const teacherMongoId = await getTeacherMongoId(teacherFirebaseUid);
        if (!teacherMongoId) return res.status(404).json({ message: "Teacher profile not found." });

        const subjects = await Subject.find({ teacher: teacherMongoId })
                                       .populate("students", "name email"); // Populate student details
        res.status(200).json(subjects);
    } catch (err) {
        console.error("Error fetching teacher's subjects:", err);
        res.status(500).json({ message: "Error fetching subjects" });
    }
};

// @desc     Student gets all subjects they are enrolled in
// @route    GET /api/subjects/student
// @access   Private (Student)
exports.getSubjectsByStudent = async (req, res) => {
     try {
        const studentFirebaseUid = req.user.uid;
        if (!studentFirebaseUid) return res.status(401).json({ message: "Authentication failed." });

        const studentMongoId = await getStudentMongoId(studentFirebaseUid);
        if (!studentMongoId) return res.status(404).json({ message: "Student profile not found." });

        const subjects = await Subject.find({ students: studentMongoId }) // Query using MongoDB ID
                                       .populate("teacher", "name email"); // Populate teacher details
        res.status(200).json(subjects);
    } catch (err) {
        console.error("Error fetching student's subjects:", err);
        res.status(500).json({ message: "Error fetching subjects" });
    }
};

// @desc     Teacher gets all students for a specific subject
// @route    GET /api/subjects/:subjectId/students
// @access   Private (Teacher)
exports.getStudentsBySubject = async (req, res) => {
    try {
        const teacherFirebaseUid = req.user.uid;
        if (!teacherFirebaseUid) return res.status(401).json({ message: "Authentication failed." });

        const teacherMongoId = await getTeacherMongoId(teacherFirebaseUid);
        if (!teacherMongoId) return res.status(404).json({ message: "Teacher profile not found." });

        const subject = await Subject.findById(req.params.subjectId)
                                       .populate("students", "name email _id"); // Populate student details needed
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        if (!subject.teacher.equals(teacherMongoId)) {
            return res.status(403).json({ message: "Not authorized to view students for this subject" });
        }

        res.status(200).json(subject.students);
    } catch (err) {
        console.error("Error fetching students by subject:", err);
        res.status(500).json({ message: "Error fetching students for the subject" });
    }
};

// @desc     Get all subjects (e.g., for a student enrollment list)
// @route    GET /api/subjects
// @access   Private (Authenticated Users)
exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({}).populate("teacher", "name");
        res.status(200).json(subjects);
    } catch (err) {
        console.error("Error fetching all subjects:", err);
        res.status(500).json({ message: "Error fetching all subjects" });
    }
};

// @desc     Get details for a single subject by ID
// @route    GET /api/subjects/:subjectId
// @access   Private (Authenticated users - used by MyAttendance)
exports.getSubjectById = async (req, res) => {
    console.log(`✅ [SUBJECT 1/3] Received request for subject ID: ${req.params.subjectId}`);
    try {
        const subject = await Subject.findById(req.params.subjectId)
                                       .populate('teacher', 'name email')
                                       .populate('students', 'name email');
        console.log("✅ [SUBJECT 2/3] Subject found in DB.");

        if (!subject) {
            console.warn(`Subject not found for ID: ${req.params.subjectId}`);
            return res.status(404).json({ message: 'Subject not found' });
        }

        res.status(200).json(subject);
        console.log("✅ [SUBJECT 3/3] Subject details sent successfully.");
    } catch (error) {
        console.error(`--- ❌ ERROR in getSubjectById for ID: ${req.params.subjectId} ---:`, error);
        if (error instanceof mongoose.Error.CastError) {
             return res.status(400).json({ message: 'Invalid Subject ID format.' });
        }
        res.status(500).json({ message: 'Server error retrieving subject details.' });
    }
};

// @desc     Teacher deletes a subject and related data
// @route    DELETE /api/subjects/:subjectId
// @access   Private (Teacher)
exports.deleteSubject = async (req, res) => {
    console.log(`[DELETE Subject 1/6] Received request to delete subject ID: ${req.params.subjectId}`);
    try {
        const { subjectId } = req.params;
        const firebaseUid = req.user.uid;

        if (!firebaseUid) return res.status(401).json({ message: "Authentication failed." });
        const teacherMongoId = await getTeacherMongoId(firebaseUid);
        if (!teacherMongoId) return res.status(404).json({ message: "Teacher profile not found." });
        console.log(`[DELETE Subject 2/6] Teacher found with ID: ${teacherMongoId}`);

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            console.log(`[DELETE Subject WARN] Subject not found: ${subjectId}`);
            return res.status(404).json({ message: "Subject not found" });
        }
        if (!subject.teacher.equals(teacherMongoId)) {
            console.log(`[DELETE Subject FORBIDDEN] Teacher ${teacherMongoId} does not own subject ${subjectId}`);
            return res.status(403).json({ message: "You are not authorized to delete this subject" });
        }
        console.log(`[DELETE Subject 3/6] Authorization confirmed.`);

        console.log(`[DELETE Subject 4/6] Starting cascading deletes for subject ${subjectId}...`);
        const assignmentsToDelete = await Assignment.find({ subject: subjectId }).select('_id');
        const assignmentIds = assignmentsToDelete.map(a => a._id);

        const deletePromises = [
            Attendance.deleteMany({ subject: subjectId }),
            Assignment.deleteMany({ subject: subjectId }),
            Note.deleteMany({ subject: subjectId }),
            Submission.deleteMany({ $or: [{ subject: subjectId }, { assignment: { $in: assignmentIds } }] })
        ];

        await Promise.all(deletePromises);
        console.log(`[DELETE Subject 5/6] Cascading deletes completed.`);

        await Subject.findByIdAndDelete(subjectId);
        console.log(`[DELETE Subject 6/6] Subject ${subjectId} deleted successfully.`);

        res.status(200).json({ message: "Subject and all associated data deleted successfully" });

    } catch (error) {
        console.error(`--- ❌ ERROR in deleteSubject for ID: ${req.params.subjectId} ---:`, error);
        res.status(500).json({ message: "Server error during subject deletion." });
    }
};


// --- UPDATED SEARCH FUNCTION USING REGEX ---
// @desc     Search for subjects by name or code (case-insensitive, partial match)
// @route    GET /api/subjects/search?q=...
// @access   Private (Authenticated Users)
exports.searchSubjects = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.trim() === '') {
            return res.status(200).json([]);
        }

        console.log(`Searching subjects (regex) for query: "${query}"`);

        // Escape special regex characters in the user input to prevent injection issues
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Create a case-insensitive regex
        const regex = new RegExp(escapedQuery, 'i');

        // Search in 'name' OR 'code' fields
        const subjects = await Subject.find({
            $or: [
                { name: { $regex: regex } },
                { code: { $regex: regex } }
            ]
        })
        .populate('teacher', 'name') // Include teacher name
        .limit(20); // Limit results

        console.log(`Found ${subjects.length} subjects matching regex query.`);
        res.status(200).json(subjects);

    } catch (error) {
        console.error("--- ❌ ERROR searching subjects (regex) ---:", error);
        res.status(500).json({ message: "Server error during subject search." });
    }
};
// --- END UPDATED SEARCH FUNCTION ---
