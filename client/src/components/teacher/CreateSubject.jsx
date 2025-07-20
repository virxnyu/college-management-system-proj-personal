import React, { useState } from "react";
import axios from "../../axios"; // Use the central axios instance

const CreateSubject = ({ onSubjectCreated }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      // --- THIS IS THE FIX ---
      // The URL is now '/subjects' which correctly maps to POST /api/subjects
      const res = await axios.post("/subjects", { name, code });
      
      setMessage("Subject created!");
      setName("");
      setCode("");
      if (onSubjectCreated) onSubjectCreated(res.data.subject);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating subject");
    }
  };

  return (
    // Using a div instead of a form to prevent default browser behavior
    // that can sometimes interfere with React state management. The button's
    // onClick handler will manage the submission logic.
    <div className="create-subject-container">
      <h3>Create New Subject</h3>
      <div className="form-group">
        <input
          type="text"
          placeholder="Subject Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Subject Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>
      <button onClick={handleSubmit}>Create</button>
      {message && <p style={{ color: 'var(--accent-success)', marginTop: '1rem' }}>{message}</p>}
      {error && <p style={{ color: 'var(--accent-danger)', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
};

export default CreateSubject;
