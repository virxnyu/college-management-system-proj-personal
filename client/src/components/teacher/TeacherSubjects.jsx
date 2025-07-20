import React, { useEffect, useState } from "react";
import axios from "../../axios";
import './TeacherSubjects.css'; // --- 1. IMPORT THE NEW CSS FILE ---

const TeacherSubjects = ({ refreshTrigger }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get("/subjects/teacher");
        setSubjects(res.data);
      } catch (err) {
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [refreshTrigger]);

  if (loading) return <p>Loading subjects...</p>;

  return (
    // --- 2. USE NEW CSS CLASSES FOR STYLING ---
    <div className="teacher-subjects-container">
      <h3>Your Subjects</h3>
      {subjects.length === 0 ? (
        <p className="no-subjects-message">You have not created any subjects yet.</p>
      ) : (
        <div className="subjects-list">
          {subjects.map((subj) => (
            <div key={subj._id} className="subject-item">
              <span className="subject-name">{subj.name}</span>
              <span className="subject-code">{subj.code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherSubjects;
