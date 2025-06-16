const Attendance = require("../models/attendance");

exports.markAttendance = async (req, res) => {
  try {
    const { studentId, status, date } = req.body;

    // Prevent duplicate entries for the same student on the same date
    const existing = await Attendance.findOne({
      student: studentId,
      date: new Date(date).toDateString()
    });

    if (existing) {
      return res.status(400).json({ message: "Attendance already marked for this date" });
    }

    const attendance = new Attendance({
      student: studentId,
      status,
      date,
      markedBy: req.user.id // teacher's id from JWT
    });

    await attendance.save();
    res.status(201).json({ message: "Attendance marked successfully", attendance });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while marking attendance" });
  }
};
