import React, { useState, useEffect } from 'react';
import axios from '../../axios'; // Your configured axios instance
import './CreateAssignment.css'; // We will create this file next

const CreateAssignment = ({ onAssignmentCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [subjectId, setSubjectId] = useState('');
    
    const [subjects, setSubjects] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch the teacher's subjects when the component mounts
    useEffect(() => {
        const fetchTeacherSubjects = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("/subjects/teacher", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSubjects(res.data);
            } catch (err) {
                setError("Could not fetch your subjects. Please try again later.");
                console.error("Error fetching subjects:", err);
            }
        };
        fetchTeacherSubjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !subjectId || !dueDate) {
            setError("Title, Subject, and Due Date are required.");
            return;
        }
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const token = localStorage.getItem("token");
            const payload = {
                title,
                description,
                dueDate,
                subjectId,
            };
            const res = await axios.post('/assignments', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage('Assignment created successfully!');
            setTitle('');
            setDescription('');
            setDueDate('');
            setSubjectId('');

            // Optional: Callback to notify parent component
            if (onAssignmentCreated) {
                onAssignmentCreated(res.data.assignment);
            }

        } catch (err) {
            setError(err.response?.data?.message || "An error occurred while creating the assignment.");
            console.error("Assignment creation error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-assignment-container">
            <h3>Create a New Assignment</h3>
            <form onSubmit={handleSubmit} className="create-assignment-form">
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., History Essay 1"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <select
                        id="subject"
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        required
                    >
                        <option value="">-- Select a Subject --</option>
                        {subjects.map((subject) => (
                            <option key={subject._id} value={subject._id}>
                                {subject.name} ({subject.code})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description (Optional)</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide instructions, topics, or guidelines for the assignment."
                        rows="4"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="dueDate">Due Date</label>
                    <input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                    />
                </div>
                
                {error && <p className="message error-message">{error}</p>}
                {message && <p className="message success-message">{message}</p>}

                <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'Creating...' : 'Create Assignment'}
                </button>
            </form>
        </div>
    );
};

export default CreateAssignment;