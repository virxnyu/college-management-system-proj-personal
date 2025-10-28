import React, { useState, useEffect } from 'react';
import axios from '../../axios';

const AnnouncementForm = ({ subjectId, initialData = {}, onSaved }) => {
    const [title, setTitle] = useState(initialData.title || '');
    const [content, setContent] = useState(initialData.content || '');
    const [isUrgent, setIsUrgent] = useState(initialData.isUrgent || false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const isEditing = !!initialData._id;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        const payload = { title, content, isUrgent, subjectId };

        try {
            if (isEditing) {
                await axios.put(`/announcements/${initialData._id}`, payload);
                setMessage("Announcement updated successfully!");
            } else {
                await axios.post('/announcements', payload);
                setMessage("Announcement created successfully!");
            }
            onSaved(); // Trigger parent refresh
            // Clear form if new entry
            if (!isEditing) {
                setTitle('');
                setContent('');
                setIsUrgent(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} announcement.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="announcement-form card">
            <h4>{isEditing ? 'Edit Announcement' : 'Create New Announcement'}</h4>
            <input
                type="text"
                placeholder="Title (e.g., Quiz Reminder)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <textarea
                placeholder="Announcement details..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="3"
                required
            />
            <label className="checkbox-label">
                <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                />
                Mark as Urgent
            </label>

            {error && <p className="message error">{error}</p>}
            {message && <p className="message success">{message}</p>}

            <button type="submit" disabled={loading}>
                {loading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Post Announcement')}
            </button>
            {isEditing && <button type="button" onClick={onSaved} className="cancel-btn">Cancel</button>}
        </form>
    );
};


const AnnouncementList = ({ announcements, onEdit, onDeleted }) => {
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this announcement?")) {
            try {
                await axios.delete(`/announcements/${id}`);
                onDeleted();
            } catch (err) {
                alert("Failed to delete announcement.");
                console.error(err);
            }
        }
    };

    return (
        <div className="announcement-list-container card">
            <h3>Current Announcements</h3>
            {announcements.length === 0 ? (
                <p>No announcements found for this subject.</p>
            ) : (
                <ul className="announcement-ul">
                    {announcements.map((ann) => (
                        <li key={ann._id} className={`announcement-item ${ann.isUrgent ? 'urgent' : ''}`}>
                            <div>
                                <span className="ann-title">{ann.title}</span>
                                <p className="ann-content">{ann.content}</p>
                                <span className="ann-meta">Posted: {new Date(ann.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="ann-actions">
                                <button onClick={() => onEdit(ann)} className="edit-btn">✏️</button>
                                <button onClick={() => handleDelete(ann._id)} className="delete-btn">🗑️</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


const ManageAnnouncements = ({ subjectId }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingAnn, setEditingAnn] = useState(null);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            // Note: Using the teacher specific endpoint for management
            const res = await axios.get(`/announcements/teacher/${subjectId}`);
            setAnnouncements(res.data);
        } catch (err) {
            console.error("Failed to fetch announcements:", err);
            setAnnouncements([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (subjectId) {
            fetchAnnouncements();
        }
    }, [subjectId]);

    const handleSaved = () => {
        setEditingAnn(null);
        fetchAnnouncements();
    };

    return (
        <div className="manage-announcements-container">
            {subjectId ? (
                <>
                    <AnnouncementForm
                        subjectId={subjectId}
                        initialData={editingAnn}
                        onSaved={handleSaved}
                    />

                    {loading ? (
                        <p>Loading announcements...</p>
                    ) : (
                        <AnnouncementList
                            announcements={announcements}
                            onEdit={setEditingAnn}
                            onDeleted={handleSaved}
                        />
                    )}
                </>
            ) : (
                <p>Please select a subject first.</p>
            )}
        </div>
    );
};

export default ManageAnnouncements;
