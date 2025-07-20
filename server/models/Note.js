const mongoose = require("mongoose");

/**
 * Represents a note or resource uploaded by a teacher for a specific subject.
 */
const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Note title is required."],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    fileUrl: {
        type: String,
        required: [true, "A URL to the uploaded file is required."],
    },
    // Storing the file type helps the frontend decide what icon or player to show.
    fileType: {
        type: String, 
        required: true,
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Note", noteSchema);
