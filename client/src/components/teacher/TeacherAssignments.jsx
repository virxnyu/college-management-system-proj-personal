import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../axios'; // --- 1. IMPORT THE CENTRAL AXIOS INSTANCE ---
import './TeacherAssignments.css';

const TeacherAssignments = ({ refreshTrigger }) => {
    const [assignments, setAssignments]         = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [error, setError]                     = useState('');

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            // --- 2. USE THE CORRECT, SHORTER URL ---
            // The '/api' part is handled by axios.js
            // The 'http://localhost:5000' is handled by the proxy
            const res = await axios.get('/assignments/teacher/all');
            setAssignments(res.data);
        } catch (err) {
            setError('Failed to fetch assignments.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [refreshTrigger]);

    if (loading) return <p>Loading your assignments...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="teacher-assignments-container">
            <h3>Your Created Assignments</h3>
            {assignments.length === 0 ? (
                <p>You have not created any assignments yet.</p>
            ) : (
                <div className="assignments-table-wrapper">
                    <table className="assignments-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Subject</th>
                                <th>Due Date</th>
                                <th>Submissions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map(assignment => (
                                <tr key={assignment._id}>
                                    <td>{assignment.title}</td>
                                    <td>{assignment.subject.name}</td>
                                    <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                                    <td>{assignment.submissionCount}</td>
                                    <td>
                                        <Link to={`/assignment/${assignment._id}/submissions`} className="view-submissions-link">
                                            View Submissions
                                        </Link>
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

export default TeacherAssignments;
