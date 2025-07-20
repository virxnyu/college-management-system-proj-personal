const mongoose = require("mongoose");

/**
 * Represents an assignment created by a teacher for a specific subject.
 */
const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Assignment title is required."],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
    },
    dueDate: {
        type: Date,
        required: [true, "Due date is required."],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Assignment", assignmentSchema);