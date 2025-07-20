import React, { useState, useEffect } from 'react';
import axios from '../../axios';
import './AtRiskWidget.css';

const AtRiskWidget = ({ subjectId }) => {
    const [atRiskStudents, setAtRiskStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!subjectId) {
            setAtRiskStudents([]);
            setLoading(false);
            return;
        }

        const fetchAtRiskStudents = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get('/attendance/at-risk', {
                    params: { subjectId },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAtRiskStudents(res.data);
            } catch (err) {
                setError('Could not load at-risk students.');
                console.error("Error fetching at-risk students:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAtRiskStudents();
    }, [subjectId]);

    return (
        <div className="at-risk-widget">
            {/* --- THIS LINE IS FIXED --- */}
            <h4>⚠️ At-Risk Students {'(<75%)'}</h4>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : atRiskStudents.length === 0 ? (
                <p className="no-risk-message">No students are currently at risk in this subject.</p>
            ) : (
                <ul className="at-risk-list">
                    {atRiskStudents.map(student => (
                        <li key={student.studentId}>
                            <span className="student-name">{student.studentName}</span>
                            <span className="student-percentage" style={{ color: student.percentage < 50 ? '#e53e3e' : '#ffc107' }}>
                                {student.percentage}%
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AtRiskWidget;
