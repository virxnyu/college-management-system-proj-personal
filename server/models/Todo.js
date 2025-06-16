const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // assuming students are in the User model
    required: true,
  },
  date: {
    type: String, // store in "YYYY-MM-DD" format
    required: true,
  },
  tasks: [
    {
      text: String,
      completed: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = mongoose.model('Todo', todoSchema);
