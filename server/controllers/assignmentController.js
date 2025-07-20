const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Subject = require('../models/Subject');
const Notification = require('../models/Notification'); // --- 1. IMPORT THE NOTIFICATION MODEL ---


// @desc    Teacher creates a new assignment
// @route   POST /api/assignments
// @access  Private (Teacher)
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, dueDate, subjectId } = req.body;
        const teacherId = req.user.id;

        // Validate that the teacher owns the subject
        const subject = await Subject.findById(subjectId);
        if (!subject || subject.teacher.toString() !== teacherId) {
            return res.status(403).json({ message: "You are not authorized to create assignments for this subject." });
        }

        const newAssignment = new Assignment({
            title,
            description,
            dueDate,
            subject: subjectId,
            teacher: teacherId,
        });

        await newAssignment.save();
        res.status(201).json({ message: "Assignment created successfully", assignment: newAssignment });

    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(500).json({ message: "Server error while creating assignment." });
    }
};

// @desc    Get all assignments for a specific subject
// @route   GET /api/assignments/subject/:subjectId
// @access  Private (Teacher, Student)
exports.getAssignmentsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        
        // For students, we also return their submission status for each assignment
        if (req.user.role === 'student') {
            const assignments = await Assignment.find({ subject: subjectId }).sort({ dueDate: 1 }).lean();
            const studentId = req.user.id;

            const assignmentsWithStatus = await Promise.all(assignments.map(async (assignment) => {
                const submission = await Submission.findOne({ assignment: assignment._id, student: studentId });
                return {
                    ...assignment,
                    isSubmitted: !!submission,
                    submittedAt: submission ? submission.submittedAt : null,
                    fileUrl: submission ? submission.fileUrl : null,
                };
            }));
            
            return res.status(200).json(assignmentsWithStatus);
        }

        // For teachers, just return the assignments
        const assignments = await Assignment.find({ subject: subjectId }).sort({ dueDate: 1 });
        res.status(200).json(assignments);

    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ message: "Server error while fetching assignments." });
    }
};

// @desc    Teacher gets all submissions for a specific assignment
// @route   GET /api/assignments/:assignmentId/submissions
// @access  Private (Teacher)
exports.getSubmissionsForAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        // First, verify the teacher owns the assignment
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment || assignment.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to view submissions for this assignment." });
        }

        const submissions = await Submission.find({ assignment: assignmentId })
            .populate('student', 'name email'); // Populate student details

        res.status(200).json(submissions);

    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: "Server error while fetching submissions." });
    }
};


// @desc    Student submits their work for an assignment
// @route   POST /api/assignments/:assignmentId/submit
// @access  Private (Student)

// --- THIS FUNCTION IS NOW UPGRADED ---
// @desc    Student submits their work for an assignment
exports.createSubmission = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const studentId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: "File is required for submission." });
        }
        const fileUrl = req.file.path;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found." });
        }
        if (new Date() > new Date(assignment.dueDate)) {
             return res.status(400).json({ message: "Cannot submit after the due date." });
        }

        const newSubmission = new Submission({
            assignment: assignmentId,
            student: studentId,
            subject: assignment.subject,
            fileUrl: fileUrl,
        });

        await newSubmission.save();

        // --- 2. CREATE A NOTIFICATION FOR THE TEACHER ---
        const studentName = req.user.name || 'A student'; // Get student's name from the user object
        await new Notification({
            recipient: assignment.teacher,
            recipientModel: 'Teacher',
            message: `${studentName} submitted their work for "${assignment.title}".`,
            link: `/assignment/${assignmentId}/submissions`
        }).save();
        // --- END OF NOTIFICATION LOGIC ---

        res.status(201).json({ message: "Submission successful!", submission: newSubmission });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "You have already submitted this assignment." });
        }
        console.error("Error creating submission:", error);
        res.status(500).json({ message: "Server error while creating submission." });
    }
};

// @desc    Get all assignments for all subjects a student is enrolled in
// @route   GET /api/assignments/student/all
// @access  Private (Student)
exports.getStudentDashboardAssignments = async (req, res) => {
    try {
        const studentId = req.user.id;

        const enrolledSubjects = await Subject.find({ students: studentId }).select('_id');
        if (!enrolledSubjects.length) {
            return res.status(200).json([]);
        }
        const subjectIds = enrolledSubjects.map(s => s._id);

        const assignments = await Assignment.find({ subject: { $in: subjectIds } })
            .populate('subject', 'name code')
            .sort({ dueDate: 1 })
            .lean();

        const assignmentsWithStatus = await Promise.all(assignments.map(async (assignment) => {
            const submission = await Submission.findOne({ assignment: assignment._id, student: studentId });
            return {
                ...assignment,
                isSubmitted: !!submission,
                submittedAt: submission ? submission.submittedAt : null,
                fileUrl: submission ? submission.fileUrl : null,
            };
        }));

        res.status(200).json(assignmentsWithStatus);

    } catch (error) {
        console.error("Error fetching student's assignments:", error);
        res.status(500).json({ message: "Server error while fetching assignments." });
    }
};

// @desc    Get details for a single assignment
// @route   GET /api/assignments/:assignmentId
// @access  Private (Teacher or Student)
exports.getAssignmentDetails = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found." });
        }

        // Allow both teacher (owner) and student (if enrolled in subject) to view
        if (req.user.role === 'teacher' && assignment.teacher.toString() !== req.user.id) {
             return res.status(403).json({ message: "Not authorized to view this assignment." });
        }

        res.status(200).json(assignment);
    } catch (error) {
        console.error("Error fetching assignment details:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// @desc    Get all assignments created by the logged-in teacher
// @route   GET /api/assignments/teacher/all
// @access  Private (Teacher)
exports.getTeacherAssignments = async (req, res) => {
    try {
        const teacherId = req.user.id;

        const assignments = await Assignment.find({ teacher: teacherId })
            .populate('subject', 'name code')
            .sort({ createdAt: -1 });

        const assignmentsWithSubmissionCount = await Promise.all(
            assignments.map(async (assignment) => {
                if (!assignment) {
                    return null;
                }
                const submissionCount = await Submission.countDocuments({ assignment: assignment._id });
                return {
                    ...assignment.toObject(),
                    submissionCount,
                };
            })
        );
        
        const finalAssignments = assignmentsWithSubmissionCount.filter(Boolean);

        res.status(200).json(finalAssignments);

    } catch (error) {
        console.error("--- ❌ ERROR in getTeacherAssignments ---:", error);
        res.status(500).json({ message: "Server error while fetching assignments." });
    }
};
