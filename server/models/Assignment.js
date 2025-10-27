const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    dueDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    // --- ADD THIS FIELD ---
    submissionCount: { 
        type: Number, 
        default: 0, // Start count at 0
        min: 0      // Ensure count doesn't go below 0
    }
    // --- END ADD ---
});

// Optional: Add index if you frequently query assignments by subject or teacher
// assignmentSchema.index({ subject: 1 });
// assignmentSchema.index({ teacher: 1 });


module.exports = mongoose.model("Assignment", assignmentSchema);
