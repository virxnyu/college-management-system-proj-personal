const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 1. STORAGE CONFIGURATION FOR ASSIGNMENT SUBMISSIONS ---
const assignmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'student_submissions',
    // --- THIS IS THE FIX ---
    // 'auto' tells Cloudinary to detect the file type and use the correct URL.
    resource_type: 'auto', 
    public_id: (req, file) => {
        // Create a unique filename to avoid conflicts
        const studentId = req.user.id;
        const assignmentId = req.params.assignmentId;
        const originalName = file.originalname.split('.').slice(0, -1).join('.');
        return `submission-${assignmentId}-${studentId}-${originalName}`;
    }
  },
});

// --- 2. NEW STORAGE CONFIGURATION FOR CLASS NOTES ---
const noteStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'class_notes',
    // --- THIS IS THE FIX ---
    // 'auto' ensures PDFs, MP3s, and MP4s get the correct URL.
    resource_type: 'auto', 
    allowed_formats: ['pdf', 'mp3', 'mp4', 'mpeg', 'jpg', 'png', 'docx'],
    public_id: (req, file) => {
        const subjectId = req.body.subjectId; // Get subjectId from the request body
        const title = req.body.title;
        // Create a clean, URL-friendly filename
        const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
        return `note-${subjectId}-${cleanTitle}-${Date.now()}`;
    }
  },
});


// --- 3. EXPORT TWO SEPARATE MULTER INSTANCES ---
// One for handling assignment uploads
const uploadAssignment = multer({ storage: assignmentStorage });
// Another for handling class note uploads
const uploadNote = multer({ storage: noteStorage });

// Export both so they can be used in different route files
module.exports = {
    uploadAssignment,
    uploadNote
};
