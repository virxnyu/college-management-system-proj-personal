const Teacher = require("../models/Teacher");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Attendance = require("../models/attendance");

const registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Teacher.findOne({ email });
    if (existing) return res.status(400).json({ message: "Teacher already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = new Teacher({ name, email, password: hashedPassword });
    await newTeacher.save();

    res.status(201).json({ message: "Teacher registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: teacher._id, role: "teacher", 
        email: teacher.email }, 
      process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const Student = require("../models/Student"); 

const markAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body;

    // Optional: check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const attendance = new Attendance({
      student: studentId,
      date: new Date(date),
      status,
      markedBy: req.user.id,
    });

    await attendance.save();
    res.status(201).json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error("❌ Attendance marking error:", err.message);
    res.status(500).json({ message: "Server error while marking attendance" });
  }
};

const getAttendanceForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const query = { student: studentId };

const { start, end } = req.query;
if (start && end) {
  query.date = {
    $gte: new Date(start),
    $lte: new Date(end),
  };
}

const records = await Attendance.find(query)
  .populate("student", "name email")
  .populate("markedBy", "name email")
  .sort({ date: -1 });

res.json(records);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getClassAttendanceByDate = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("student", "name email")
      .sort({ date: -1 }); // latest first

    const result = records.map((rec) => ({
      student: rec.student,
      date: rec.date,
      status: rec.status,
      _id: rec._id
    }));

    res.json(result);
  } catch (err) {
    console.error("Fetch attendance error:", err);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
};



module.exports = {
  registerTeacher,
  loginTeacher,
  markAttendance,
  getAttendanceForStudent,
  getClassAttendanceByDate
};
// This code defines the teacherController for handling teacher registration, login, and attendance marking.
// It includes functions to register a new teacher, log in an existing teacher, and mark attendance for students.
