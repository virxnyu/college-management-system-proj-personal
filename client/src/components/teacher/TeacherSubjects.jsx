import React, { useEffect, useState } from "react";
import axios from "axios";

const TeacherSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/subjects/teacher",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubjects(res.data);
      } catch (err) {
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  if (loading) return <p>Loading subjects...</p>;

  return (
    <div>
      <h3>Your Subjects</h3>
      {subjects.length === 0 ? (
        <p>You are not handling any subjects yet.</p>
      ) : (
        <ul>
          {subjects.map((subj) => (
            <li key={subj._id}>
              {subj.name} ({subj.code})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeacherSubjects;