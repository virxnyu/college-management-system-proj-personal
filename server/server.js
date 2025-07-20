const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Route imports
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const todoRoutes = require("./routes/todoRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const noteRoutes = require("./routes/noteRoutes"); // --- 1. IMPORT THE NEW NOTE ROUTES ---
const notificationRoutes = require("./routes/notificationRoutes"); // --- 1. IMPORT THE NEW ROUTES ---


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/student", authRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/notes", noteRoutes); // --- 2. USE THE NEW NOTE ROUTES ---
app.use("/api/notifications", notificationRoutes); // --- 2. USE THE NEW ROUTES ---



app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
