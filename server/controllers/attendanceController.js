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

// --- UPDATED to find Student by firebaseUid ---
exports.getStudentSubjectDetails = async (req, res) => {
    console.log(`✅ [DETAILS 1/4] Received request for subject details. Subject ID: ${req.params.subjectId}`);
    try {
        const { subjectId } = req.params;
        const firebaseUid = req.user.uid; // Get Firebase UID

        // Find the Student document
        const student = await Student.findOne({ firebaseUid: firebaseUid });
        if (!student) {
            console.error(`Student not found in DB for firebaseUid: ${firebaseUid}`);
            return res.status(404).json({ message: "Student profile not found." });
        }
        const studentId = student._id; // Get MongoDB ObjectId
        console.log(`✅ [DETAILS 2/4] Found student MongoDB ID: ${studentId}`);

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


// --- UPDATED to find Teacher by firebaseUid ---
exports.bulkUpdateAttendance = async (req, res) => {
    try {
        console.log("✅ [BULK 1/6] Received request for bulk attendance update.");
        const { subjectId, date, attendanceData } = req.body;
        const firebaseUid = req.user.uid; // Get Firebase UID

        if (!subjectId || !date || !Array.isArray(attendanceData)) {
            return res.status(400).json({ message: "Subject ID, date, and attendance data array are required." });
        }
        console.log(`✅ [BULK 2/6] Params validated for subject: ${subjectId} on date: ${date}`);

        // Find the Teacher document using the Firebase UID
        const teacher = await Teacher.findOne({ firebaseUid: firebaseUid });
         if (!teacher) {
            console.error(`Teacher not found in DB for firebaseUid: ${firebaseUid}`);
            return res.status(404).json({ message: "Teacher profile not found." });
        }
        const teacherId = teacher._id; // Get the MongoDB ObjectId

        const subject = await Subject.findById(subjectId);
        // Authorization check using MongoDB IDs
        if (!subject || subject.teacher.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "You are not authorized for this subject." });
        }
        console.log(`✅ [BULK 3/6] Teacher authorization confirmed (MongoDB ID: ${teacherId}).`);

        const targetDate = new Date(date + 'T00:00:00.000Z'); // Ensure date is handled as UTC midnight

        console.log(`✅ [BULK 4/6] Preparing ${attendanceData.length} operations for bulk write.`);
        const operations = attendanceData.map(({ studentId, status }) => ({ // Assuming studentId here is MongoDB ID
            updateOne: {
                filter: { student: studentId, subject: subjectId, date: targetDate },
                update: { $set: { status: status, markedBy: teacherId } }, // Use teacher's MongoDB ID
                upsert: true
            }
        }));

        if (operations.length > 0) {
            const result = await Attendance.bulkWrite(operations);
            console.log("✅ [BULK 5/6] Bulk write operation completed.", result);

            // Create Notifications
            if (attendanceData.length > 0) {
                const formattedDate = new Date(targetDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                // Assuming studentId in attendanceData is MongoDB ID
                const studentMongoIds = attendanceData.map(d => d.studentId); 
                // We need recipient UIDs for notifications if using Firebase Cloud Messaging later,
                // but for simple DB notifications, MongoDB IDs are fine if Notification schema uses ref:'Student'/'Teacher'.
                // Let's assume Notification schema uses MongoDB refs for now.
                
                const notifications = attendanceData.map(({ studentId }) => ({
                    recipient: studentId, // Student MongoDB ID
                    recipientModel: 'Student',
                    message: `Your attendance for "${subject.name}" was marked for ${formattedDate}.`,
                    link: `/my-attendance/${subjectId}`
                }));
                 try {
                    await Notification.insertMany(notifications, { ordered: false }); // Use insertMany
                    console.log(`✅ [BULK 5b/6] Created ${notifications.length} notifications.`);
                } catch (notifError) {
                    // Log error but don't fail the whole request if notifications fail
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

// --- UPDATED to find Teacher by firebaseUid ---
exports.getAtRiskStudents = async (req, res) => {
    try {
        const { subjectId } = req.query;
        const firebaseUid = req.user.uid;

        const teacher = await Teacher.findOne({ firebaseUid: firebaseUid });
        if (!teacher) return res.status(404).json({ message: "Teacher profile not found." });
        const teacherId = teacher._id;

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
                $lookup: { // Join with students collection to get names
                    from: "students",
                    localField: "_id",
                    foreignField: "_id",
                    as: "studentInfo"
                }
            },
            { $unwind: "$studentInfo" }, // Deconstruct the studentInfo array
            {
                $project: { // Calculate percentage and reshape output
                    _id: 0,
                    studentId: "$_id",
                    studentName: "$studentInfo.name",
                    totalClasses: 1,
                    attendedClasses: 1,
                    percentage: {
                        $cond: {
                            if: { $gt: ["$totalClasses", 0] },
                            then: { $multiply: [{ $divide: ["$attendedClasses", "$totalClasses"] }, 100] },
                            else: 100 // Avoid division by zero, assume 100% if no classes
                        }
                    }
                }
            },
            { $match: { percentage: { $lt: 75 } } }, // Filter for students below 75%
            { $sort: { percentage: 1 } } // Sort by lowest percentage first
        ]);

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching at-risk students:", error);
        res.status(500).json({ message: "Server error fetching at-risk students." });
    }
};

// --- UPDATED to find Teacher by firebaseUid ---
exports.getTeacherAttendanceReport = async (req, res) => {
    try {
        const { subjectId, date } = req.query;
         const firebaseUid = req.user.uid;

        const teacher = await Teacher.findOne({ firebaseUid: firebaseUid });
        if (!teacher) return res.status(404).json({ message: "Teacher profile not found." });
        const teacherId = teacher._id;

        const subject = await Subject.findById(subjectId).populate('students', 'name');
        if (!subject || subject.teacher.toString() !== teacherId.toString()) {
            return res.status(403).json({ message: "You are not authorized for this subject." });
        }

        if (!date) {
            return res.status(400).json({ message: "Date parameter is required." });
        }

        const targetDate = new Date(date + 'T00:00:00.000Z');
        const targetDateString = date; // Keep the YYYY-MM-DD string

        // Fetch all records *once*
        const allRecords = await Attendance.find({ subject: subjectId });

        // Create a map for daily status
        const dailyStatusMap = new Map();
        allRecords.forEach(record => {
             // Careful date comparison: compare only YYYY-MM-DD part
            if (record.date.toISOString().slice(0, 10) === targetDateString) {
                dailyStatusMap.set(record.student.toString(), record.status);
            }
        });

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

// Removed old getAttendanceGrid and getDailyReport as they are superseded or unused.
