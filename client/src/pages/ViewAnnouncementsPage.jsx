import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axios';
import './ViewAnnouncementsPage.css'; // We will create this CSS

const ViewAnnouncementsPage = () => {
    const { subjectId } = useParams();
    const [announcements, setAnnouncements] = useState([]);
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch announcements for the enrolled student
                const [annRes, subjRes] = await Promise.all([
                    axios.get(`/announcements/student/${subjectId}`),
                    axios.get(`/subjects/${subjectId}`) // To display subject name
                ]);

                setAnnouncements(annRes.data);
                setSubject(subjRes.data);

            } catch (err) {
                setError(err.response?.data?.message || "Failed to load announcements.");
                console.error("Error fetching announcements:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId]);

    if (loading) return <div className="loading-container"><p>Loading Announcements...</p></div>;
    if (error) return <div className="error-container"><p className="message error">{error}</p></div>;

    return (
        <div className="announcements-page-container">
            <Link to="/dashboard" className="back-link">
                ← Back to Dashboard
            </Link>
            <header className="ann-header">
                <h2>Announcements for</h2>
                <h1>{subject ? subject.name : "Subject"}</h1>
            </header>

            <div className="announcements-list">
                {announcements.length === 0 ? (
                    <div className="no-announcements-message card">
                        <p>No announcements found for this subject yet.</p>
                        <span>Check back later or ask your teacher.</span>
                    </div>
                ) : (
                    announcements.map((ann) => (
                        <div key={ann._id} className={`ann-item card ${ann.isUrgent ? 'urgent-border' : ''}`}>
                            <div className="ann-info">
                                <h3 className="ann-title">{ann.title}</h3>
                                <p className="ann-content">{ann.content}</p>
                            </div>
                            <div className="ann-meta">
                                {ann.isUrgent && <span className="urgent-badge">🚨 URGENT</span>}
                                <span className="teacher-info">
                                    Posted by: {ann.teacher?.name || 'Teacher'} on {new Date(ann.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ViewAnnouncementsPage;
