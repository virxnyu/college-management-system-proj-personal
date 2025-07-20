import React, { useState, useEffect } from 'react';
import axios from '../axios';
import './ViewAttendance.css';

const ViewAttendance = () => {
    const [subjects, setSubjects] = useState([]);
    const [report, setReport] = useState([]);
    
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [subjectName, setSubjectName] = useState('');

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await axios.get("/subjects/teacher");
                setSubjects(res.data);
            } catch (err) {
                setError("Could not fetch your subjects.");
            }
        };
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (!selectedSubject || !selectedDate) {
            setReport([]);
            return;
        }
        const fetchReport = async () => {
            setLoading(true);
            setError('');
            const subject = subjects.find(s => s._id === selectedSubject);
            if (subject) setSubjectName(subject.name);

            try {
                // --- CALL THE NEW ENDPOINT ---
                const res = await axios.get(`/attendance/teacher/comprehensive-report`, {
                    params: { subjectId: selectedSubject, date: selectedDate }
                });
                setReport(res.data);
            } catch (err) {
                setError("Could not fetch the report for this day.");
                setReport([]);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [selectedSubject, selectedDate, subjects]);

    return (
        <div className="view-attendance-container">
            <h1>Comprehensive Attendance Report</h1>
            <div className="controls-container">
                <div className="control-group">
                    <label htmlFor="date-select">Select Date:</label>
                    <input 
                        id="date-select"
                        type="date" 
                        value={selectedDate} 
                        onChange={e => setSelectedDate(e.target.value)} 
                    />
                </div>
                <div className="control-group">
                    <label htmlFor="subject-select">Select Subject:</label>
                    <select id="subject-select" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                        <option value="">-- Choose a Subject --</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            {loading && <p className="loading-message">Loading report...</p>}
            {error && !loading && <p className="message error">{error}</p>}
            
            {!loading && report.length > 0 && (
                <div className="report-table-wrapper">
                    <h3 className="report-header">Report for {subjectName}</h3>
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Attended</th>
                                <th>Missed</th>
                                <th>Percentage</th>
                                <th>Status for {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.map(item => (
                                <tr key={item.studentId}>
                                    <td data-label="Student Name">{item.studentName}</td>
                                    <td data-label="Attended">{item.attended} / {item.total}</td>
                                    <td data-label="Missed">{item.missed}</td>
                                    <td data-label="Percentage">
                                        <span 
                                            className="percentage-badge"
                                            style={{
                                                backgroundColor: item.percentage < 75 ? 'var(--accent-danger)' : 'var(--accent-success)'
                                            }}
                                        >
                                            {item.percentage}%
                                        </span>
                                    </td>
                                    <td className={`status-${item.statusForDay.replace(' ', '-').toLowerCase()}`}>
                                        {item.statusForDay}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ViewAttendance;
