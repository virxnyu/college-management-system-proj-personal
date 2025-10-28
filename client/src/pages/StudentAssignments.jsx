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
        // --- Relaxed file type restriction for broader use ---
        // if (selectedFile && selectedFile.type !== "application/pdf") {
        //     setError("Please upload a PDF file only.");
        //     setFile(null);
        //     return;
        // }
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
        // --- Ensure field name matches backend middleware ---
        formData.append('file', file); // Use 'submissionFile'

        try {
            // Token is now added automatically by axios interceptor
            await axios.post(`/assignments/${assignment._id}/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            setMessage('Submission successful!');
            setTimeout(() => {
                onSubmissionSuccess(); // Refresh the list after a short delay to show the message
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || "Submission failed. Please try again.");
            console.error("Submission error:", err); // Log the full error
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check if due date is in the past
    const dueDate = new Date(assignment.dueDate);
    dueDate.setHours(23, 59, 59, 999); // Set due date to end of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastDue = dueDate < new Date();


    return (
        <div className={`assignment-item ${assignment.submissionStatus === 'Submitted' ? 'submitted' : ''} ${isPastDue && assignment.submissionStatus !== 'Submitted' ? 'past-due' : ''}`}>
            <div className="item-header">
                <div className="item-title-subject">
                    <h4>{assignment.title}</h4>
                    <span>{assignment.subject.name} ({assignment.subject.code})</span>
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
                {assignment.submissionStatus === 'Submitted' ? (
                    <div className="submission-status success">
                        ✅ Submitted on {new Date(assignment.submittedAt).toLocaleDateString()}
                        {/* {assignment.submissionFileUrl && <a href={assignment.submissionFileUrl} target="_blank" rel="noopener noreferrer"> View Submission</a>} */}
                    </div>
                ) : isPastDue ? (
                         <div className="submission-status past-due-message">
                             ⚠️ Past Due Date
                         </div>
                 ) : (
                    <form onSubmit={handleSubmit} className="submission-form">
                        <input
                            type="file"
                            name="submissionFile" // <-- ADDED NAME ATTRIBUTE HERE
                            onChange={handleFileChange}
                            required
                        />
                        <button type="submit" disabled={isSubmitting || !file}>
                            {isSubmitting ? 'Submitting...' : 'Submit Work'}
                        </button>
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
    // ... (rest of StudentAssignments component remains the same) ...
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAssignments = async () => {
        setError('');
        try {
            const res = await axios.get("/assignments/student/all");
            const sorted = res.data.sort((a, b) => {
                 const aIsPastDue = new Date(a.dueDate) < new Date() && a.submissionStatus !== 'Submitted';
                 const bIsPastDue = new Date(b.dueDate) < new Date() && b.submissionStatus !== 'Submitted';
                 const aIsSubmitted = a.submissionStatus === 'Submitted';
                 const bIsSubmitted = b.submissionStatus === 'Submitted';

                 if (aIsPastDue && !bIsPastDue) return 1;
                 if (!aIsPastDue && bIsPastDue) return -1;

                 if (aIsSubmitted && !bIsSubmitted) return 1;
                 if (!aIsSubmitted && bIsSubmitted) return -1;

                 return new Date(a.dueDate) - new Date(b.dueDate);
            });
            setAssignments(sorted);
        } catch (err) {
            setError("Failed to load assignments.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchAssignments();
    }, []);

    if (loading) return <div className="loading-container">Loading Assignments...</div>;


    return (
        <div className="student-assignments-container">
            <header className="assignments-header">
                <h1>My Assignments</h1>
                <p>View upcoming and submitted assignments for all your subjects.</p>
                <Link to="/dashboard" className="back-to-dash">← Back to Dashboard</Link>
            </header>

             {error && !loading && <p className="message error">{error}</p>}

            <div className="assignments-list">
                {assignments.length > 0 ? (
                    assignments.map(assignment => (
                        <AssignmentItem
                            key={assignment._id}
                            assignment={assignment}
                            onSubmissionSuccess={fetchAssignments}
                         />
                    ))
                ) : !error ? (
                    <div className="no-assignments-message card">
                        <p>You have no assignments at the moment.</p>
                        <span>When your teachers post assignments, they will appear here.</span>
                    </div>
                ) : null }
            </div>
        </div>
    );
};

export default StudentAssignments;

