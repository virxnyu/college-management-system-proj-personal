const Notification = require('../models/Notification');

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private (Student, Teacher)
exports.getNotifications = async (req, res) => {
    try {
        const recipientId = req.user.id;

        const notifications = await Notification.find({ recipient: recipientId })
            .sort({ createdAt: -1 }) // Show newest first
            .limit(20); // Limit to the 20 most recent notifications for performance

        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error while fetching notifications." });
    }
};

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:notificationId/read
// @access  Private (Student, Teacher)
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const recipientId = req.user.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: recipientId }, // Ensure user can only mark their own notifications
            { read: true },
            { new: true } // Return the updated document
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found or you are not authorized." });
        }

        res.status(200).json(notification);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// @desc    Mark all notifications as read for the logged-in user
// @route   PATCH /api/notifications/read-all
// @access  Private (Student, Teacher)
exports.markAllAsRead = async (req, res) => {
    try {
        const recipientId = req.user.id;

        await Notification.updateMany(
            { recipient: recipientId, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ message: "All notifications marked as read." });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Server error." });
    }
};
