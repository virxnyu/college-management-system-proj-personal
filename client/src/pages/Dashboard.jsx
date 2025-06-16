import React from "react";
import { useNavigate } from "react-router-dom";
import StudentDashboard from "../components/student/StudentDashboard";
import TeacherDashboard from "../components/teacher/TeacherDashboard";
import AdminDashboard from "../components/admin/AdminDashboard";

function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  if (!token) {
    return <p>❌ Not authenticated. Please login.</p>;
  }

  const payload = JSON.parse(atob(token.split(".")[1]));
  const role = payload.role;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  let dashboardContent;

  switch (role) {
    case "student":
      dashboardContent = <StudentDashboard />;
      break;
    case "teacher":
      dashboardContent = <TeacherDashboard />;
      break;
    case "admin":
      dashboardContent = <AdminDashboard />;
      break;
    default:
      dashboardContent = <p>❌ Unknown role: {role}</p>;
  }

  return (
    <div>
      {dashboardContent}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
