const mongoose = require("mongoose");

/**
 * Represents a notification for a specific user.
 */
const notificationSchema = new mongoose.Schema({
    // The user who will receive the notification
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel' // Dynamic reference to either Student or Teacher
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['Student', 'Teacher']
    },
    // The main content of the notification
    message: {
        type: String,
        required: true,
    },
    // A URL to navigate to when the notification is clicked (e.g., /my-assignments)
    link: {
        type: String,
    },
    // To track if the user has seen the notification
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// To improve performance, we'll add an index on the recipient and read status
notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
