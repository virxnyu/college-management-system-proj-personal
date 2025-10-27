// client/src/pages/EnterMarksPage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../axios';
import { Link } from 'react-router-dom';
import DashboardHeader from '../components/common/DashboardHeader';
import './EnterMarksPage.css'; // We'll create this CSS file next

const EnterMarksPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [exams, setExams] = useState([]);
    const [selectedExamId, setSelectedExamId] = useState('');
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState({}); // { studentId: marks }
    const [examDetails, setExamDetails] = useState({ name: '', totalMarks: '' });

    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [loadingExams, setLoadingExams] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [isSubmittingGrades, setIsSubmittingGrades] = useState(false);
    const [isCreatingExam, setIsCreatingExam] = useState(false);

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Fetch teacher's subjects
    useEffect(() => {
        const fetchSubjects = async () => {
            setLoadingSubjects(true);
            try {
                const res = await axios.get("/subjects/teacher");
                setSubjects(res.data);
            } catch (err) {
                setError("Could not fetch your subjects.");
                console.error(err);
            } finally {
                setLoadingSubjects(false);
            }
        };
        fetchSubjects();
    }, []);

    // Fetch exams when subject changes
    useEffect(() => {
        if (!selectedSubjectId) {
            setExams([]);
            setSelectedExamId('');
            setStudents([]);
            setGrades({});
            return;
        }
        const fetchExams = async () => {
            setLoadingExams(true);
            setError('');
            try {
                const res = await axios.get(`/exams/subject/${selectedSubjectId}`);
                setExams(res.data);
                setSelectedExamId(''); // Reset selected exam
                setStudents([]); // Reset students when subject changes
                setGrades({});
            } catch (err) {
                setError("Could not fetch exams for this subject.");
                console.error(err);
                setExams([]);
            } finally {
                setLoadingExams(false);
            }
        };
        fetchExams();
    }, [selectedSubjectId]);

    // Fetch students when exam is selected (or subject changes and exam exists)
    useEffect(() => {
        if (!selectedSubjectId) return; // Don't fetch if no subject

        const fetchStudents = async () => {
            setLoadingStudents(true);
            setError('');
             setMessage('');
            setGrades({}); // Reset grades when students reload
            try {
                const res = await axios.get(`/subjects/${selectedSubjectId}/students`);
                setStudents(res.data);
                // Initialize grades state
                const initialGrades = {};
                res.data.forEach(student => {
                    initialGrades[student._id] = ''; // Default to empty string
                });
                setGrades(initialGrades);
            } catch (err) {
                setError("Could not fetch students for this subject.");
                console.error(err);
                setStudents([]);
            } finally {
                setLoadingStudents(false);
            }
        };
       fetchStudents();
       // TODO: Optionally, fetch existing grades for the selected exam here
       //       and populate the 'grades' state.
    }, [selectedSubjectId, selectedExamId]); // Refetch students if exam changes too (in case of pre-filling grades)

    // Handle grade input change
    const handleGradeChange = (studentId, value) => {
        setGrades(prev => ({ ...prev, [studentId]: value }));
    };

    // Handle Exam Creation
    const handleCreateExam = async (e) => {
        e.preventDefault();
        if (!examDetails.name || !examDetails.totalMarks || !selectedSubjectId) {
            setError("Please select a subject and enter Exam Name and Total Marks.");
            return;
        }
         if (isNaN(parseInt(examDetails.totalMarks)) || parseInt(examDetails.totalMarks) < 1) {
             setError('Total Marks must be a positive number.');
             return;
         }
        setIsCreatingExam(true);
        setError('');
        setMessage('');
        try {
            const res = await axios.post('/exams', {
                name: examDetails.name,
                subjectId: selectedSubjectId,
                totalMarks: examDetails.totalMarks
            });
            // Add new exam to list and select it
            setExams(prev => [res.data, ...prev]);
            setSelectedExamId(res.data._id); // Auto-select the newly created exam
            setMessage(`Exam "${res.data.name}" created successfully!`);
            setExamDetails({ name: '', totalMarks: '' }); // Clear form
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create exam.");
            console.error(err);
        } finally {
            setIsCreatingExam(false);
        }
    };

     // Handle Submitting Grades
    const handleSubmitGrades = async () => {
        if (!selectedExamId) {
            setError("Please select an exam first.");
            return;
        }
        if (students.length === 0) {
             setError("No students found for this subject/exam.");
            return;
        }

        const currentExam = exams.find(e => e._id === selectedExamId);
        if (!currentExam) {
            setError("Selected exam details not found.");
            return;
        }
        const totalMarksForExam = currentExam.totalMarks;

        const gradesData = students.map(student => {
            const marksStr = grades[student._id] || '0'; // Default to '0' if empty
             const marksNum = parseFloat(marksStr);

             // Validate each mark before sending
             if (isNaN(marksNum) || marksNum < 0 || marksNum > totalMarksForExam) {
                 throw new Error(`Invalid mark '${marksStr}' for ${student.name}. Must be between 0 and ${totalMarksForExam}.`);
             }

            return {
                studentId: student._id,
                marksObtained: marksNum // Send as number
            };
        });

        setIsSubmittingGrades(true);
        setError('');
        setMessage('');
        try {
            await axios.post('/grades/bulk', {
                examId: selectedExamId,
                gradesData
            });
            setMessage("Grades submitted successfully!");
            // Optionally clear grades or refetch them after submission
             // setGrades({});
        } catch (err) {
             // Catch validation error thrown above
            if (err.message.startsWith('Invalid mark')) {
                setError(err.message);
            } else {
                 setError(err.response?.data?.message || "Failed to submit grades.");
                 console.error(err);
            }
        } finally {
            setIsSubmittingGrades(false);
        }
    };


    const selectedExamTotalMarks = exams.find(e => e._id === selectedExamId)?.totalMarks;


    return (
        <div className="enter-marks-container">
            <DashboardHeader title="Enter Exam Marks" subtitle="Create exams and record student scores." />

            {/* Subject Selection */}
            <div className="controls-section card">
                <h3>1. Select Subject</h3>
                {loadingSubjects ? <p>Loading subjects...</p> : (
                    <select
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        disabled={loadingSubjects || isSubmittingGrades || isCreatingExam}
                    >
                        <option value="">-- Select Subject --</option>
                        {subjects.map(subj => (
                            <option key={subj._id} value={subj._id}>
                                {subj.name} ({subj.code})
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {selectedSubjectId && (
                <>
                    {/* Exam Creation */}
                    <div className="controls-section card">
                        <h3>2. Create New Exam (Optional)</h3>
                        <form onSubmit={handleCreateExam} className="create-exam-form">
                            <input
                                type="text"
                                placeholder="Exam Name (e.g., Midterm 1)"
                                value={examDetails.name}
                                onChange={(e) => setExamDetails({ ...examDetails, name: e.target.value })}
                                required
                                disabled={isCreatingExam}
                            />
                            <input
                                type="number"
                                placeholder="Total Marks"
                                value={examDetails.totalMarks}
                                onChange={(e) => setExamDetails({ ...examDetails, totalMarks: e.target.value })}
                                required
                                min="1"
                                disabled={isCreatingExam}
                            />
                            <button type="submit" disabled={isCreatingExam}>
                                {isCreatingExam ? 'Creating...' : 'Create Exam'}
                            </button>
                        </form>
                    </div>

                    {/* Exam Selection */}
                    <div className="controls-section card">
                        <h3>3. Select Exam to Enter Marks</h3>
                        {loadingExams ? <p>Loading exams...</p> : exams.length === 0 ? <p>No exams created for this subject yet.</p> : (
                            <select
                                value={selectedExamId}
                                onChange={(e) => setSelectedExamId(e.target.value)}
                                disabled={loadingExams || isSubmittingGrades || isCreatingExam}
                            >
                                <option value="">-- Select Exam --</option>
                                {exams.map(exam => (
                                    <option key={exam._id} value={exam._id}>
                                        {exam.name} (Total: {exam.totalMarks})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </>
            )}

             {/* Grade Entry Table */}
             {selectedExamId && (
                <div className="grades-entry-section card">
                    <h3>4. Enter Marks for "{exams.find(e => e._id === selectedExamId)?.name}"</h3>
                    {loadingStudents ? <p>Loading students...</p> : students.length === 0 ? <p>No students enrolled in this subject.</p> : (
                        <div className="grades-table-wrapper">
                            <table className="grades-table">
                                <thead>
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Marks Obtained ({selectedExamTotalMarks} Total)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map(student => (
                                        <tr key={student._id}>
                                            <td data-label="Student Name">{student.name}</td>
                                            <td data-label={`Marks (/${selectedExamTotalMarks})`}>
                                                <input
                                                    type="number"
                                                    value={grades[student._id] || ''}
                                                    onChange={(e) => handleGradeChange(student._id, e.target.value)}
                                                    placeholder={`0 - ${selectedExamTotalMarks}`}
                                                    min="0"
                                                    max={selectedExamTotalMarks}
                                                    disabled={isSubmittingGrades}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button
                                onClick={handleSubmitGrades}
                                disabled={isSubmittingGrades || loadingStudents}
                                className="submit-grades-btn"
                             >
                                {isSubmittingGrades ? 'Submitting...' : 'Submit All Grades'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Messages */}
            {error && <p className="message error">{error}</p>}
            {message && <p className="message success">{message}</p>}

            <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        </div>
    );
};

export default EnterMarksPage;