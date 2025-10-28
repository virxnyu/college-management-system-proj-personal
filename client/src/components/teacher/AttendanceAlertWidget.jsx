    import React, { useState, useEffect } from 'react';
    import axios from '../../axios';
    import './AttendanceAlertWidget.css'; // We'll create this CSS file next

    const AttendanceAlertWidget = () => {
        const [alerts, setAlerts] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState('');

        useEffect(() => {
            const fetchAlerts = async () => {
                setLoading(true);
                setError('');
                try {
                    const res = await axios.get('/attendance/teacher/consecutive-absences');
                    setAlerts(res.data);
                } catch (err) {
                    setError('Could not load attendance alerts.');
                    console.error("Error fetching attendance alerts:", err);
                    setAlerts([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchAlerts();

            // Optional: Refresh alerts periodically
            const interval = setInterval(fetchAlerts, 60000 * 5); // Refresh every 5 minutes
            return () => clearInterval(interval);

        }, []);

        return (
            <div className="attendance-alert-widget card"> {/* Re-use card style */}
                <h3 className="widget-title">
                    <span role="img" aria-label="Warning Sign">⚠️</span> Attendance Alerts
                </h3>
                {loading ? (
                    <p className="loading-message">Loading alerts...</p>
                ) : error ? (
                    <p className="message error">{error}</p>
                ) : alerts.length === 0 ? (
                    <p className="no-alerts-message">No students currently flagged for consecutive absences.</p>
                ) : (
                    <ul className="alert-list">
                        {alerts.map(alert => (
                            <li key={`${alert.studentId}-${alert.subjectId}`} className="alert-item">
                                <div className="alert-info">
                                    <span className="student-name">{alert.studentName}</span>
                                    <span className="subject-name">{alert.subjectName}</span>
                                </div>
                                <div className="alert-details">
                                     <span className="absence-count">{alert.consecutiveAbsences} consecutive absences</span>
                                     <span className="last-absent">Last Absent: {new Date(alert.lastAbsenceDate).toLocaleDateString()}</span>
                                     {/* Optional: Link to student's detailed view later */}
                                     {/* <Link to={`/student/${alert.studentId}/attendance/${alert.subjectId}`} className="details-link-alert">View</Link> */}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    export default AttendanceAlertWidget;
    
