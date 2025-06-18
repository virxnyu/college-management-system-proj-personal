import React, { useEffect, useState } from "react";
import axios from "../../axios"; // using your axios instance

export default function StudentSubjectAttendance() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    // Fetch subjects enrolled by the student
    const fetchSubjects = async () => {
      try {
        const res = await axios.get("/subjects/student", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSubjects(res.data);
      } catch (err) {
        console.error("Failed to fetch subjects", err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubjectId) {
      setAttendanceStats(null);
      return;
    }

    const fetchAttendanceStats = async () => {
      setLoadingAttendance(true);
      try {
        const res = await axios.get(`/attendance/student/subject/${selectedSubjectId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAttendanceStats(res.data);
      } catch (err) {
        console.error("Failed to fetch attendance stats", err);
        setAttendanceStats(null);
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchAttendanceStats();
  }, [selectedSubjectId]);

  return (
    <div>
      <h2>📚 Subject-wise Attendance</h2>

      {loadingSubjects ? (
        <p>Loading subjects...</p>
      ) : subjects.length === 0 ? (
        <p>You're not enrolled in any subjects.</p>
      ) : (
        <>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map(subj => (
              <option key={subj._id} value={subj._id}>
                {subj.name}
              </option>
            ))}
          </select>

          {loadingAttendance && <p>⏳ Fetching attendance...</p>}

          {attendanceStats && (
            <div style={{ marginTop: "20px" }}>
              <p><strong>Total Classes:</strong> {attendanceStats.total}</p>
              <p><strong>Classes Attended:</strong> {attendanceStats.attended}</p>
              <p><strong>Attendance %:</strong> {attendanceStats.percentage}%</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}