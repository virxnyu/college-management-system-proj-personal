import React, { useEffect, useState } from "react";
import axios from "../axios";

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [editStudent, setEditStudent] = useState(null);
  const [editTeacher, setEditTeacher] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, teachersRes] = await Promise.all([
        axios.get("/admin/students"),
        axios.get("/admin/teachers"),
      ]);
      setStudents(studentsRes.data);
      setTeachers(teachersRes.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      if (formData.role === "student") {
        await axios.post("/admin/student", formData);
      } else {
        await axios.post("/admin/teacher", formData);
      }
      setFormData({ name: "", email: "", password: "", role: "student" });
      fetchData();
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  const handleDelete = async (id, role) => {
    try {
      const url = role === "student" ? `/admin/student/${id}` : `/admin/teacher/${id}`;
      await axios.delete(url);
      fetchData();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // EDIT STUDENT
  const handleEditStudent = (student) => {
    setEditStudent(student);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/admin/student/${editStudent._id}`, editStudent);
      setStudents((prev) =>
        prev.map((s) => (s._id === res.data._id ? res.data : s))
      );
      setEditStudent(null);
    } catch (err) {
      console.error("Failed to update student", err);
    }
  };

  // EDIT TEACHER
  const handleEditTeacher = (teacher) => {
    setEditTeacher(teacher);
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/admin/teacher/${editTeacher._id}`, editTeacher);
      setTeachers((prev) =>
        prev.map((t) => (t._id === res.data._id ? res.data : t))
      );
      setEditTeacher(null);
    } catch (err) {
      console.error("Failed to update teacher", err);
    }
  };

  return (
    <div>
      <h2>🛠 Admin Dashboard</h2>

      {/* Form to Add New User */}
      <form onSubmit={handleAddUser}>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        <button type="submit">Add User</button>
      </form>

      {/* STUDENTS LIST */}
      <h3>🎓 Students</h3>
      <ul>
        {students.map((s) => (
          <li key={s._id}>
            {s.name} ({s.email})
            <button onClick={() => handleEditStudent(s)}>✏️ Edit</button>
            <button onClick={() => handleDelete(s._id, "student")}>🗑 Delete</button>
          </li>
        ))}
      </ul>

      {/* Student Edit Form */}
      {editStudent && (
        <form onSubmit={handleUpdateStudent}>
          <input
            type="text"
            value={editStudent.name}
            onChange={(e) =>
              setEditStudent({ ...editStudent, name: e.target.value })
            }
          />
          <input
            type="email"
            value={editStudent.email}
            onChange={(e) =>
              setEditStudent({ ...editStudent, email: e.target.value })
            }
          />
          <button type="submit">💾 Save</button>
          <button type="button" onClick={() => setEditStudent(null)}>❌ Cancel</button>
        </form>
      )}

      {/* TEACHERS LIST */}
      <h3>👩‍🏫 Teachers</h3>
      <ul>
        {teachers.map((t) => (
          <li key={t._id}>
            {t.name} ({t.email})
            <button onClick={() => handleEditTeacher(t)}>✏️ Edit</button>
            <button onClick={() => handleDelete(t._id, "teacher")}>🗑 Delete</button>
          </li>
        ))}
      </ul>

      {/* Teacher Edit Form */}
      {editTeacher && (
        <form onSubmit={handleUpdateTeacher}>
          <input
            type="text"
            value={editTeacher.name}
            onChange={(e) =>
              setEditTeacher({ ...editTeacher, name: e.target.value })
            }
          />
          <input
            type="email"
            value={editTeacher.email}
            onChange={(e) =>
              setEditTeacher({ ...editTeacher, email: e.target.value })
            }
          />
          <button type="submit">💾 Save</button>
          <button type="button" onClick={() => setEditTeacher(null)}>❌ Cancel</button>
        </form>
      )}
    </div>
  );
};

export default AdminDashboard;
