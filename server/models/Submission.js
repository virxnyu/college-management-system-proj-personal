const mongoose = require("mongoose");

/**
 * Represents a student's submission for a specific assignment.
 */
const submissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    // IMPORTANT: We store the URL to the file, not the file itself.
    // This URL will come from a cloud storage service like Cloudinary or AWS S3.
    fileUrl: {
        type: String,
        required: [true, "A URL to the submitted file is required."],
    },
    // This can be used later to implement a grading feature.
    grade: {
        type: String,
        trim: true,
    },
});

// To prevent a student from submitting the same assignment twice,
// we create a compound index that ensures the combination of student and assignment is unique.
submissionSchema.index({ student: 1, assignment: 1 }, { unique: true });


module.exports = mongoose.model("Submission", submissionSchema);