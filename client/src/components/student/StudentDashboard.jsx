import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";


const StudentDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const goToTodo = () => {
  navigate("/student-todo");
};

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
      <h2>🎓 Welcome to Student Dashboard</h2>

      
      <h3>📅 Attendance</h3>
      <Link to="/my-attendance">📘 View My Attendance</Link>
      
      <ul>
        {attendance.map((entry, idx) => (
          <li key={idx}>
            {entry.date} - {entry.status}
          </li>
        ))}
      </ul>

      <h3>📊 Marks</h3>
      <ul>
        {marks.map((subject, idx) => (
          <li key={idx}>
            {subject.subject}: {subject.score}
          </li>
        ))}
      </ul>

      
      <button onClick={goToTodo}>📝 Go to My To-Do List</button>
      <br />
    </div>
    
    

    

  );
  

  
};

export default StudentDashboard;
