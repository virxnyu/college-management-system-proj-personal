import React, { useEffect, useState } from "react";
import axios from "../../axios";

export default function EnrollSubject({ onEnroll }) {
  const [allSubjects, setAllSubjects] = useState([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch all subjects
    const fetchAllSubjects = async () => {
      try {
        const res = await axios.get("/subjects"); // <-- You need this endpoint
        setAllSubjects(res.data);
      } catch (err) {
        setAllSubjects([]);
      }
    };
    // Fetch enrolled subjects
    const fetchEnrolledSubjects = async () => {
      try {
        const res = await axios.get("/subjects/student", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setEnrolledSubjects(res.data);
      } catch (err) {
        setEnrolledSubjects([]);
      }
    };
    fetchAllSubjects();
    fetchEnrolledSubjects();
  }, []);

  const handleEnroll = async () => {
    if (!selectedSubjectId) return;
    try {
      await axios.post(
        "/subjects/enroll",
        { subjectId: selectedSubjectId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setMessage("Enrolled successfully!");
      if (onEnroll) onEnroll();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error enrolling");
    }
  };

  // Filter out already enrolled subjects
  const availableSubjects = allSubjects.filter(
    subj => !enrolledSubjects.some(enr => enr._id === subj._id)
  );

  return (
    <div>
      <h3>Enroll in a Subject</h3>
      <select
        value={selectedSubjectId}
        onChange={e => setSelectedSubjectId(e.target.value)}
      >
        <option value="">-- Select Subject --</option>
        {availableSubjects.map(subj => (
          <option key={subj._id} value={subj._id}>
            {subj.name} ({subj.code})
          </option>
        ))}
      </select>
      <button onClick={handleEnroll} disabled={!selectedSubjectId}>
        Enroll
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}