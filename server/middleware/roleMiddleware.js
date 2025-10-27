const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin'); // Assuming Admin model exists

// This higher-order function takes the required role(s) as an argument
module.exports = function(requiredRole) {
  // The actual middleware function
  return async (req, res, next) => {
    // Check if verifyFirebaseToken middleware ran successfully and attached user info
    if (!req.user || !req.user.uid) {
      console.error("roleMiddleware: req.user or req.user.uid not found. verifyFirebaseToken might have failed or wasn't used.");
      return res.status(401).json({ message: "Authentication required." });
    }

    const firebaseUid = req.user.uid;
    let userRole = null;
    let userMongoId = null; // Store MongoDB ID if needed by subsequent controllers

    try {
      // Check Student collection
      let user = await Student.findOne({ firebaseUid: firebaseUid }).select('role _id'); // Assuming 'role' field exists
      if (user) {
        // IMPORTANT: Determine role. If Student model has a 'role' field, use user.role. Otherwise, assume 'student'.
        // Let's assume for now the existence implies the role.
        userRole = 'student'; // Make sure this matches how roles are represented (e.g., in JWT or DB)
        userMongoId = user._id;
      } else {
        // Check Teacher collection if not found in Student
        user = await Teacher.findOne({ firebaseUid: firebaseUid }).select('role _id');
        if (user) {
          userRole = 'teacher'; // Make sure this matches
          userMongoId = user._id;
        } else {
            // Check Admin collection if needed
           user = await Admin.findOne({ firebaseUid: firebaseUid }).select('role _id'); // If Admin has firebaseUid
           if (user) {
               userRole = 'admin'; // Make sure this matches
               userMongoId = user._id;
           }
        }
      }

      // --- Important: Attach role and MongoDB ID to req object ---
      req.user = {
          ...req.user, // Keep existing firebase info like uid, email etc.
          role: userRole,
          mongoId: userMongoId // Add the MongoDB ID
      };
      // --- End modification ---


      if (!userRole) {
         console.error(`roleMiddleware: User role not found in DB for firebaseUid: ${firebaseUid}`);
        return res.status(404).json({ message: "User profile or role not found in application database." });
      }

      // Check if the user's role matches the required role
      const hasPermission = Array.isArray(requiredRole)
        ? requiredRole.includes(userRole)
        : userRole === requiredRole;

      if (!hasPermission) {
         console.warn(`roleMiddleware: Access denied. User role '${userRole}' does not match required role '${requiredRole}' for UID ${firebaseUid} accessing ${req.originalUrl}`);
        return res.status(403).json({ message: "Access denied: insufficient permissions." });
      }

      // Role matches, proceed to the next middleware or route handler
      next();

    } catch (error) {
      console.error("--- ❌ ERROR in roleMiddleware ---:", error);
      res.status(500).json({ message: "Server error during role verification." });
    }
  };
};
