import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axios';
import './MyAttendance.css';

const MyAttendance = () => {
    const { subjectId } = useParams();
    const [records, setRecords] = useState([]);
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- NEW: Calculate all statistics from the records ---
    const attended = records.filter(r => r.status === 'Present').length;
    const total = records.length;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
    
    let safeToMiss = 0;
    // Only calculate if their current attendance is at or above 75%
    if (total > 0 && (attended / total) >= 0.75) {
        safeToMiss = Math.floor((attended / 0.75) - total);
    }

    // --- NEW: Calculate current attendance streak ---
    let currentStreak = 0;
    // We iterate backwards from the most recent class
    for (let i = records.length - 1; i >= 0; i--) {
        if (records[i].status === 'Present') {
            currentStreak++;
        } else {
            // Stop counting as soon as we find an absence
            break; 
        }
    }

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const recordsRes = await axios.get(`/attendance/student/subject/${subjectId}`);
                setRecords(recordsRes.data);

                const subjectRes = await axios.get(`/subjects/${subjectId}`);
                setSubject(subjectRes.data);

            } catch (error) {
                console.error("Failed to fetch attendance details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [subjectId]);

    if (loading) return <div className="loading-container"><p>Loading Details...</p></div>;

    return (
        <div className="attendance-details-container">
            <Link to="/dashboard" className="back-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to Dashboard
            </Link>
            <header className="details-header">
                <h2>Attendance Details</h2>
                {subject && <h1>{subject.name}</h1>}
            </header>

            <div className="stats-container">
                <div className="stat-card">
                    <h4>{percentage}%</h4>
                    <p>Overall Attendance</p>
                </div>
                <div className="stat-card">
                    <h4>{attended} / {total}</h4>
                    <p>Classes Attended</p>
                </div>
                {/* --- NEW STREAK CARD --- */}
                <div className="stat-card">
                    <h4> {currentStreak}</h4>
                    <p>Current Streak</p>
                </div>
            </div>
            
            {safeToMiss > 0 && (
                <p className="safe-to-miss-message">
                     You can miss the next {safeToMiss} class{safeToMiss > 1 ? 'es' : ''} and still maintain 75% attendance.
                </p>
            )}
            
            <div className="table-wrapper">
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length > 0 ? records.map(record => (
                            <tr key={record._id}>
                                <td>{new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                <td>
                                    <span className={`status-${record.status.toLowerCase()}`}>
                                        <span className="status-indicator"></span>
                                        {record.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="2" className="no-records-cell">No attendance has been marked for this subject yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MyAttendance;
