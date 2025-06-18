import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MarkAttendance() {
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('Present');
  const [students, setStudents] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [subjects, setSubjects] = useState([]); // <-- add this


  const token = localStorage.getItem('token'); // JWT stored during login

  useEffect(() => {
    const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token'); // get the JWT token
      const response = await axios.get("http://localhost:5000/api/teacher/students", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStudents(response.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  };

  fetchStudents();
}, [token]);

useEffect(() => {
  // ...existing fetchStudents...
  const fetchSubjects = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/subjects/teacher", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(res.data);
    } catch (err) {
      console.error("Failed to fetch subjects", err);
    }
  };
  fetchSubjects(); // <-- add this
}, [token]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/teacher/attendance', {
  studentId,
  subjectId,
  date,
  status
}, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
      console.log(res.data); // <-- Use the res object here
      alert('✅ Attendance marked!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div>
      <h2>Mark Attendance</h2>
      <form onSubmit={handleSubmit}>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
          <option value="">--Select Student--</option>
            {students.map((student) => (
                <option key={student._id} value={student._id}>
                {student.name}
                </option>
            ))}
        </select><br />

        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} required>
  <option value="">--Select Subject--</option>
  {subjects.map((subject) => (
    <option key={subject._id} value={subject._id}>
      {subject.name}
    </option>
  ))}
</select>
        <br />

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /><br />

        <select value={status} onChange={(e) => setStatus(e.target.value)} required>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
        </select><br />

        <button type="submit">Mark Attendance</button>
      </form>
    </div>
  );
}

export default MarkAttendance;
// Note: Ensure you have a route in your backend to fetch all students
// and to handle the POST request for marking attendance.