import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useParams, Link } from 'react-router-dom';
import './ViewSubmissions.css';

const ViewSubmissions = () => {
    const { assignmentId } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [assignment, setAssignment] = useState(null); // This is now used
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch both submissions and assignment details at the same time
                const [submissionsRes, assignmentRes] = await Promise.all([
                    axios.get(`/assignments/${assignmentId}/submissions`, { headers }),
                    axios.get(`/assignments/${assignmentId}`, { headers })
                ]);

                setSubmissions(submissionsRes.data);
                setAssignment(assignmentRes.data); // Set the assignment details

            } catch (err) {
                setError("Failed to load submission details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [assignmentId]);

    if (loading) return <div className="loading-container">Loading Submissions...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="view-submissions-container">
            <header className="submissions-header">
                {/* Display the assignment title dynamically */}
                <h1>{assignment ? `Submissions for "${assignment.title}"` : 'Submissions'}</h1>
                <Link to="/dashboard" className="back-to-dash">← Back to Dashboard</Link>
            </header>

            <div className="submissions-list-wrapper">
                {submissions.length > 0 ? (
                    <table className="submissions-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Student Email</th>
                                <th>Submitted At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map(sub => (
                                <tr key={sub._id}>
                                    <td data-label="Student Name">{sub.student.name}</td>
                                    <td data-label="Student Email">{sub.student.email}</td>
                                    <td data-label="Submitted At">{new Date(sub.submittedAt).toLocaleString()}</td>
                                    <td data-label="Action">
                                        <a 
                                            href={sub.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="view-submission-btn"
                                        >
                                            View PDF
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-submissions-message">
                        <p>No submissions have been made for this assignment yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewSubmissions;
