const Subject = require("../models/Subject");
const Student = require("../models/Student"); // Although not directly used for new instances, it's good practice to keep it for potential future use.

/**
 * @desc    Teacher creates a new subject
 * @route   POST /api/subjects
 * @access  Private (Teacher)
 */
exports.createSubject = async (req, res) => {
  try {
    const { name, code } = req.body;
    const teacherId = req.user.id;

    // Check for missing fields
    if (!name || !code) {
      return res.status(400).json({ message: "Please provide a name and code for the subject" });
    }

    // Check if a subject with the same code already exists
    const existingSubject = await Subject.findOne({ code });
    if (existingSubject) {
      return res.status(400).json({ message: "A subject with this code already exists" });
    }

    // Create and save the new subject
    const subject = new Subject({
      name,
      code,
      teacher: teacherId,
    });
    await subject.save();

    res.status(201).json({ message: "Subject created successfully", subject });
  } catch (err) {
    console.error("Error creating subject:", err);
    res.status(500).json({ message: "Server error while creating subject" });
  }
};

/**
 * @desc    Student enrolls in a subject
 * @route   POST /api/subjects/enroll
 * @access  Private (Student)
 */
exports.enrollStudent = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const studentId = req.user.id;

    // Find the subject
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Check if student is already enrolled
    if (subject.students.includes(studentId)) {
      return res.status(400).json({ message: "You are already enrolled in this subject" });
    }

    // Add student to the subject's student list
    subject.students.push(studentId);
    await subject.save();

    res.status(200).json({ message: "Enrolled successfully", subject });
  } catch (err) {
    console.error("Error enrolling in subject:", err);
    res.status(500).json({ message: "Server error while enrolling in subject" });
  }
};

/**
 * @desc    Teacher gets all subjects they created
 * @route   GET /api/subjects/teacher
 * @access  Private (Teacher)
 */
exports.getSubjectsByTeacher = async (req, res) => {
  try {
    // Find subjects by teacher ID and populate student details
    const subjects = await Subject.find({ teacher: req.user.id }).populate("students", "name email");
    res.status(200).json(subjects);
  } catch (err) {
    console.error("Error fetching teacher's subjects:", err);
    res.status(500).json({ message: "Error fetching subjects" });
  }
};

/**
 * @desc    Student gets all subjects they are enrolled in
 * @route   GET /api/subjects/student
 * @access  Private (Student)
 */
exports.getSubjectsByStudent = async (req, res) => {
  try {
    // Find subjects where the student's ID is in the 'students' array
    const subjects = await Subject.find({ students: req.user.id }).populate("teacher", "name email");
    res.status(200).json(subjects);
  } catch (err) {
    console.error("Error fetching student's subjects:", err);
    res.status(500).json({ message: "Error fetching subjects" });
  }
};

/**
 * @desc    Teacher gets all students for a specific subject
 * @route   GET /api/subjects/:subjectId/students
 * @access  Private (Teacher)
 */
exports.getStudentsBySubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId).populate("students", "name email _id");
    if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
    }

    // Authorization: Ensure the requesting teacher is the owner of the subject
    if (subject.teacher.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to view students for this subject" });
    }
    
    res.status(200).json(subject.students);
  } catch (err) {
    console.error("Error fetching students by subject:", err);
    res.status(500).json({ message: "Error fetching students for the subject" });
  }
};

/**
 * @desc    Get all subjects (e.g., for a student enrollment list)
 * @route   GET /api/subjects
 * @access  Private (Authenticated Users)
 */
exports.getAllSubjects = async (req, res) => {
  try {
    // Find all subjects and populate the teacher's name
    const subjects = await Subject.find({}).populate("teacher", "name");
    res.status(200).json(subjects);
  } catch (err) {
    console.error("Error fetching all subjects:", err);
    res.status(500).json({ message: "Error fetching all subjects" });
  }
};

exports.getSubjectById = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.subjectId).populate('teacher', 'name');
        
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        // Optional: Add authorization logic here if needed in the future
        
        res.status(200).json(subject);
    } catch (error) {
        console.error("Error fetching subject by ID:", error);
        res.status(500).json({ message: "Server error while fetching subject details." });
    }
};
