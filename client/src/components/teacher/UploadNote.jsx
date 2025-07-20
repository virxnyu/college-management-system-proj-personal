import React, { useState, useEffect } from 'react';
import axios from '../../axios';
import './UploadNote.css'; // We will create this next

const UploadNote = ({ onNoteUploaded }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [noteFile, setNoteFile] = useState(null);
    
    const [subjects, setSubjects] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Fetch the teacher's subjects when the component mounts
    useEffect(() => {
        const fetchTeacherSubjects = async () => {
            try {
                const res = await axios.get("/subjects/teacher");
                setSubjects(res.data);
            } catch (err) {
                setError("Could not fetch your subjects.");
            }
        };
        fetchTeacherSubjects();
    }, []);

    const handleFileChange = (e) => {
        setNoteFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !subjectId || !noteFile) {
            setError("Title, Subject, and a File are required.");
            return;
        }
        setIsUploading(true);
        setMessage('');
        setError('');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('subjectId', subjectId);
        formData.append('noteFile', noteFile); // 'noteFile' must match the key in our middleware

        try {
            const res = await axios.post('/notes', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            setMessage('Note uploaded successfully!');
            setTitle('');
            setDescription('');
            setSubjectId('');
            setNoteFile(null);
            e.target.reset(); // Reset the form to clear the file input

            if (onNoteUploaded) {
                onNoteUploaded(res.data.note);
            }

        } catch (err) {
            setError(err.response?.data?.message || "An error occurred while uploading the note.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="upload-note-container">
            <h3>Upload a New Note</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="note-title">Note Title</label>
                    <input
                        id="note-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Chapter 1: Introduction"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="note-subject">Subject</label>
                    <select
                        id="note-subject"
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        required
                    >
                        <option value="">-- Select a Subject --</option>
                        {subjects.map((subject) => (
                            <option key={subject._id} value={subject._id}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="note-file">File (PDF, MP3, MP4, etc.)</label>
                    <input
                        id="note-file"
                        type="file"
                        onChange={handleFileChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="note-description">Description (Optional)</label>
                    <textarea
                        id="note-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Briefly describe the content of the note."
                        rows="3"
                    />
                </div>
                
                {error && <p className="message error-message">{error}</p>}
                {message && <p className="message success-message">{message}</p>}

                <button type="submit" disabled={isUploading} className="submit-btn">
                    {isUploading ? 'Uploading...' : 'Upload Note'}
                </button>
            </form>
        </div>
    );
};

export default UploadNote;
