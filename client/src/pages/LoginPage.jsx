import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const endpointMap = {
      admin: "/api/admin/login",
      teacher: "/api/teacher/login",
      student: "/api/student/login",
    };

    try {
      const response = await axios.post(`http://localhost:5000${endpointMap[role]}`, {
        email,
        password,
      });

      setMessage("✅ Login successful!");
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", role);

      navigate("/dashboard");
    } catch (err) {
      setMessage("❌ Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="App">
      <h2>Login Portal</h2>
      <form onSubmit={handleLogin}>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
        <br />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default LoginPage;
