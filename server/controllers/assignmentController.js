const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Subject = require('../models/Subject');
const Student = require('../models/Student'); // Import Student model
const Teacher = require('../models/Teacher'); // Import Teacher model
const Notification = require("../models/Notification");
const mongoose = require('mongoose');

// --- UPDATED to find Teacher by firebaseUid ---
exports.createAssignment = async (req, res) => {
    console.log("✅ [ASSIGN 1/5] Received request to create assignment.");
    try {
        const { title, description, subjectId, dueDate } = req.body;
        const firebaseUid = req.user.uid; // Get Firebase UID

        // Find the Teacher document
        const teacher = await Teacher.findOne({ firebaseUid: firebaseUid });
        if (!teacher) {
            console.error(`Teacher not found in DB for firebaseUid: ${firebaseUid}`);
            return res.status(404).json({ message: "Teacher profile not found." });
        }
        const teacherId = teacher._id; // Get MongoDB ObjectId
        console.log(`✅ [ASSIGN 2/5] Teacher found (MongoDB ID: ${teacherId}).`);

        if (!title || !subjectId || !dueDate) {
            return res.status(400).json({ message: "Title, Subject ID, and Due Date are required." });
        }
        console.log(`✅ [ASSIGN 3/5] Validation passed.`);

        const newAssignment = new Assignment({
            title,
            description,
            subject: subjectId,
            teacher: teacherId, // Use MongoDB ID
            dueDate
        });

        await newAssignment.save();
        console.log(`✅ [ASSIGN 4/5] Assignment saved successfully (ID: ${newAssignment._id}).`);

        res.status(201).json(newAssignment);
        console.log("✅ [ASSIGN 5/5] Success response sent.");

    } catch (error) {
        console.error("--- ❌ ERROR creating assignment ---:", error);
        res.status(500).json({ message: "Server error while creating assignment." });
    }
};

// --- UPDATED (No UID needed directly, uses subjectId) ---
// Gets assignments FOR a specific subject. Could be called by teacher or student.
exports.getAssignmentsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        // Basic check if subjectId is valid format
        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
             return res.status(400).json({ message: 'Invalid Subject ID format.' });
        }
        
        const assignments = await Assignment.find({ subject: subjectId })
            .populate('teacher', 'name') // Show teacher's name
            .sort({ dueDate: 1 }); // Sort by due date ascending

        // Future Enhancement: Could potentially check user role here 
        // and add submission status if the user is a student.
        // For now, just return the assignments.

        res.status(200).json(assignments);
    } catch (error) {
        console.error("Error fetching assignments by subject:", error);
        res.status(500).json({ message: "Server error fetching assignments." });
    }
};

// --- UPDATED to find Teacher by firebaseUid (for authorization) ---
exports.getSubmissionsForAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const firebaseUid = req.user.uid;

        // Find Teacher
        const teacher = await Teacher.findOne({ firebaseUid: firebaseUid });
        if (!teacher) return res.status(404).json({ message: "Teacher profile not found." });
        const teacherId = teacher._id;

        // Find the assignment to check ownership
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found." });
        }
        if (assignment.teacher.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "You are not authorized to view submissions for this assignment." });
        }

        // Find submissions for this assignment
        const submissions = await Submission.find({ assignment: assignmentId })
            .populate('student', 'name email') // Include student details
            .sort({ submittedAt: 1 }); // Sort by submission time

        res.status(200).json(submissions);

    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: "Server error fetching submissions." });
    }
};

// --- UPDATED to find Student/Teacher by firebaseUid ---
exports.createSubmission = async (req, res) => {
    console.log("✅ [SUBMIT 1/7] Received request to create submission.");
    try {
        const { assignmentId } = req.params;
        const firebaseUid = req.user.uid; // Get Firebase UID

        // Find Student
        const student = await Student.findOne({ firebaseUid: firebaseUid });
        if (!student) {
            console.error(`Student not found in DB for firebaseUid: ${firebaseUid}`);
            return res.status(404).json({ message: "Student profile not found." });
        }
        const studentId = student._id; // Get MongoDB ObjectId
        console.log(`✅ [SUBMIT 2/7] Student found (MongoDB ID: ${studentId}).`);

        // Check if file was uploaded by middleware
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }
        const fileUrl = req.file.path; // Get Cloudinary URL from multer middleware
        console.log(`✅ [SUBMIT 3/7] File uploaded successfully. URL: ${fileUrl}`);

        // Find the assignment to check due date and get subject/teacher IDs
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found." });
        }
         console.log(`✅ [SUBMIT 4/7] Assignment found (ID: ${assignment._id}).`);

        // Check if submission is past the due date (optional)
        if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
             console.log("✅ [SUBMIT 4/7] Due date check passed."); // Or handle late submissions if needed
            // return res.status(400).json({ message: "Cannot submit after the due date." });
        } else {
             console.log("✅ [SUBMIT 4/7] Due date check passed.");
        }


        // Check if student is enrolled in the subject (important!)
         const subject = await Subject.findById(assignment.subject);
         if (!subject || !subject.students.includes(studentId)) {
            console.error(`Student ${studentId} is not enrolled in subject ${assignment.subject}`);
            return res.status(403).json({ message: "You are not enrolled in the subject for this assignment." });
         }
          console.log(`✅ [SUBMIT 5/7] Student enrollment verified.`);


        // Create the new submission record in the database
        const newSubmission = new Submission({
            assignment: assignmentId,
            student: studentId, // Use MongoDB ID
            subject: assignment.subject, // Get subject from assignment
            fileUrl: fileUrl,
            // submittedAt is handled by default in the schema
        });
        console.log("✅ [SUBMIT 5/7] New submission object created.");

        await newSubmission.save();
        console.log("✅ [SUBMIT 6/7] Submission saved to database successfully.");

        // Create a notification for the teacher
        if (assignment.teacher) {
             const teacherId = assignment.teacher; // Teacher's MongoDB ID
             const notification = new Notification({
                 recipient: teacherId,
                 recipientModel: 'Teacher',
                 message: `New submission received from ${student.name} for assignment "${assignment.title}".`,
                 link: `/assignment/${assignmentId}/submissions` // Link to view submissions page
             });
             await notification.save();
             console.log(`✅ [SUBMIT 6b/7] Notification created for teacher ${teacherId}.`);
        }


        res.status(201).json({ message: "Submission successful!", submission: newSubmission });
        console.log("✅ [SUBMIT 7/7] Success response sent to browser.");

    } catch (error) {
        // Handle potential duplicate submission error (if unique index exists)
        if (error.code === 11000) {
             console.log(`✅ [SUBMIT FAIL] Duplicate submission attempt detected.`);
            return res.status(400).json({ message: "You have already submitted this assignment." });
        }
        console.error("--- ❌ ERROR in createSubmission ---:", error);
        res.status(500).json({ message: "Server error while creating submission." });
    }
};

// --- UPDATED to find Student by firebaseUid ---
exports.getStudentDashboardAssignments = async (req, res) => {
    console.log("✅ [S-ASSIGN 1/6] Received request for student's assignments.");
    try {
        const firebaseUid = req.user.uid;

        // Find Student
        const student = await Student.findOne({ firebaseUid: firebaseUid });
        if (!student) return res.status(404).json({ message: "Student profile not found." });
        const studentId = student._id;
        console.log(`✅ [S-ASSIGN 2/6] Found student (MongoDB ID: ${studentId}).`);

        // Find subjects student is enrolled in
        const enrolledSubjects = await Subject.find({ students: studentId }).select('_id');
        const enrolledSubjectIds = enrolledSubjects.map(s => s._id);
        console.log(`✅ [S-ASSIGN 3/6] Found ${enrolledSubjectIds.length} enrolled subjects.`);

        if (enrolledSubjectIds.length === 0) {
            return res.status(200).json([]); // Return empty array if not enrolled in any subjects
        }

        // Find assignments for those subjects
        const assignments = await Assignment.find({ subject: { $in: enrolledSubjectIds } })
            .populate('subject', 'name code')
            .sort({ dueDate: 1 }); // Sort by soonest due date
        console.log(`✅ [S-ASSIGN 4/6] Found ${assignments.length} assignments.`);

        // Find existing submissions for this student for these assignments
        const assignmentIds = assignments.map(a => a._id);
        const submissions = await Submission.find({ 
            student: studentId, 
            assignment: { $in: assignmentIds } 
        }).select('assignment submittedAt fileUrl'); // Select only needed fields

        const submissionMap = new Map(submissions.map(sub => [sub.assignment.toString(), sub]));
        console.log(`✅ [S-ASSIGN 5/6] Found ${submissionMap.size} existing submissions.`);

        // Combine assignment data with submission status
        const results = assignments.map(assignment => {
            const submission = submissionMap.get(assignment._id.toString());
            return {
                ...assignment.toObject(), // Convert Mongoose doc to plain object
                submissionStatus: submission ? 'Submitted' : 'Not Submitted',
                submittedAt: submission ? submission.submittedAt : null,
                submissionFileUrl: submission ? submission.fileUrl : null,
            };
        });

        res.status(200).json(results);
         console.log("✅ [S-ASSIGN 6/6] Response sent successfully.");
    } catch (error) {
        console.error("--- ❌ ERROR fetching student dashboard assignments ---:", error);
        res.status(500).json({ message: "Server error fetching assignments." });
    }
};

// --- No change needed (doesn't depend on user directly) ---
exports.getAssignmentDetails = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assignment = await Assignment.findById(assignmentId)
            .populate('subject', 'name code')
            .populate('teacher', 'name');

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found." });
        }
        res.status(200).json(assignment);
    } catch (error) {
        console.error("Error fetching assignment details:", error);
         if (error instanceof mongoose.Error.CastError) {
             return res.status(400).json({ message: 'Invalid Assignment ID format.' });
        }
        res.status(500).json({ message: "Server error fetching assignment details." });
    }
};

// --- UPDATED to find Teacher by firebaseUid ---
exports.getTeacherAssignments = async (req, res) => {
    try {
        console.log("✅ [T-ASSIGN 1/5] Received request for teacher's assignments.");
        const firebaseUid = req.user.uid;

        // Find Teacher
        const teacher = await Teacher.findOne({ firebaseUid: firebaseUid });
        if (!teacher) return res.status(404).json({ message: "Teacher profile not found." });
        const teacherId = teacher._id;
        console.log(`✅ [T-ASSIGN 2/5] Teacher found (MongoDB ID: ${teacherId}).`);


        const assignments = await Assignment.find({ teacher: teacherId })
            .populate('subject', 'name code')
            .sort({ createdAt: -1 });
        console.log(`✅ [T-ASSIGN 3/5] Found ${assignments.length} assignments for this teacher.`);

        console.log("✅ [T-ASSIGN 4/5] Starting to process each assignment to count submissions...");
        const assignmentsWithSubmissionCount = await Promise.all(
            assignments.map(async (assignment, index) => {
                if (!assignment) {
                    console.log(`- [T-ASSIGN WARN] Found a null assignment at index ${index}. Skipping.`);
                    return null;
                }
                
                // console.log(`- [T-ASSIGN 4a] Processing assignment ID: ${assignment._id}`);
                const submissionCount = await Submission.countDocuments({ assignment: assignment._id });
                // console.log(`- [T-ASSIGN 4b] Counted ${submissionCount} submissions for assignment ID: ${assignment._id}`);

                return {
                    ...assignment.toObject(),
                    submissionCount,
                };
            })
        );
        console.log("✅ [T-ASSIGN 5/5] Finished processing all assignments.");
        
        const finalAssignments = assignmentsWithSubmissionCount.filter(Boolean); // Filter out any nulls

        res.status(200).json(finalAssignments);
        console.log("✅ [T-ASSIGN 6/6] Response sent successfully."); // Adjusted step count

    } catch (error) {
        console.error("--- ❌ ERROR in getTeacherAssignments ---:", error);
        res.status(500).json({ message: "Server error while fetching assignments." });
    }
};
