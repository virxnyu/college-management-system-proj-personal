const express = require('express');
const router = express.Router();

// Import controller functions
const {
    getNotifications,
    markAsRead,
    markAllAsRead
} = require('../controllers/notificationController');

// Import middleware
const verifyToken = require('../middleware/authMiddleware');

// --- All routes in this file are protected and require a valid token ---

// @route   GET /api/notifications
// @desc    Get all notifications for the logged-in user
// @access  Private
router.get('/', verifyToken, getNotifications);

// @route   PATCH /api/notifications/read-all
// @desc    Mark all of the user's notifications as read
// @access  Private
router.patch('/read-all', verifyToken, markAllAsRead);

// @route   PATCH /api/notifications/:notificationId/read
// @desc    Mark a single notification as read
// @access  Private
router.patch('/:notificationId/read', verifyToken, markAsRead);


module.exports = router;
