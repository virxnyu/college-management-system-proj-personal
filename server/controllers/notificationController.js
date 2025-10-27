const Notification = require('../models/Notification');
const Student = require('../models/Student'); // Import models to find user
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin'); // Assuming Admin model exists
const mongoose = require('mongoose');

// Helper function to find user's MongoDB ID from Firebase UID
// This assumes UIDs are unique across all user types in your DB
const findUserIdByFirebaseUid = async (firebaseUid) => {
    let user = await Student.findOne({ firebaseUid: firebaseUid }).select('_id');
    if (user) return user._id;
    user = await Teacher.findOne({ firebaseUid: firebaseUid }).select('_id');
    if (user) return user._id;
    user = await Admin.findOne({ firebaseUid: firebaseUid }).select('_id'); // Check Admin too if needed
    if (user) return user._id;
    return null; // User not found in any collection
};


// --- UPDATED to find User's MongoDB ID by firebaseUid ---
exports.getUnreadNotifications = async (req, res) => {
    try {
        const firebaseUid = req.user.uid;
        const userId = await findUserIdByFirebaseUid(firebaseUid); // Find MongoDB ID

        if (!userId) {
             console.error(`User not found in DB for firebaseUid: ${firebaseUid} when fetching notifications.`);
            return res.status(404).json({ message: "User profile not found." });
        }

        const notifications = await Notification.find({ 
            recipient: userId, // Query by MongoDB ID
            read: false 
        }).sort({ createdAt: -1 }); // Show newest first

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching unread notifications:", error);
        res.status(500).json({ message: "Server error fetching notifications." });
    }
};

// --- UPDATED to find User's MongoDB ID by firebaseUid for authorization ---
exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const firebaseUid = req.user.uid;
        const userId = await findUserIdByFirebaseUid(firebaseUid); // Find MongoDB ID

        if (!userId) {
            return res.status(404).json({ message: "User profile not found." });
        }
        
         // Basic check if notificationId is valid format
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
             return res.status(400).json({ message: 'Invalid Notification ID format.' });
        }

        const notification = await Notification.findById(notificationId);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found." });
        }

        // Ensure the notification belongs to the logged-in user
        if (notification.recipient.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to modify this notification." });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json(notification);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Server error marking notification as read." });
    }
};

// --- UPDATED to find User's MongoDB ID by firebaseUid ---
exports.markAllAsRead = async (req, res) => {
    try {
        const firebaseUid = req.user.uid;
        const userId = await findUserIdByFirebaseUid(firebaseUid); // Find MongoDB ID

        if (!userId) {
            return res.status(404).json({ message: "User profile not found." });
        }

        await Notification.updateMany(
            { recipient: userId, read: false }, // Find unread notifications for this user
            { $set: { read: true } } // Mark them as read
        );

        res.status(200).json({ message: "All notifications marked as read." });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Server error marking all notifications as read." });
    }
};
