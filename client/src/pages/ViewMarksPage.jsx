// client/src/pages/ViewMarksPage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { useParams, Link } from 'react-router-dom';
import './ViewMarksPage.css'; // Create this CSS file next

const ViewMarksPage = () => {
    const { subjectId } = useParams();
    const [grades, setGrades] = useState([]);
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch grades and subject details concurrently
                const [gradesRes, subjectRes] = await Promise.all([
                    axios.get(`/grades/student/subject/${subjectId}`),
                    axios.get(`/subjects/${subjectId}`) // Fetch subject details too
                ]);
                setGrades(gradesRes.data);
                setSubject(subjectRes.data);
            } catch (err) {
                setError("Failed to load marks for this subject.");
                console.error(err);
                setGrades([]);
                setSubject(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId]);

    return (
        <div className="view-marks-container">
            {/* Optional Header */}
            {/* <DashboardHeader title={subject ? `Marks for ${subject.name}` : "Loading..."} subtitle="Your scores for various exams." /> */}

             <Link to="/dashboard" className="back-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to Dashboard
            </Link>

            <header className="marks-header">
                <h2>Grades for</h2>
                <h1>{subject ? subject.name : "Subject"}</h1>
            </header>

            {loading ? (
                <p className="loading-message">Loading marks...</p>
            ) : error ? (
                <p className="message error">{error}</p>
            ) : grades.length === 0 ? (
                <div className="no-marks-message card">
                    <p>No marks have been entered for this subject yet.</p>
                </div>
            ) : (
                <div className="marks-list">
                    {grades.map(grade => (
                        <div key={grade._id} className="mark-item card">
                            <div className="exam-name">
                                {grade.exam?.name || "Unknown Exam"}
                            </div>
                            <div className="marks-display">
                                <span className="obtained">{grade.marksObtained}</span>
                                <span className="total"> / {grade.exam?.totalMarks || '?'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewMarksPage;