const Subject = require("../models/Subject");
const Student = require("../models/Student");

// ✅ Teacher creates a subject
exports.createSubject = async (req, res) => {
  try {
    const { name, code } = req.body;
    const teacherId = req.user.id;

    const subject = new Subject({ name, code, teacher: teacherId });
    await subject.save();

    res.status(201).json({ message: "Subject created", subject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating subject" });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    const subject = await Subject.findById(req.body.subjectId);
    console.log("Fetched subject:", subject); // <-- Debug log
    if (!subject) return res.status(404).json({ message: "Subject not found" });

    const studentId = req.user.id;

    if (subject.students.includes(studentId)) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    subject.students.push(studentId);
    await subject.save();

    res.status(200).json({ message: "Enrolled successfully", subject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error enrolling in subject" });
  }
};

// ✅ Teacher: Get all subjects they created
exports.getSubjectsByTeacher = async (req, res) => {
  try {
    const subjects = await Subject.find({ teacher: req.user.id });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching subjects" });
  }
};

// ✅ Student: Get all subjects enrolled in
exports.getSubjectsByStudent = async (req, res) => {
  try {
    const subjects = await Subject.find({ students: req.user.id });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching subjects" });
  }
};

exports.getStudentsBySubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.subjectId).populate("students", "name email _id");
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.json(subject.students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students for subject" });
  }
};

// ✅ Get all subjects (for student enrollment dropdown)
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({});
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all subjects" });
  }
};

