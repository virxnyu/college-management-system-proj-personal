import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { Link } from 'react-router-dom';
import './StudentAssignments.css';

const AssignmentItem = ({ assignment, onSubmissionSuccess }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type !== "application/pdf") {
            setError("Please upload a PDF file only.");
            setFile(null);
            return;
        }
        setError('');
        setFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file to submit.");
            return;
        }
        setIsSubmitting(true);
        setError('');
        setMessage('');

        const formData = new FormData();
        formData.append('submissionFile', file);

        try {
            const token = localStorage.getItem('token');
            await axios.post(`/assignments/${assignment._id}/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage('Submission successful!');
            setTimeout(() => {
                onSubmissionSuccess(); // Refresh the list after a short delay to show the message
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || "Submission failed. The server may not be configured for file uploads yet.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isPastDue = new Date(assignment.dueDate) < new Date();

    return (
        <div className={`assignment-item ${assignment.isSubmitted ? 'submitted' : ''} ${isPastDue && !assignment.isSubmitted ? 'past-due' : ''}`}>
            <div className="item-header">
                <div className="item-title-subject">
                    <h4>{assignment.title}</h4>
                    <span>{assignment.subject.name}</span>
                </div>
                <div className="item-due-date">
                    <span>Due Date</span>
                    <p>{new Date(assignment.dueDate).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="item-body">
                <p className="item-description">{assignment.description || "No description provided."}</p>
            </div>
            <div className="item-footer">
                {assignment.isSubmitted ? (
                    <div className="submission-status success">
                        ✅ Submitted on {new Date(assignment.submittedAt).toLocaleDateString()}
                    </div>
                ) : isPastDue ? (
                     <div className="submission-status past-due-message">
                        ⚠️ Past Due Date
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="submission-form">
                        <input type="file" accept=".pdf" onChange={handleFileChange} required />
                        <button type="submit" disabled={isSubmitting || !file}>
                            {isSubmitting ? 'Submitting...' : 'Submit Work'}
                        </button>
                        {/* --- FIX: DISPLAY THE SUCCESS OR ERROR MESSAGE --- */}
                        {error && <p className="submission-message error">{error}</p>}
                        {message && <p className="submission-message success">{message}</p>}
                    </form>
                )}
            </div>
        </div>
    );
};


// Main component for the page
const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAssignments = async () => {
        // No setLoading(true) here to make refresh seamless
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/assignments/student/all", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(res.data);
        } catch (err) {
            setError("Failed to load assignments.");
            console.error(err);
        } finally {
            setLoading(false); // Only set loading to false on initial load
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    if (loading) return <div className="loading-container">Loading Assignments...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="student-assignments-container">
            <header className="assignments-header">
                <h1>My Assignments</h1>
                <p>View upcoming and submitted assignments for all your subjects.</p>
                <Link to="/dashboard" className="back-to-dash">← Back to Dashboard</Link>
            </header>
            <div className="assignments-list">
                {assignments.length > 0 ? (
                    assignments.map(assignment => (
                        <AssignmentItem key={assignment._id} assignment={assignment} onSubmissionSuccess={fetchAssignments} />
                    ))
                ) : (
                    <div className="no-assignments-message">
                        <p>You have no assignments at the moment.</p>
                        <span>When your teachers post assignments, they will appear here.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAssignments;
