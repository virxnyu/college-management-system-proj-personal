import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MarkAttendance() {
  const [date, setDate] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [marking, setMarking] = useState({}); // {studentId: "Present"/"Absent"}
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  // Fetch teacher's subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/subjects/teacher", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubjects(res.data);
      } catch (err) {
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [token]);

  // Fetch students enrolled in selected subject
  useEffect(() => {
    const fetchStudents = async () => {
      if (!subjectId) {
        setStudents([]);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/subjects/${subjectId}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(res.data);
      } catch (err) {
        setStudents([]);
      }
    };
    fetchStudents();
  }, [subjectId, token]);

  // Mark attendance for a student
  const handleMark = async (studentId, status) => {
    if (!date || !subjectId) {
      setMessage("Please select date and subject first.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/attendance",
        {
          studentId,
          subjectId,
          date,
          status
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setMarking((prev) => ({ ...prev, [studentId]: status }));
      setMessage(`Attendance marked as ${status} for student.`);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error marking attendance");
    }
  };

  return (
    <div>
      <h2>Mark Attendance</h2>
      <div>
        <label>Date: </label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </div>
      <div>
        <label>Subject: </label>
        <select value={subjectId} onChange={e => setSubjectId(e.target.value)} required>
          <option value="">--Select Subject--</option>
          {subjects.map(subject => (
            <option key={subject._id} value={subject._id}>
              {subject.name} ({subject.code})
            </option>
          ))}
        </select>
      </div>
      <hr />
      {students.length > 0 && (
        <div>
          <h4>Students Enrolled:</h4>
          <ul>
            {students.map(student => (
              <li key={student._id}>
                {student.name} ({student.email}){" "}
                <button
                  disabled={marking[student._id] === "Present"}
                  onClick={() => handleMark(student._id, "Present")}
                >
                  Present
                </button>
                <button
                  disabled={marking[student._id] === "Absent"}
                  onClick={() => handleMark(student._id, "Absent")}
                >
                  Absent
                </button>
                {marking[student._id] && (
                  <span style={{ marginLeft: 8 }}>
                    ✅ Marked {marking[student._id]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default MarkAttendance;
// This component allows teachers to mark attendance for students in a selected subject on a specific date.
// It fetches the subjects taught by the teacher and the students enrolled in the selected subject.
// Teachers can mark each student as "Present" or "Absent", and the attendance is saved via an API call.
// The component also handles error messages and displays the current attendance status for each student.
// Make sure to adjust the API endpoints and data structure according to your backend implementation.
// This code assumes you have a backend API set up to handle attendance marking and fetching subjects/students
// You can integrate this component into your teacher dashboard or as a separate page in your application.
