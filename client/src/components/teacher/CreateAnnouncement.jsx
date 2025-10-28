import React, { useState, useEffect } from 'react';
import axios from '../../axios';

const CreateAnnouncement = ({ onAnnouncementCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch the teacher's subjects when the component mounts
    useEffect(() => {
        const fetchTeacherSubjects = async () => {
            try {
                const res = await axios.get("/subjects/teacher");
                setSubjects(res.data);
            } catch (err) {
                setError("Could not fetch subjects for creating announcements.");
                console.error("Error fetching subjects:", err);
            }
        };
        fetchTeacherSubjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content || !subjectId) {
            setError("Title, Content, and Subject are required.");
            return;
        }
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const payload = { title, content, subjectId };
            const res = await axios.post('/announcements', payload);

            setMessage('Announcement created successfully!');
            setTitle('');
            setContent('');
            setSubjectId('');

            if (onAnnouncementCreated) {
                onAnnouncementCreated(res.data);
            }

        } catch (err) {
            setError(err.response?.data?.message || "An error occurred while creating the announcement.");
            console.error("Announcement creation error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-assignment-container card"> {/* Reusing styles for card look */}
            <h3>Create New Announcement</h3>
            <form onSubmit={handleSubmit} className="create-assignment-form">
                <div className="form-group">
                    <label htmlFor="announcementTitle">Title</label>
                    <input
                        id="announcementTitle"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Quiz Reminder, Class Cancelled"
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
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Detailed message..."
                        rows="4"
                        required
                    />
                </div>

                {error && <p className="message error-message">{error}</p>}
                {message && <p className="message success-message">{message}</p>}

                <button type="submit" disabled={loading} className="submit-btn">
                    {loading ? 'Publishing...' : 'Publish Announcement'}
                </button>
            </form>
        </div>
    );
};

export default CreateAnnouncement;
