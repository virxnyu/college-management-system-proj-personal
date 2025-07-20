import React, { useState } from "react";
import axios from "../axios"; // Use the central axios instance
import { useNavigate, Link } from "react-router-dom";
import './Auth.css'; // Use the new shared CSS

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const endpointMap = {
      admin: "/admin/login",
      teacher: "/teacher/login",
      student: "/student/login",
    };

    try {
      const response = await axios.post(endpointMap[role], { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="auth-page">
        <div className="auth-form-container">
            <h2>Welcome Back!</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="student">Login as Student</option>
                        <option value="teacher">Login as Teacher</option>
                        <option value="admin">Login as Admin</option>
                    </select>
                </div>
                <div className="form-group">
                    <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="auth-button">Login</button>
            </form>
            {error && <p className="auth-message error">{error}</p>}
            <p className="switch-auth-link">
                Don't have an account? <Link to="/register">Register Now</Link>
            </p>
        </div>
    </div>
  );
}

export default LoginPage;
