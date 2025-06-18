import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { Link } from "react-router-dom";
import DashboardNavbar from "../common/DashboardNavbar";

const StudentDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, marksRes] = await Promise.all([
          axios.get("/attendance/student", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }),

          axios.get("/marks/student", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          })  
        ]);
        setAttendance(attRes.data);
        setMarks(marksRes.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>⏳ Loading student dashboard...</p>;

  return (
  <div>
    <DashboardNavbar role="student" />
    <div className="dashboard-body">
      <h2>📊 Marks</h2>
      <ul>
        {marks.map((subject, idx) => (
          <li key={idx}>{subject.subject}: {subject.score}</li>
        ))}
      </ul>

      <h3>📅 Attendance</h3>
      <Link to="/my-attendance">📘 View My Attendance</Link>
      <br />
<Link to="/student/subject-attendance">📘 View Subject-wise Attendance</Link>
      <ul>
        {attendance.map((entry, idx) => (
          <li key={idx}>{entry.date} - {entry.status}</li>
        ))}
      </ul>
    </div>
  </div>
);
};

export default StudentDashboard;
