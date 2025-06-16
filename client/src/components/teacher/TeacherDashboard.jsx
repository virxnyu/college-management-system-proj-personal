import React from "react";

function TeacherDashboard() {
  return (
    <div>
      <h2>👩‍🏫 Teacher Dashboard</h2>
      <p>Welcome, teacher! Here's your dashboard.</p>
      <a href="/view-attendance">📄 View Attendance</a>
      <br />
      <a href="/mark-attendance">✅ Mark Attendance</a> 
      <br />
    </div>
  );
}

export default TeacherDashboard;
