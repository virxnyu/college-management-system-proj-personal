import React, { useState, useEffect } from 'react';
import axios from '../../axios'; // Use configured axios
import './UploadNote.css'; // Assuming you have some CSS

const UploadNote = ({ onNoteUploaded }) => {
    const [title, setTitle] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch teacher's subjects for the dropdown
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                // Use relative path - axios instance adds base URL and token
                const res = await axios.get('/subjects/teacher'); 
                setSubjects(res.data);
            } catch (err) {
                console.error("Error fetching teacher subjects:", err);
                setError('Could not fetch your subjects.');
                setSubjects([]); // Ensure subjects is an array even on error
            }
        };
        fetchSubjects();
    }, []); // Empty dependency array means run once on mount

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Get the selected file
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!file) {
            setError('Please select a file to upload.');
            setLoading(false);
            return;
        }
        if (!subjectId) {
             setError('Please select a subject.');
             setLoading(false);
             return;
        }
         if (!title) {
             setError('Please enter a note title.');
             setLoading(false);
             return;
        }


        // Use FormData to send file and text data
        const formData = new FormData();
        formData.append('title', title);
        formData.append('subjectId', subjectId);
        formData.append('description', description);
        formData.append('file', file); 

        console.log("FormData being sent:");
    for (let pair of formData.entries()) {
        // Log key and value type (or filename for files)
        console.log(pair[0] + ': ', pair[1] instanceof File ? pair[1].name : pair[1]);
    }


        try {
            // Use relative path - axios instance adds base URL and token
            await axios.post('/notes', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Important for file uploads
                }
            });

            setSuccess('Note uploaded successfully!');
            // Clear the form
            setTitle('');
            setSubjectId('');
            setFile(null);
            setDescription('');
            // Clear file input visually (requires accessing the DOM element)
             if (document.getElementById('note-file-input')) {
                document.getElementById('note-file-input').value = '';
             }

            if (onNoteUploaded) {
                onNoteUploaded(); // Call the callback if provided
            }

        } catch (err) {
            console.error("Error uploading note:", err);
            setError(err.response?.data?.message || 'An error occurred while uploading the note.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-note-container form-container">
            <h3>Upload a New Note</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="noteTitle">Note Title</label>
                    <input
                        type="text"
                        id="noteTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Chapter 1 Summary"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="noteSubject">Subject</label>
                    <select
                        id="noteSubject"
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        required
                    >
                        <option value="">-- Select a Subject --</option>
                        {subjects.length > 0 ? (
                             subjects.map(subj => (
                                <option key={subj._id} value={subj._id}>
                                    {subj.name} ({subj.code})
                                </option>
                            ))
                         ) : (
                             <option disabled>Loading subjects...</option>
                         )}
                    </select>
                </div>

                <div className="form-group">
                     <label htmlFor="note-file-input">File (PDF, MP3, MP4, etc.)</label>
                    <input
                        type="file"
                        id="note-file-input" // Added ID for clearing
                        onChange={handleFileChange}
                        accept=".pdf,.mp3,.mp4,.mpeg,.jpg,.jpeg,.png,.docx" // Example accepted types
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="noteDescription">Description (Optional)</label>
                    <textarea
                        id="noteDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide instructions, topics, or guidelines for the note."
                        rows="3"
                    ></textarea>
                </div>

                {error && <p className="message error">{error}</p>}
                {success && <p className="message success">{success}</p>}

                <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload Note'}
                </button>
            </form>
        </div>
    );
};

export default UploadNote;
