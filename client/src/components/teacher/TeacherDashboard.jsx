import React, { useState } from "react";
import CreateAssignment from './CreateAssignment';
import TeacherAssignments from "./TeacherAssignments";
import TeacherSubjects from './TeacherSubjects';
import CreateSubject from './CreateSubject';
import UploadNote from './UploadNote';
import DashboardHeader from '../common/DashboardHeader';
import './TeacherDashboard.css'; // --- 1. IMPORT THE DEDICATED CSS FILE ---

const TeacherDashboard = () => {
  const [assignmentRefreshTrigger, setAssignmentRefreshTrigger] = useState(0);
  const [subjectRefreshTrigger, setSubjectRefreshTrigger] = useState(0);
  
  const handleAssignmentCreated = () => {
    setAssignmentRefreshTrigger(prev => prev + 1);
  };

  const handleSubjectCreated = () => {
    setSubjectRefreshTrigger(prev => prev + 1);
  };

  const handleNoteUploaded = () => {
    // Kept for future use, like refreshing a notes list
    console.log("A new note was uploaded!");
  };

  return (
    // --- 2. USE CSS CLASSES INSTEAD OF INLINE STYLES ---
    <div className="teacher-dashboard-container">
      <DashboardHeader 
        title="Teacher Dashboard"
        subtitle="Manage your subjects, assignments, and student attendance."
      />
      
      <div className="dashboard-nav-links">
        <a href="/mark-attendance" className="dashboard-link">✅ Mark Attendance</a>
        <a href="/view-attendance" className="dashboard-link">📄 View Reports</a>
      </div>
      
      <div className="teacher-dashboard-layout">
          
          <div className="dashboard-column">
            <CreateSubject onSubjectCreated={handleSubjectCreated} />
            <CreateAssignment onAssignmentCreated={handleAssignmentCreated} />
            <UploadNote onNoteUploaded={handleNoteUploaded} />
          </div>

          <div className="dashboard-column">
            <TeacherSubjects refreshTrigger={subjectRefreshTrigger} />
            <TeacherAssignments refreshTrigger={assignmentRefreshTrigger} />
          </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
