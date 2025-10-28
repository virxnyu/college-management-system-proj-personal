//brain of the attendance system
//contains all the complex logic, like the bulkUpdatAttendance function that saves the
//whole day's records at once, and the getTeacherAttendanceReport function that calculates
//all the stats for the teacher's view.

//this file is responsible for performing complex operations with the database like
//fetching, creating, calculating data, and then sending a clean, formatted response back to the
//user's browser.
const Attendance = require("../models/attendance");
const Subject = require("../models/Subject");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher"); // Ensure Teacher is imported
const Notification = require("../models/Notification");
const mongoose = require('mongoose');

// --- HELPER FUNCTIONS ---
// Helper function to get Student's MongoDB ID from Firebase UID
const getStudentMongoId = async (firebaseUid) => {
    if (!firebaseUid) return null;
    // No need to re-require Student inside here if it's already required above
    const student = await Student.findOne({ firebaseUid: firebaseUid }).select('_id');
    return student ? student._id : null;
};

// Helper function to get Teacher's MongoDB ID from Firebase UID
const getTeacherMongoId = async (firebaseUid) => {
    if (!firebaseUid) return null;
    const teacher = await Teacher.findOne({ firebaseUid: firebaseUid }).select('_id');
    return teacher ? teacher._id : null;
};
// --- END HELPER FUNCTIONS ---

// --- DEFINE ALL CONTROLLER FUNCTIONS ---

// @desc    Get attendance records for a student in a specific subject
// @route   GET /api/attendance/student/subject/:subjectId
// @access  Private (Student)
const getStudentSubjectDetails = async (req, res) => {
    console.log(`✅ [DETAILS 1/4] Received request for subject details. Subject ID: ${req.params.subjectId}`);
    try {
        const { subjectId } = req.params;
        const firebaseUid = req.user.uid; // Get Firebase UID

        const studentId = await getStudentMongoId(firebaseUid); // Use helper
        if (!studentId) {
            console.error(`Student not found in DB for firebaseUid: ${firebaseUid}`);
            return res.status(404).json({ message: "Student profile not found." });
        }
        console.log(`✅ [DETAILS 2/4] Found student MongoDB ID: ${studentId}`);

        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
             return res.status(400).json({ message: 'Invalid Subject ID format.' });
        }

        console.log(`✅ [DETAILS 3/4] Fetching attendance records...`);
        const records = await Attendance.find({
            student: studentId,
            subject: subjectId
        }).sort({ date: 1 }); // Sort by date ascending

        res.json(records);
        console.log(`✅ [DETAILS 4/4] Sent ${records.length} records successfully.`);
    } catch (error) {
        console.error("--- ❌ ERROR fetching subject details:", error);
        res.status(500).json({ error: "Server error" });
    }
};


// @desc    Teacher bulk updates attendance for a subject on a specific date
// @route   POST /api/attendance/bulk-update
// @access  Private (Teacher)
const bulkUpdateAttendance = async (req, res) => {
    try {
        console.log("✅ [BULK 1/6] Received request for bulk attendance update.");
        const { subjectId, date, attendanceData } = req.body;
        const firebaseUid = req.user.uid; // Get Firebase UID

        if (!subjectId || !date || !Array.isArray(attendanceData)) {
            return res.status(400).json({ message: "Subject ID, date, and attendance data array are required." });
        }
        console.log(`✅ [BULK 2/6] Params validated for subject: ${subjectId} on date: ${date}`);

        const teacherId = await getTeacherMongoId(firebaseUid); // Use helper
        if (!teacherId) {
            console.error(`Teacher not found in DB for firebaseUid: ${firebaseUid}`);
            return res.status(404).json({ message: "Teacher profile not found." });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject || subject.teacher.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "You are not authorized for this subject." });
        }
        console.log(`✅ [BULK 3/6] Teacher authorization confirmed (MongoDB ID: ${teacherId}).`);

        const targetDate = new Date(date + 'T00:00:00.000Z');

        console.log(`✅ [BULK 4/6] Preparing ${attendanceData.length} operations for bulk write.`);
        const operations = attendanceData.map(({ studentId, status }) => ({
            updateOne: {
                filter: { student: studentId, subject: subjectId, date: targetDate },
                update: { $set: { status: status, markedBy: teacherId } },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            const result = await Attendance.bulkWrite(operations);
            console.log("✅ [BULK 5/6] Bulk write operation completed.", result);

            // Create Notifications
            if (attendanceData.length > 0) {
                const formattedDate = new Date(targetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                const studentMongoIds = attendanceData.map(d => d.studentId);

                const notifications = attendanceData.map(({ studentId }) => ({
                    recipient: studentId,
                    recipientModel: 'Student',
                    message: `Your attendance for "${subject.name}" was marked for ${formattedDate}.`,
                    link: `/my-attendance/${subjectId}`
                }));
                try {
                    await Notification.insertMany(notifications, { ordered: false });
                    console.log(`✅ [BULK 5b/6] Created ${notifications.length} notifications.`);
                } catch (notifError) {
                    console.error("--- ⚠️ WARNING: Failed to create some notifications ---:", notifError);
                }
            }
        } else {
            console.log("✅ [BULK 5/6] No operations to perform.");
        }

        res.status(200).json({ message: "Attendance updated successfully." });
        console.log("✅ [BULK 6/6] Success response sent.");

    } catch (error) {
        console.error("--- ❌ ERROR in bulkUpdateAttendance ---:", error);
        res.status(500).json({ message: "Server error during bulk update." });
    }
};

// @desc    Get students with low attendance (< 75%) for a specific subject
// @route   GET /api/attendance/at-risk?subjectId=...
// @access  Private (Teacher)
const getAtRiskStudents = async (req, res) => {
    try {
        const { subjectId } = req.query;
        const firebaseUid = req.user.uid;

        const teacherId = await getTeacherMongoId(firebaseUid); // Use helper
        if (!teacherId) return res.status(404).json({ message: "Teacher profile not found." });

        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
             return res.status(400).json({ message: 'Invalid Subject ID format.' });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject || subject.teacher.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "Not authorized for this subject" });
        }

        // Aggregation pipeline to calculate percentages
        const results = await Attendance.aggregate([
            { $match: { subject: new mongoose.Types.ObjectId(subjectId) } },
            {
                $group: {
                    _id: "$student",
                    totalClasses: { $sum: 1 },
                    attendedClasses: {
                        $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: "students",
                    localField: "_id",
                    foreignField: "_id",
                    as: "studentInfo"
                }
            },
            { $unwind: "$studentInfo" },
            {
                $project: {
                    _id: 0,
                    studentId: "$_id",
                    studentName: "$studentInfo.name",
                    totalClasses: 1,
                    attendedClasses: 1,
                    percentage: {
                        $cond: {
                            if: { $gt: ["$totalClasses", 0] },
                            then: { $round: [{ $multiply: [{ $divide: ["$attendedClasses", "$totalClasses"] }, 100] }, 0] }, // Round percentage
                            else: 100
                        }
                    }
                }
            },
            { $match: { percentage: { $lt: 75 } } },
            { $sort: { percentage: 1 } }
        ]);

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching at-risk students:", error);
        res.status(500).json({ message: "Server error fetching at-risk students." });
    }
};

// @desc    Get comprehensive attendance report for all students in a subject, including status for a specific date
// @route   GET /api/attendance/teacher/comprehensive-report?subjectId=...&date=...
// @access  Private (Teacher)
const getTeacherAttendanceReport = async (req, res) => {
    try {
        const { subjectId, date } = req.query;
        const firebaseUid = req.user.uid;

        const teacherId = await getTeacherMongoId(firebaseUid); // Use helper
        if (!teacherId) return res.status(404).json({ message: "Teacher profile not found." });

         if (!mongoose.Types.ObjectId.isValid(subjectId)) {
             return res.status(400).json({ message: 'Invalid Subject ID format.' });
         }

        const subject = await Subject.findById(subjectId).populate('students', 'name'); // Populate student names here
        if (!subject || subject.teacher.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "You are not authorized for this subject." });
        }

        if (!date) {
            return res.status(400).json({ message: "Date parameter is required." });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
             return res.status(400).json({ message: "Date must be in YYYY-MM-DD format." });
        }

        const targetDate = new Date(date + 'T00:00:00.000Z');
        const targetDateString = date;

        const allRecordsForSubject = await Attendance.find({ subject: subjectId });

        const dailyStatusMap = new Map();
        allRecordsForSubject.forEach(record => {
            if (record.date.toISOString().slice(0, 10) === targetDateString) {
                dailyStatusMap.set(record.student.toString(), record.status);
            }
        });

        const report = subject.students.map(student => {
            if (!student) return null;

            const studentIdStr = student._id.toString();
            const studentRecords = allRecordsForSubject.filter(r => r.student.toString() === studentIdStr);

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
                statusForDay: dailyStatusMap.get(studentIdStr) || 'Not Marked'
            };
        }).filter(item => item !== null);

        res.status(200).json(report);

    } catch (error) {
        console.error("Error fetching comprehensive report:", error);
        res.status(500).json({ message: "Server error while fetching report." });
    }
};


// @desc    Get detailed attendance statistics for a student in a subject
// @route   GET /api/attendance/student/stats/:subjectId
// @access  Private (Student)
const getStudentAttendanceStats = async (req, res) => {
    console.log(`✅ [STATS 1/4] Received request for stats. Subject ID: ${req.params.subjectId}`);
    try {
        const { subjectId } = req.params;
        const firebaseUid = req.user.uid;
        const studentMongoId = await getStudentMongoId(firebaseUid); // Use helper

        if (!studentMongoId) {
            console.error(`Student not found for UID: ${firebaseUid} in stats endpoint`);
            return res.status(404).json({ message: "Student profile not found." });
        }
        console.log(`✅ [STATS 2/4] Found student MongoDB ID: ${studentMongoId}`);

        if (!mongoose.Types.ObjectId.isValid(subjectId)) {
            return res.status(400).json({ message: 'Invalid Subject ID format.' });
        }

        const records = await Attendance.find({
            student: studentMongoId,
            subject: subjectId
        });
        console.log(`✅ [STATS 3/4] Found ${records.length} attendance records.`);

        const total = records.length;
        const attended = records.filter(r => r.status === 'Present').length;
        const currentPercentage = total > 0 ? (attended / total) * 100 : 100;

        let classesNeeded = 0;
        if (total === 0 || currentPercentage >= 75) {
            classesNeeded = 0;
        } else {
            classesNeeded = Math.ceil(3 * total - 4 * attended);
        }

        const missNextQuery = req.query.missNext;
        let futurePercentage = null;
        if (missNextQuery && !isNaN(parseInt(missNextQuery))) {
            const missNext = parseInt(missNextQuery);
            if (missNext >= 0) {
                const futureTotal = total + missNext;
                const futureAttended = attended;
                futurePercentage = futureTotal > 0 ? (futureAttended / futureTotal) * 100 : 100;
            }
        }
        console.log(`✅ [STATS 4/4] Calculations complete.`);

        res.json({
            total,
            attended,
            currentPercentage: parseFloat(currentPercentage.toFixed(2)),
            classesNeeded,
            ...(futurePercentage !== null && { futurePercentage: parseFloat(futurePercentage.toFixed(2)) })
        });

    } catch (error) {
        console.error("--- ❌ ERROR fetching student stats:", error);
        res.status(500).json({ error: "Server error fetching statistics" });
    }
};


// @desc    Get students with consecutive absences for a teacher's subjects
// @route   GET /api/attendance/teacher/consecutive-absences
// @access  Private (Teacher)
const getConsecutiveAbsences = async (req, res) => {
    console.log("✅ [ALERT 1/5] Received request for consecutive absence alerts.");
    try {
        const teacherFirebaseUid = req.user.uid;
        const teacherMongoId = await getTeacherMongoId(teacherFirebaseUid); // Use helper

        if (!teacherMongoId) {
            return res.status(404).json({ message: "Teacher profile not found." });
        }
        console.log(`✅ [ALERT 2/5] Teacher found (MongoDB ID: ${teacherMongoId}).`);

        const consecutiveThreshold = 2;

        const teacherSubjects = await Subject.find({ teacher: teacherMongoId }).select('_id name');
        if (!teacherSubjects || teacherSubjects.length === 0) {
            console.log("✅ [ALERT 3/5] Teacher teaches no subjects. Sending empty alerts.");
            return res.status(200).json([]);
        }
        const teacherSubjectIds = teacherSubjects.map(s => s._id);
        const subjectMap = new Map(teacherSubjects.map(s => [s._id.toString(), s.name]));
        console.log(`✅ [ALERT 3/5] Found ${teacherSubjectIds.length} subjects for this teacher.`);

        const allRecords = await Attendance.find({ subject: { $in: teacherSubjectIds } })
                                    .sort({ student: 1, subject: 1, date: -1 })
                                    .populate('student', 'name');

        console.log(`✅ [ALERT 4/5] Fetched ${allRecords.length} records. Processing alerts...`);

        const alerts = [];
        let currentStudentId = null;
        let currentSubjectId = null;
        let consecutiveAbsences = 0;
        let alreadyAlerted = new Set();

        for (const record of allRecords) {
             if (!record.student) continue;

            const studentIdStr = record.student._id.toString();
            const subjectIdStr = record.subject.toString();
            const alertKey = `${studentIdStr}-${subjectIdStr}`;

            if (studentIdStr !== currentStudentId || subjectIdStr !== currentSubjectId) {
                currentStudentId = studentIdStr;
                currentSubjectId = subjectIdStr;
                consecutiveAbsences = 0;
            }

            if (record.status === 'Absent') {
                consecutiveAbsences++;
            } else {
                consecutiveAbsences = 0;
            }

            if (consecutiveAbsences >= consecutiveThreshold && !alreadyAlerted.has(alertKey)) {
                alerts.push({
                    studentId: record.student._id,
                    studentName: record.student.name,
                    subjectId: record.subject,
                    subjectName: subjectMap.get(subjectIdStr) || 'Unknown Subject',
                    consecutiveAbsences: consecutiveAbsences,
                    lastAbsenceDate: record.date
                });
                alreadyAlerted.add(alertKey);
            }
        }
        console.log(`✅ [ALERT 5/5] Processing complete. Found ${alerts.length} alerts.`);

        res.status(200).json(alerts);

    } catch (error) {
        console.error("--- ❌ ERROR fetching consecutive absence alerts:", error);
        res.status(500).json({ message: "Server error fetching attendance alerts." });
    }
};

// --- END OF FUNCTION DEFINITIONS ---


// --- EXPORTS ---
// Assign all defined functions to module.exports here
module.exports = {
    getStudentSubjectDetails,
    bulkUpdateAttendance,
    getAtRiskStudents,
    getTeacherAttendanceReport,
    getStudentAttendanceStats,
    getConsecutiveAbsences
};

