const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin'); // Assuming Admin model exists

// This higher-order function takes the required role(s) as an argument
module.exports = function(requiredRole) {
    // The actual middleware function
    return async (req, res, next) => {
        // Check if verifyFirebaseToken middleware ran successfully and attached user info
        if (!req.user || !req.user.uid) {
            console.error("[roleMiddleware] ERROR: req.user or req.user.uid not found. verifyFirebaseToken might have failed or wasn't used.");
            return res.status(401).json({ message: "Authentication required (Firebase UID missing)." });
        }

        const firebaseUid = req.user.uid;
        let userRole = null;
        let userMongoId = null; // Store MongoDB ID if needed by subsequent controllers

        console.log(`[roleMiddleware] Verifying role for Firebase UID: ${firebaseUid}`); // Log UID

        try {
            // Check Student collection
            console.log(`[roleMiddleware] Checking Student collection for UID: ${firebaseUid}...`);
            let user = await Student.findOne({ firebaseUid: firebaseUid }).select('role _id'); // Assuming 'role' field exists, select _id
            if (user) {
                console.log(`[roleMiddleware] Found user in Student collection. MongoDB ID: ${user._id}`);
                userRole = 'student'; // Make sure this matches how roles are represented
                userMongoId = user._id;
            } else {
                console.log(`[roleMiddleware] Not found in Student collection. Checking Teacher...`);
                // Check Teacher collection if not found in Student
                user = await Teacher.findOne({ firebaseUid: firebaseUid }).select('role _id');
                if (user) {
                    console.log(`[roleMiddleware] Found user in Teacher collection. MongoDB ID: ${user._id}`);
                    userRole = 'teacher'; // Make sure this matches
                    userMongoId = user._id;
                } else {
                    console.log(`[roleMiddleware] Not found in Teacher collection. Checking Admin...`);
                    // Check Admin collection if needed
                   user = await Admin.findOne({ firebaseUid: firebaseUid }).select('role _id'); // If Admin has firebaseUid
                   if (user) {
                       console.log(`[roleMiddleware] Found user in Admin collection. MongoDB ID: ${user._id}`);
                       userRole = 'admin'; // Make sure this matches
                       userMongoId = user._id;
                   } else {
                       console.log(`[roleMiddleware] User with UID ${firebaseUid} not found in any collection.`);
                   }
                }
            }

            // --- Attach role and MongoDB ID to req object ---
            req.user = {
                ...req.user, // Keep existing firebase info like uid, email etc.
                role: userRole,
                mongoId: userMongoId // Add the MongoDB ID
            };
            // --- End modification ---

            // Check if a role was actually found in the DB
            if (!userRole || !userMongoId) {
                console.error(`[roleMiddleware] User role OR mongoId not determined for firebaseUid: ${firebaseUid}. Role found: ${userRole}, MongoId found: ${userMongoId}`);
                // Sending 404 because the user's corresponding profile is missing in *our* DB
                return res.status(404).json({ message: "User profile or role not found in application database." });
            }

            console.log(`[roleMiddleware] Determined Role: ${userRole}, MongoId: ${userMongoId}. Required Role: ${requiredRole}`);

            // Check if the user's role matches the required role
            const hasPermission = Array.isArray(requiredRole)
                ? requiredRole.includes(userRole)
                : userRole === requiredRole;

            if (!hasPermission) {
                console.warn(`[roleMiddleware] Access denied. User role '${userRole}' does not match required role '${requiredRole}' for UID ${firebaseUid} accessing ${req.originalUrl}`);
                return res.status(403).json({ message: "Access denied: insufficient permissions." });
            }

            // Role matches, proceed to the next middleware or route handler
            console.log(`[roleMiddleware] Authorization successful. Proceeding...`);
            next();

        } catch (error) {
            console.error("--- ❌ ERROR in roleMiddleware ---:", error);
            res.status(500).json({ message: "Server error during role verification." });
        }
    };
};
