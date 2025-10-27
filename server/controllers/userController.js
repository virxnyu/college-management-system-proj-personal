const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin'); // Assuming you might have an Admin model too

// @desc    Save user's name and role after Firebase registration
// @route   POST /api/users/register-details
// @access  Public (implicitly protected by Firebase registration flow)
exports.registerUserDetails = async (req, res) => {
    const { firebaseUid, email, name, role } = req.body;

    console.log("Received request to register details:", { firebaseUid, email, name, role });

    if (!firebaseUid || !email || !name || !role) {
        console.error("Missing required fields for registerUserDetails");
        return res.status(400).json({ message: 'Firebase UID, email, name, and role are required.' });
    }

    try {
        let userExists = false;
        let newUser = null;

        // Check if user already exists in our DB (idempotency check)
        if (role === 'student') {
            userExists = await Student.findOne({ firebaseUid: firebaseUid });
            if (!userExists) {
                 console.log(`Creating new Student record for UID: ${firebaseUid}`);
                newUser = new Student({ firebaseUid, email, name });
            }
        } else if (role === 'teacher') {
            userExists = await Teacher.findOne({ firebaseUid: firebaseUid });
             if (!userExists) {
                 console.log(`Creating new Teacher record for UID: ${firebaseUid}`);
                newUser = new Teacher({ firebaseUid, email, name });
            }
        } else if (role === 'admin') {
            userExists = await Admin.findOne({ firebaseUid: firebaseUid });
             if (!userExists) {
                 console.log(`Creating new Admin record for UID: ${firebaseUid}`);
                newUser = new Admin({ firebaseUid, email, name });
            }
        } else {
             console.error(`Invalid role provided: ${role}`);
            return res.status(400).json({ message: 'Invalid role specified.' });
        }

        if (userExists) {
            console.log(`User details already exist in MongoDB for UID: ${firebaseUid}`);
            // If they already exist, we can just return success
            return res.status(200).json({ message: 'User details already registered.' });
        }

        if (newUser) {
            await newUser.save();
             console.log(`Successfully saved user details to MongoDB for UID: ${firebaseUid}`);
            res.status(201).json({ message: 'User details registered successfully.' });
        } else {
             // Should not happen if logic is correct, but good to handle
             console.error(`Failed to create user object for role: ${role}`);
            res.status(500).json({ message: 'Internal server error during user creation.' });
        }

    } catch (error) {
        console.error('Error in registerUserDetails:', error);
        res.status(500).json({ message: 'Server error saving user details.' });
    }
};


// @desc    Get the user's role (Student/Teacher/Admin) from MongoDB based on Firebase UID
// @route   GET /api/users/get-role
// @access  Private (Needs valid Firebase token)
exports.getUserRole = async (req, res) => {
    // The Firebase UID is attached to req.user by the verifyFirebaseToken middleware
    const firebaseUid = req.user?.uid; // Use optional chaining for safety

     console.log(`Received request to get role for UID: ${firebaseUid}`);

    if (!firebaseUid) {
         console.error("Firebase UID not found in request after token verification.");
        // This should technically not happen if verifyFirebaseToken middleware works correctly
        return res.status(401).json({ message: 'Unauthorized: No user ID found in token.' });
    }

    try {
        let userRole = null;

        // Check each collection for the user's role based on their Firebase UID
        const student = await Student.findOne({ firebaseUid: firebaseUid }).select('firebaseUid'); // Only select necessary field
        if (student) {
            userRole = 'student';
        } else {
            const teacher = await Teacher.findOne({ firebaseUid: firebaseUid }).select('firebaseUid');
            if (teacher) {
                userRole = 'teacher';
            } else {
                 const admin = await Admin.findOne({ firebaseUid: firebaseUid }).select('firebaseUid');
                 if (admin) {
                     userRole = 'admin';
                 }
            }
        }

        if (userRole) {
             console.log(`Found role '${userRole}' for UID: ${firebaseUid}`);
            res.status(200).json({ role: userRole });
        } else {
             console.warn(`Could not find user record in MongoDB for Firebase UID: ${firebaseUid}`);
            // User exists in Firebase Auth but not in our DB (maybe registration failed mid-way?)
            res.status(404).json({ message: 'User profile not found in our system.' });
        }

    } catch (error) {
        console.error('Error in getUserRole:', error);
        res.status(500).json({ message: 'Server error fetching user role.' });
    }
};

