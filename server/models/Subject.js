const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
  // Add other fields if you have them (like createdAt, etc.)
});

// --- ADD THIS LINE ---
// Create a text index on the name and code fields for efficient searching
subjectSchema.index({ name: 'text', code: 'text' });
// --- END ADD ---

module.exports = mongoose.model("Subject", subjectSchema);
