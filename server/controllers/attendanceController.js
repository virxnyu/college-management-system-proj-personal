const Attendance = require("../models/attendance");
const Subject = require("../models/Subject");
const Student = require("../models/Student");
import Notification from "../models/Notification.js";
const mongoose = require('mongoose');

// @desc    Get detailed attendance for a single subject (for student)
exports.getStudentSubjectDetails = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const studentId = req.user.id;

    const records = await Attendance.find({
      student: studentId,
      subject: subjectId
    }).sort({ date: 1 }); // Sort by date ascending

    res.json(records);
  } catch (error) {
    console.error("Error fetching subject details:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get attendance report for a specific day (for teacher)
exports.getDailyReport = async (req, res) => {
  try {
    const { subjectId, date } = req.query;
    const teacherId = req.user.id;

    const subject = await Subject.findById(subjectId).populate('students', 'name');
    if (!subject || subject.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: "You are not authorized for this subject" });
    }

    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
    
    const attendanceRecords = await Attendance.find({
        subject: subjectId,
        date: { $gte: startOfDay, $lte: endOfDay }
    });

    const attendanceMap = new Map();
    attendanceRecords.forEach(rec => {
        attendanceMap.set(rec.student.toString(), rec.status);
    });

    const report = subject.students.map(student => ({
        _id: student._id,
        name: student.name,
        status: attendanceMap.get(student._id.toString()) || "Not Marked"
    }));

    res.json(report);
  } catch (error) {
    console.error("Error fetching daily report:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get all attendance data for a subject in a grid format
exports.getAttendanceGrid = async (req, res) => { /* ... code for this function ... */ };

// @desc    Get a list of students with attendance below 75% for a subject
exports.getAtRiskStudents = async (req, res) => { /* ... code for this function ... */ };


// --- UPDATED FUNCTION WITH DEBUG LOGS ---
// @desc    Update or create attendance records for multiple students on a single day
// @route   POST /api/attendance/bulk-update
// @access  Private (Teacher)
// --- THIS FUNCTION IS NOW UPGRADED WITH NOTIFICATION LOGIC ---
// @desc    Update or create attendance records for multiple students on a single day
// @route   POST /api/attendance/bulk-update
// @access  Private (Teacher)
exports.bulkUpdateAttendance = async (req, res) => {
    try {
        const { subjectId, date, attendanceData } = req.body;
        const teacherId = req.user.id;

        if (!subjectId || !date || !Array.isArray(attendanceData)) {
            return res.status(400).json({ message: "Subject ID, date, and attendance data array are required." });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject || subject.teacher.toString() !== teacherId) {
            return res.status(403).json({ message: "You are not authorized for this subject." });
        }

        const targetDate = new Date(date + 'T00:00:00.000Z');

        const operations = attendanceData.map(({ studentId, status }) => ({
            updateOne: {
                filter: { student: studentId, subject: subjectId, date: targetDate },
                update: { $set: { status: status, markedBy: teacherId } },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await Attendance.bulkWrite(operations);
        }

        // --- 2. CREATE NOTIFICATIONS FOR ALL AFFECTED STUDENTS ---
        if (attendanceData.length > 0) {
            const formattedDate = new Date(targetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            const notifications = attendanceData.map(({ studentId }) => ({
                recipient: studentId,
                recipientModel: 'Student',
                message: `Your attendance for "${subject.name}" was marked for ${formattedDate}.`,
                link: `/my-attendance/${subjectId}`
            }));
            // Use insertMany for high efficiency
            await Notification.insertMany(notifications);
        }
        // --- END OF NOTIFICATION LOGIC ---

        res.status(200).json({ message: "Attendance updated successfully." });

    } catch (error) {
        console.error("--- ❌ ERROR in bulkUpdateAttendance ---:", error);
        res.status(500).json({ message: "Server error during bulk update." });
    }
};

// --- NEW POWERFUL FUNCTION FOR TEACHER'S REPORT ---
// @desc    Get a comprehensive attendance report for a subject, including overall stats and daily status
// @route   GET /api/attendance/teacher/comprehensive-report?subjectId=...&date=...
// @access  Private (Teacher)
exports.getTeacherAttendanceReport = async (req, res) => {
    try {
        const { subjectId, date } = req.query;
        const teacherId = req.user.id;

        // 1. Validate input and authorization
        const subject = await Subject.findById(subjectId).populate('students', 'name');
        if (!subject || subject.teacher.toString() !== teacherId) {
            return res.status(403).json({ message: "You are not authorized for this subject." });
        }

        const targetDate = new Date(date + 'T00:00:00.000Z');
        
        // 2. Get all attendance records for the subject to calculate overall stats
        const allRecords = await Attendance.find({ subject: subjectId });

        // 3. Get attendance records just for the selected date
        const dailyRecords = allRecords.filter(record => 
            record.date.toISOString().slice(0, 10) === date
        );
        const dailyStatusMap = new Map(dailyRecords.map(r => [r.student.toString(), r.status]));

        // 4. Calculate overall stats for each student enrolled in the subject
        const report = subject.students.map(student => {
            const studentId = student._id.toString();
            const studentRecords = allRecords.filter(r => r.student.toString() === studentId);
            
            const totalClasses = studentRecords.length;
            const attendedClasses = studentRecords.filter(r => r.status === 'Present').length;
            const missedClasses = totalClasses - attendedClasses;
            const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 100;

            return {
                studentId: student._id,
                studentName: student.name,
                attended: attendedClasses,
                missed: missedClasses,
                total: totalClasses,
                percentage: percentage,
                statusForDay: dailyStatusMap.get(studentId) || 'Not Marked'
            };
        });

        res.status(200).json(report);

    } catch (error) {
        console.error("Error fetching comprehensive report:", error);
        res.status(500).json({ message: "Server error while fetching report." });
    }
};
