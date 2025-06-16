const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerStudent = async (req, res) => {
    //async function to handle student registration
  try {
    const { name, email, password } = req.body;
    //extracts the user's input from the http request body

    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists" });
    } //if yes, return a 400 status with an error message

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //hashes the password using bcrypt with a salt rounds of 10

    // Create new student
    const newStudent = new Student({
      name,
      email,
      password: hashedPassword,
    }); //creates a new student object with the provided name, email, and hashed password
    

    await newStudent.save();
    // save student to database

    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// handles student login requests
const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    //extracts the login data

    // checks if student exists
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }


    //compares the entered password with the hashed password in the DB
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate token
    const token = jwt.sign(
  { id: student._id, role: "student", email: student.email },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

    //creates a jwt token containing the student's ID
    //sign it using a secret key(JWT_SECRET) stored in .env
    //the token expires in 1 hour

    //returns the token to the frontend for use in authenticated routes
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const Attendance = require("../models/attendance");

const getOwnAttendance = async (req, res) => {
  try {
    const studentId = req.user.id; // JWT provides this

    const records = await Attendance.find({ student: studentId })
      .populate("markedBy", "name email")
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    console.error("Error fetching own attendance:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getStudentAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user.id; // fetched from JWT

    const records = await Attendance.find({ student: studentId });

    let present = 0, absent = 0, late = 0;
    records.forEach(record => {
      if (record.status === "Present") present++;
      else if (record.status === "Absent") absent++;
      else if (record.status === "Late") late++;
    });

    const total = present + absent + late;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

    res.json({
      name: req.user.email, // Or fetch name from Student model if needed
      present,
      absent,
      late,
      total,
      percentage
    });

  } catch (err) {
    console.error("❌ Error fetching attendance summary:", err);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
};

const getStudentAttendanceTable = async (req, res) => {
  try {
    const studentId = req.user.id; // comes from the token
    const records = await Attendance.find({ student: studentId })
      .sort({ date: -1 })
      .select("date status -_id"); // only return date and status

    res.json(records);
  } catch (err) {
    console.error("❌ Error fetching attendance table:", err.message);
    res.status(500).json({ message: "Server error while fetching attendance table" });
  }
};

const getStudentAttendanceByDateRange = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ message: "Please provide both start and end dates in query." });
    }

    const records = await Attendance.find({
      student: req.user.id,
      date: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    }).sort({ date: 1 });

    const formatted = records.map(record => ({
      date: record.date,
      status: record.status
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//exports these two functions so they can be use in
// your route file(like routes/student.js)
module.exports = { registerStudent, loginStudent, getOwnAttendance,
   getStudentAttendanceSummary,
    getStudentAttendanceTable, 
    getStudentAttendanceByDateRange };
