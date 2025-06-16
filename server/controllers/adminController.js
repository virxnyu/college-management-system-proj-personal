const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({ name, email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: admin._id, role: "admin", email: admin.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({}, "name email");
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({}, "name email");
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// DELETE a student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE a teacher
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByIdAndDelete(id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    res.json({ message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Add Student
const addStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = new Student({ name, email, password: hashedPassword });

    await newStudent.save();
    res.status(201).json({ message: "Student added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Add Teacher
const addTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Teacher.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Teacher already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newTeacher = new Teacher({ name, email, password: hashedPassword });

    await newTeacher.save();
    res.status(201).json({ message: "Teacher added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a student
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: "Error updating student", error: error.message });
  }
};


// Update a teacher
const updateTeacher = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.json(updatedTeacher);
  } catch (error) {
    res.status(500).json({ message: "Error updating teacher", error: error.message });
  }
};



module.exports = {
  registerAdmin,
  loginAdmin,
  getAllStudents,
  getAllTeachers,
  deleteStudent,
  deleteTeacher,
  addStudent,
  addTeacher,
  updateStudent,
  updateTeacher,  
};
// This code defines the adminController for handling admin-related operations in a school management system.
// It includes functions for registering and logging in admins, as well as retrieving lists of students and teachers.
