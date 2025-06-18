const Attendance = require("../models/attendance");
const Subject = require("../models/Subject");

exports.markAttendance = async (req, res) => {
  try {
    const { studentId, subjectId, status, date } = req.body;
    const teacherId = req.user.id;

    // ✅ Validate subject belongs to this teacher
    const subject = await Subject.findById(subjectId);
    if (!subject || subject.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: "You are not the teacher for this subject" });
    }

    // ✅ Check if student is enrolled
    if (!subject.students.includes(studentId)) {
      return res.status(400).json({ message: "Student not enrolled in this subject" });
    }

    // ✅ Prevent duplicate entry
    const existing = await Attendance.findOne({
      student: studentId,
      subject: subjectId,
      date: new Date(date).toDateString()
    });

    if (existing) {
      return res.status(400).json({ message: "Attendance already marked for this student, subject & date" });
    }

    const attendance = new Attendance({
      student: studentId,
      subject: subjectId,
      date,
      status,
      markedBy: teacherId
    });

    await attendance.save();
    res.status(201).json({ message: "Attendance marked successfully", attendance });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while marking attendance" });
  }
};
