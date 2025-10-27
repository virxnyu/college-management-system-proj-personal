// server/models/Exam.js
const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
    name: { // e.g., "Midterm 1", "Quiz 3"
        type: String,
        required: true,
        trim: true,
    },
    subject: { // Link to the subject this exam belongs to
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
    },
    teacher: { // Link to the teacher who created the exam
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
    },
    totalMarks: { // Maximum marks possible for this exam
        type: Number,
        required: true,
        min: 1,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster lookup of exams by subject
examSchema.index({ subject: 1 });

module.exports = mongoose.model("Exam", examSchema);