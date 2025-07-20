import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../axios';
import './SubjectNotesPage.css'; // We will create this next

// Helper to get a file type icon
const FileIcon = ({ fileType }) => {
    if (fileType.includes('pdf')) return <span className="file-icon">📄</span>;
    if (fileType.includes('audio') || fileType.includes('mp3')) return <span className="file-icon">🎵</span>;
    if (fileType.includes('video') || fileType.includes('mp4')) return <span className="file-icon">🎬</span>;
    return <span className="file-icon">📁</span>;
};

const SubjectNotesPage = () => {
    const { subjectId } = useParams();
    const [notes, setNotes] = useState([]);
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNotesAndSubject = async () => {
            setLoading(true);
            try {
                const [notesRes, subjectRes] = await Promise.all([
                    axios.get(`/notes/subject/${subjectId}`),
                    axios.get(`/subjects/${subjectId}`)
                ]);
                setNotes(notesRes.data);
                setSubject(subjectRes.data);
            } catch (err) {
                setError("Failed to load notes for this subject.");
                console.error("Error fetching notes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotesAndSubject();
    }, [subjectId]);

    if (loading) return <div className="loading-container"><p>Loading Notes...</p></div>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="notes-page-container">
            <Link to="/dashboard" className="back-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to Dashboard
            </Link>
            <header className="notes-header">
                <h2>Notes & Resources for</h2>
                {subject && <h1>{subject.name}</h1>}
            </header>

            <div className="notes-list">
                {notes.length > 0 ? (
                    notes.map(note => (
                        <div key={note._id} className="note-item">
                            <div className="note-icon-title">
                                <FileIcon fileType={note.fileType} />
                                <div className="note-info">
                                    <h4>{note.title}</h4>
                                    <p>{note.description || 'No description provided.'}</p>
                                </div>
                            </div>
                            <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="download-btn">
                                Open
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="no-notes-message">
                        <p>No notes have been uploaded for this subject yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectNotesPage;
