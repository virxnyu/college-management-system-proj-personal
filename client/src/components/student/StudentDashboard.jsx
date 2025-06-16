import React, { useEffect, useState } from "react";
import axios from "../../axios";

const StudentDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, marksRes] = await Promise.all([
          axios.get("/student/attendance"),
          axios.get("/student/marks"),
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
    </div>
  );
};

export default StudentDashboard;
