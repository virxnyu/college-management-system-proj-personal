require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');

// --- Firebase Admin SDK Initialization ---
try {
    // Make sure the path to your service account key is correct
    const serviceAccount = require('./config/serviceAccountKey.json'); 
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin SDK Initialized Successfully.");
} catch (error) {
    console.error("❌ ERROR initializing Firebase Admin SDK:", error);
    process.exit(1); // Exit if Firebase Admin fails to initialize
}
// --- End Firebase Admin Initialization ---


const app = express();

// Middleware
app.use(cors()); // Allow requests from your frontend (consider more specific origins for production)
app.use(express.json()); // Parse JSON request bodies

// --- Import Routes ---
// Removed authRoutes import
const adminRoutes = require('./routes/adminRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const noteRoutes = require('./routes/noteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes'); // Keep user routes
// const todoRoutes = require('./routes/todoRoutes'); // Keep if you still use the todo feature
const examRoutes = require('./routes/examRoutes'); 
const gradeRoutes = require('./routes/gradeRoutes'); 
const announcementRoutes = require('./routes/announcementRoutes'); 

// --- Use Routes ---
// Removed app.use for authRoutes
app.use('/api/admin', adminRoutes); // Keep admin routes (might need Firebase update later)
app.use('/api/teacher', teacherRoutes); // Keep teacher routes (might need Firebase update later)
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes); // Use the new user routes for register-details and get-role
// app.use('/api/todos', todoRoutes); // Keep if you still use the todo feature
app.use('/api/exams', examRoutes);
app.use('/api/grades', gradeRoutes); 
app.use('/api/announcements', announcementRoutes); 




// --- Database Connection ---
// Ensure MONGO_URI is set in your .env file
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1); // Exit if DB connection fails
    });

// --- Simple Root Route (Optional) ---
app.get('/', (req, res) => {
    res.send('EduTrack API is running...');
});

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

