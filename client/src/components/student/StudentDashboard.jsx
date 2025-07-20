import React, { useEffect, useState, useCallback } from "react";
import axios from "../../axios";
import { Link } from "react-router-dom";
import EnrollSubject from './EnrollSubject';
import DashboardHeader from '../common/DashboardHeader';
import './StudentDashboard.css';

// SVG Icon for a book, representing a subject
const SubjectIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="subject-icon">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
);
const AttendanceCard = ({ data }) => {
    const percentage = data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0;
    let progressBarColor = '#38a169';
    if (percentage < 75) progressBarColor = '#ffc107';
    if (percentage < 50) progressBarColor = '#e53e3e';
    const attended = data.attended;
    const total = data.total;
    let safeToMiss = 0;
    if (total > 0 && (attended / total) >= 0.75) {
        safeToMiss = Math.floor((attended / 0.75) - total);
    }
    return (
        <div className="attendance-card">
            <div className="card-header">
                <SubjectIcon />
                <h3 className="subject-name">{data.subjectName || "Unnamed Subject"}</h3>
            </div>
            <div className="card-body">
                <p className="attendance-fraction">Attended: {data.attended} / {data.total} classes</p>
                <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${percentage}%`, backgroundColor: progressBarColor }}></div></div>
                <p className="percentage-text">{percentage}%</p>
                {safeToMiss > 0 && (<p className="safe-to-miss-inline">💡 You can miss the next {safeToMiss} class{safeToMiss > 1 ? 'es' : ''} and stay above 75%.</p>)}
            </div>
            <div className="card-footer">
                <div className="footer-buttons">
                    <Link to={`/my-attendance/${data.subjectId}`} className="details-link">View Details</Link>
                    <Link to={`/subject/${data.subjectId}/notes`} className="notes-link">View Notes</Link>
                </div>
            </div>
        </div>
    );
};


const StudentDashboard = () => {
    const [attendanceSummary, setAttendanceSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- THIS IS THE NEW, MORE ROBUST LOGIC ---
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Fetch BOTH the list of all enrolled subjects AND the attendance data
            const [subjectsRes, attendanceRes] = await Promise.all([
                axios.get("/subjects/student"),
                axios.get("/attendance/student")
            ]);

            const enrolledSubjects = subjectsRes.data;
            const attendanceData = attendanceRes.data;

            // 2. Create a map of the attendance data for easy lookups
            const attendanceMap = new Map(attendanceData.map(item => [item.subjectId, item]));

            // 3. Create the final summary by mapping over the definitive list of ENROLLED subjects
            const summary = enrolledSubjects.map(subject => {
                const attendance = attendanceMap.get(subject._id);
                if (attendance) {
                    // If attendance data exists, use it
                    return attendance;
                } else {
                    // If no attendance data exists (e.g., for a new subject), create a placeholder
                    return {
                        subjectId: subject._id,
                        subjectName: subject.name,
                        attended: 0,
                        total: 0,
                    };
                }
            });

            setAttendanceSummary(summary);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, []); // useCallback ensures this function is stable

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) return <div className="loading-container"><p>Loading Dashboard...</p></div>;

    return (
        <div className="student-dashboard-container">
            <DashboardHeader 
                title="My Dashboard"
                subtitle="Your attendance summary across all enrolled subjects."
            />
            <div className="dashboard-actions">
                <Link to="/my-assignments" className="dashboard-link">
                    📚 My Assignments
                </Link>
                {/* When a student enrolls, we re-run the entire fetch process */}
                <EnrollSubject onEnroll={fetchDashboardData} />
            </div>
            <main className="cards-grid">
                {attendanceSummary.length > 0 ? (
                    attendanceSummary.map((summary) => (
                        <AttendanceCard key={summary.subjectId} data={summary} />
                    ))
                ) : (
                    <div className="no-records-message">
                        <p>You have not enrolled in any subjects yet.</p>
                        <span>Use the "Enroll in a Subject" dropdown to get started.</span>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;
