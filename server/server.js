
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const attendanceRoutes = require("./routes/attendanceRoutes");

dotenv.config();

const teacherRoutes = require("./routes/teacherRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(cors());
app.use(express.json());


app.use("/api/student", authRoutes);


app.use("/api/teacher", teacherRoutes);


app.use("/api/admin", adminRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/student", require("./routes/authRoutes"));




const PORT = process.env.PORT || 5000;

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
});
