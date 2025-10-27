const express = require("express");
const router = express.Router();
const { registerUserDetails, getUserRole } = require("../controllers/userController"); // Import both functions
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken'); // We will create this middleware next!

// @route   POST /api/users/register-details
// @desc    Save user's name and role after Firebase registration
// @access  Public (implicitly protected by Firebase registration flow, no extra token needed here)
router.post("/register-details", registerUserDetails);

// @route   GET /api/users/get-role
// @desc    Get the user's role (Student/Teacher/Admin) from MongoDB based on Firebase UID
// @access  Private (Needs valid Firebase token)
// Note: We use verifyFirebaseToken middleware here to get the UID from the token
router.get("/get-role", verifyFirebaseToken, getUserRole);

module.exports = router;
