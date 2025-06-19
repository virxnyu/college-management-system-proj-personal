import React from "react";
import CreateSubject from "./CreateSubject";
import TeacherSubjects from "./TeacherSubjects";

function TeacherDashboard() {
  return (
    <div>
      <h2>👩‍🏫 Teacher Dashboard</h2>
      <p>Welcome, teacher! Here's your dashboard.</p>
      <a href="/view-attendance">📄 View Attendance</a>
      <br />
      <a href="/mark-attendance">✅ Mark Attendance</a> 
      <br />
      <CreateSubject onSubjectCreated={(subject) => console.log("New subject created:", subject)} />
      <br />
      <TeacherSubjects />
      <br />
    </div>
  );
}

export default TeacherDashboard;
