// src/components/common/DashboardNavbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardNavbar.css";

const DashboardNavbar = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const goToTodo = () => {
    navigate(`/${role}-todo`);
  };

  const goToAttendance = () => {
    navigate("/my-attendance"); // or `/student-attendance`, if applicable
  };

  return (
    <nav className="dashboard-navbar">
      <div className="nav-title">🎓 {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</div>
      <div className="nav-buttons">
        <button onClick={goToAttendance}>📅 Attendance</button>
        <button onClick={goToTodo}>📝 To-Do</button>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
