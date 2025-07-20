import React, { useState, useEffect } from 'react';
import axios from '../axios';
import './MarkAttendance.css'; // We will create this next

const MarkAttendance = () => {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
    
    const [attendance, setAttendance] = useState({}); // Stores { studentId: 'Present'/'Absent' }
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Fetch teacher's subjects on initial load
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

    // Fetch students when a subject is selected
    useEffect(() => {
        if (!selectedSubject) {
            setStudents([]);
            setAttendance({});
            return;
        }
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/subjects/${selectedSubject}/students`);
                setStudents(res.data);
                // Initialize attendance state for the new list of students
                const initialAttendance = {};
                res.data.forEach(student => {
                    initialAttendance[student._id] = 'Present'; // Default to Present
                });
                setAttendance(initialAttendance);
            } catch (err) {
                setError("Could not fetch students for this subject.");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [selectedSubject]);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        setMessage('');
        setError('');
        if (Object.keys(attendance).length === 0) {
            setError("No students to mark.");
            return;
        }

        const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
            studentId,
            status
        }));

        try {
            await axios.post('/attendance/bulk-update', {
                subjectId: selectedSubject,
                date: selectedDate,
                attendanceData
            });
            setMessage("Attendance submitted successfully!");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit attendance.");
        }
    };

    return (
        <div className="mark-attendance-container">
            <h1>Mark Daily Attendance</h1>
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

            {loading && <p>Loading students...</p>}
            
            {!loading && students.length > 0 && (
                <div className="student-list-container">
                    <ul className="student-list">
                        {students.map(student => (
                            <li key={student._id} className="student-item">
                                <span className="student-name">{student.name}</span>
                                <div className="action-buttons">
                                    <button 
                                        className={`btn-present ${attendance[student._id] === 'Present' ? 'active' : ''}`}
                                        onClick={() => handleStatusChange(student._id, 'Present')}
                                    >
                                        Present
                                    </button>
                                    <button 
                                        className={`btn-absent ${attendance[student._id] === 'Absent' ? 'active' : ''}`}
                                        onClick={() => handleStatusChange(student._id, 'Absent')}
                                    >
                                        Absent
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button className="submit-all-btn" onClick={handleSubmit}>
                        Submit Attendance for {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}
                    </button>
                    {message && <p className="message success">{message}</p>}
                    {error && <p className="message error">{error}</p>}
                </div>
            )}
        </div>
    );
};

export default MarkAttendance;
