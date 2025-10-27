// server/models/Grade.js
const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
    exam: { // Link to the specific exam
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true,
    },
    student: { // Link to the student who received the grade
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    subject: { // Link to the subject (denormalized for easier querying)
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
    },
    marksObtained: { // Marks the student scored
        type: Number,
        required: true,
        min: 0,
    },
    // Optional: Add a field for teacher feedback later
    // feedback: { type: String },
    markedAt: { // Timestamp when the grade was entered/updated
        type: Date,
        default: Date.now,
    },
});

// Compound index to prevent duplicate grades for the same student/exam
// and allow efficient lookups
gradeSchema.index({ exam: 1, student: 1 }, { unique: true });
// Index for fetching all grades for a student in a subject
gradeSchema.index({ student: 1, subject: 1 });

module.exports = mongoose.model("Grade", gradeSchema);