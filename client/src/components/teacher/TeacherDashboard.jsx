import React, { useState } from "react";
import { Link } from "react-router-dom"; // --- 1. IMPORT THE LINK COMPONENT ---
import CreateAssignment from './CreateAssignment';
import TeacherAssignments from "./TeacherAssignments";
import TeacherSubjects from './TeacherSubjects';
import CreateSubject from './CreateSubject';
import UploadNote from './UploadNote';
import DashboardHeader from '../common/DashboardHeader';
import './TeacherDashboard.css';

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
    console.log("A new note was uploaded!");
  };

  return (
    <div className="teacher-dashboard-container">
      <DashboardHeader 
        title="Teacher Dashboard"
        subtitle="Manage your subjects, assignments, and student attendance."
      />
      
      {/* --- 2. REPLACE <a> TAGS WITH <Link> COMPONENTS --- */}
      <div className="dashboard-nav-links">
        <Link to="/mark-attendance" className="dashboard-link">✅ Mark Attendance</Link>
        <Link to="/view-attendance" className="dashboard-link">📄 View Reports</Link>
        <Link to="/enter-marks" className="dashboard-link">💯 Enter Marks</Link> 
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
