import React, { useEffect, useState } from "react";
import axios from "../../axios";

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(true);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [studentRes, teacherRes] = await Promise.all([
          axios.get("/admin/students"),
          axios.get("/admin/teachers"),
        ]);
        setStudents(studentRes.data);
        setTeachers(teacherRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users", err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/admin/register", formData);
      alert("User added!");

      // Refresh data
      const [studentRes, teacherRes] = await Promise.all([
        axios.get("/admin/students"),
        axios.get("/admin/teachers"),
      ]);
      setStudents(studentRes.data);
      setTeachers(teacherRes.data);
    } catch (err) {
      console.error("Error adding user", err);
      alert("Failed to add user");
    }
  };

  const handleDelete = async (id, role) => {
    try {
      await axios.delete(`/admin/${role}/${id}`);
      alert("User deleted!");

      // Refresh data
      const [studentRes, teacherRes] = await Promise.all([
        axios.get("/admin/students"),
        axios.get("/admin/teachers"),
      ]);
      setStudents(studentRes.data);
      setTeachers(teacherRes.data);
    } catch (err) {
      console.error("Error deleting user", err);
      alert("Failed to delete user");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>👩‍💼 Admin - Manage Users</h2>

      <form onSubmit={handleAddUser}>
        <input type="text" name="name" placeholder="Name" onChange={handleInput} required />
        <input type="email" name="email" placeholder="Email" onChange={handleInput} required />
        <input type="password" name="password" placeholder="Password" onChange={handleInput} required />
        <select name="role" onChange={handleInput}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        <button type="submit">➕ Add User</button>
      </form>

      <hr />

      <h3>👨‍🎓 Students</h3>
      <ul>
        {students.map((s) => (
          <li key={s._id}>
            {s.name} ({s.email}){" "}
            <button onClick={() => handleDelete(s._id, "student")}>❌ Delete</button>
          </li>
        ))}
      </ul>

      <h3>👩‍🏫 Teachers</h3>
      <ul>
        {teachers.map((t) => (
          <li key={t._id}>
            {t.name} ({t.email}){" "}
            <button onClick={() => handleDelete(t._id, "teacher")}>❌ Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
