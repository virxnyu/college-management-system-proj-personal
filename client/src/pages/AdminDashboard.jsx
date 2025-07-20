import React, { useEffect, useState } from "react";
import axios from "../axios";
import DashboardHeader from "../components/common/DashboardHeader";
import './AdminDashboard.css'; // Import the new CSS file

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const url = formData.role === "student" ? "/admin/student" : "/admin/teacher";
      await axios.post(url, formData);
      setFormData({ name: "", email: "", password: "", role: "student" });
      fetchData(); // Refresh data after adding
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  const handleDelete = async (id, role) => {
    // Using a simple confirmation dialog. For a more polished app, a custom modal would be better.
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        try {
            const url = role === "student" ? `/admin/student/${id}` : `/admin/teacher/${id}`;
            await axios.delete(url);
            fetchData(); // Refresh data after deleting
        } catch (err) {
            console.error("Error deleting user:", err);
        }
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/admin/student/${editStudent._id}`, { name: editStudent.name, email: editStudent.email });
      setEditStudent(null);
      fetchData();
    } catch (err) {
      console.error("Failed to update student", err);
    }
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/admin/teacher/${editTeacher._id}`, { name: editTeacher.name, email: editTeacher.email });
      setEditTeacher(null);
      fetchData();
    } catch (err) {
      console.error("Failed to update teacher", err);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <DashboardHeader 
        title="Admin Dashboard"
        subtitle="Manage all student and teacher accounts in the system."
      />

      <div className="admin-layout">
        <div className="user-management-section">
          <h3>🎓 Students</h3>
          <ul className="user-list">
            {students.map((s) => (
              <li key={s._id} className="user-item">
                <div className="user-info">
                  <span className="name">{s.name}</span>
                  <span className="email">{s.email}</span>
                </div>
                <div className="user-actions">
                  <button onClick={() => setEditStudent(s)} title="Edit">✏️</button>
                  <button onClick={() => handleDelete(s._id, "student")} title="Delete">🗑️</button>
                </div>
              </li>
            ))}
          </ul>
          {editStudent && (
            <form onSubmit={handleUpdateStudent} className="edit-form">
              <h4>Edit Student</h4>
              <input type="text" value={editStudent.name} onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}/>
              <input type="email" value={editStudent.email} onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })} />
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditStudent(null)}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        <div className="user-management-section">
          <h3>👩‍🏫 Teachers</h3>
          <ul className="user-list">
            {teachers.map((t) => (
              <li key={t._id} className="user-item">
                <div className="user-info">
                  <span className="name">{t.name}</span>
                  <span className="email">{t.email}</span>
                </div>
                <div className="user-actions">
                  <button onClick={() => setEditTeacher(t)} title="Edit">✏️</button>
                  <button onClick={() => handleDelete(t._id, "teacher")} title="Delete">🗑️</button>
                </div>
              </li>
            ))}
          </ul>
           {editTeacher && (
            <form onSubmit={handleUpdateTeacher} className="edit-form">
              <h4>Edit Teacher</h4>
              <input type="text" value={editTeacher.name} onChange={(e) => setEditTeacher({ ...editTeacher, name: e.target.value })}/>
              <input type="email" value={editTeacher.email} onChange={(e) => setEditTeacher({ ...editTeacher, email: e.target.value })} />
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditTeacher(null)}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        <div className="add-user-section">
          <h3>Add New User</h3>
          <form onSubmit={handleAddUser}>
            <div className="form-group"><input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="form-group"><input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
            <div className="form-group"><input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required /></div>
            <div className="form-group"><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}><option value="student">Student</option><option value="teacher">Teacher</option></select></div>
            <button type="submit">Add User</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
