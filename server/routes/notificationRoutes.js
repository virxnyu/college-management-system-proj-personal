const express = require("express");
const router = express.Router();
const { 
    getUnreadNotifications, 
    markNotificationAsRead, 
    markAllAsRead 
} = require("../controllers/notificationController");

// --- USE THE NEW FIREBASE MIDDLEWARE ---
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken"); 
// No requireRole needed here as it's specific to the logged-in user

// @route   GET /api/notifications/unread
// @desc    Get all unread notifications for the logged-in user
// @access  Private (Authenticated User)
router.get("/unread", verifyFirebaseToken, getUnreadNotifications); // Use new middleware

// @route   PUT /api/notifications/:notificationId/read
// @desc    Mark a specific notification as read
// @access  Private (Authenticated User)
router.put("/:notificationId/read", verifyFirebaseToken, markNotificationAsRead); // Use new middleware

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read for the logged-in user
// @access  Private (Authenticated User)
router.put("/read-all", verifyFirebaseToken, markAllAsRead); // Use new middleware

module.exports = router;
