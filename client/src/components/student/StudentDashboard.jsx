import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { Link } from "react-router-dom";
import EnrollSubject from './EnrollSubject';
import DashboardHeader from '../common/DashboardHeader'; // Import the header
import SubjectSearch from './SubjectSearch'; // --- 1. IMPORT THE SEARCH COMPONENT ---
import './StudentDashboard.css';

// SVG Icon for a book, representing a subject
const SubjectIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="subject-icon">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
);

// Card component to display attendance summary for one subject
const AttendanceCard = ({ subjectData }) => {
    // Use default values if attendance data is missing (for newly enrolled subjects)
    const attended = subjectData.attended ?? 0;
    const total = subjectData.total ?? 0;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0; // Show 0% if total is 0

    let progressBarColor = '#38a169'; // Green for >= 75%
    if (percentage < 75 && total > 0) progressBarColor = '#ffc107'; // Yellow for < 75% (only if classes held)
    if (percentage < 50 && total > 0) progressBarColor = '#e53e3e'; // Red for < 50% (only if classes held)

    // Calculate "Safe to Miss"
    let safeToMiss = 0;
    if (total > 0 && (attended / total) >= 0.75) {
        safeToMiss = Math.floor((attended / 0.75) - total);
    }

    return (
        <div className="attendance-card">
            <div className="card-header">
                <SubjectIcon />
                {/* Ensure subjectName is displayed even if attendance isn't marked yet */}
                <h3 className="subject-name">{subjectData.subjectName || "Unnamed Subject"}</h3>
            </div>
            <div className="card-body">
                <p className="attendance-fraction">Attended: {attended} / {total} classes</p>
                <div className="progress-bar-container">
                    <div
                        className="progress-bar"
                        style={{ width: `${percentage}%`, backgroundColor: progressBarColor }}
                    ></div>
                </div>
                <p className="percentage-text">{percentage}%</p>

                {safeToMiss > 0 && (
                    <p className="safe-to-miss-inline">
                        💡 You can miss the next {safeToMiss} class{safeToMiss > 1 ? 'es' : ''} and stay above 75%.
                    </p>
                )}
                 {total === 0 && ( // Message for subjects with no attendance marked yet
                    <p className="no-attendance-yet">No attendance marked yet.</p>
                 )}
            </div>
            <div className="card-footer">
                <div className="footer-buttons">
                    <Link to={`/my-attendance/${subjectData.subjectId}`} className="details-link">
                        View Attendance {/* Changed from View Details */}
                    </Link>
                    <Link to={`/subject/${subjectData.subjectId}/notes`} className="notes-link">
                        View Notes
                    </Link>
                    <Link to={`/subject/${subjectData.subjectId}/marks`} className="marks-link">
                        View Marks
                    </Link>
                    {/* --- ADDED: View Announcements Button --- */}
                    <Link to={`/subject/${subjectData.subjectId}/announcements`} className="announcement-link">
                        View Announcements
                    </Link>
                    {/* --- END ADDED --- */}
                </div>
            </div>
        </div>
    );
};


// Main Student Dashboard Component
const StudentDashboard = () => {
    const [enrolledSubjects, setEnrolledSubjects] = useState([]);
    const [attendanceSummary, setAttendanceSummary] = useState({}); // Store summary as an object { subjectId: data }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- NEW LOGIC: Fetch enrolled subjects first, then attendance summary ---
    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            // 1. Fetch all subjects the student is enrolled in
            console.log("Fetching enrolled subjects...");
            const subjectsRes = await axios.get("/subjects/student");
            setEnrolledSubjects(subjectsRes.data || []); // Ensure it's always an array
            console.log("Enrolled subjects fetched:", subjectsRes.data);

            // 2. Fetch the attendance summary (which only includes subjects with attendance)
            console.log("Fetching attendance summary...");
            const summaryRes = await axios.get("/attendance/student");
             // Convert summary array into an object keyed by subjectId for easy lookup
            const summaryMap = (summaryRes.data || []).reduce((acc, curr) => {
                acc[curr.subjectId] = curr;
                return acc;
            }, {});
            setAttendanceSummary(summaryMap);
            console.log("Attendance summary fetched and mapped:", summaryMap);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setError('Failed to load dashboard data. Please try again.');
            setEnrolledSubjects([]);
            setAttendanceSummary({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); // Fetch data on initial component mount

    if (loading) return <div className="loading-container"><p>Loading Dashboard...</p></div>;

    return (
        <div className="student-dashboard-container">
            <DashboardHeader
                title="My Dashboard"
                subtitle="Your subjects, attendance, assignments, and notes."
            />

             {error && <p className="dashboard-error message error">{error}</p>}

            {/* --- Action Bar for Enroll & Search --- */}
            <div className="dashboard-actions">
                <SubjectSearch />
                <EnrollSubject onEnroll={fetchData} /> {/* Refresh data after enrollment */}
                {/* --- ADDED: Link to general Assignments page --- */}
                <Link to="/my-assignments" className="dashboard-link">
                    📚 View My Assignments
                </Link>
                {/* --- END ADDED --- */}
            </div>
            {/* --- End Action Bar --- */}


            <main className="cards-grid">
                {enrolledSubjects.length > 0 ? (
                    enrolledSubjects.map((subject) => {
                        // Combine subject info with attendance data (if available)
                        const summaryData = attendanceSummary[subject._id] || { total: 0, attended: 0 };
                        const cardData = {
                            subjectId: subject._id,
                            subjectName: subject.name,
                            attended: summaryData.attended,
                            total: summaryData.total
                        };
                        return <AttendanceCard key={subject._id} subjectData={cardData} />;
                    })
                ) : !loading && !error ? ( // Only show 'no subjects' if not loading and no error occurred
                    <div className="no-records-message full-width-message">
                        <p>You are not enrolled in any subjects yet.</p>
                        <span>Use the "Enroll in a Subject" section above to join a class.</span>
                    </div>
                ): null /* Don't show anything while loading or if there was an error */}
            </main>
        </div>
    );
};

export default StudentDashboard;
