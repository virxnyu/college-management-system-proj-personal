const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin, getAllStudents, getAllTeachers, deleteStudent, deleteTeacher, addStudent, addTeacher } = require("../controllers/adminController");
const verifyToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

router.get("/dashboard", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  res.json({ message: `Welcome Admin ${req.user.email}` });
});


router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

//protected routes
router.get("/students", verifyToken, requireRole("admin"), getAllStudents);
router.get("/teachers", verifyToken, requireRole("admin"), getAllTeachers);

// DELETE /api/admin/student/:id
router.delete("/student/:id", verifyToken, requireRole("admin"), deleteStudent);

// DELETE /api/admin/teacher/:id
router.delete("/teacher/:id", verifyToken, requireRole("admin"), deleteTeacher);


// Add Student
router.post("/student", verifyToken, requireRole("admin"), addStudent);

// Add Teacher
router.post("/teacher", verifyToken, requireRole("admin"), addTeacher);

module.exports = router;
