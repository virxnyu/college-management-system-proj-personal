// Place this in your teacher dashboard or as a separate component

import React, { useState } from "react";
import axios from "axios";

const CreateSubject = ({ onSubjectCreated }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/subjects/create",
        { name, code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Subject created!");
      setName("");
      setCode("");
      if (onSubjectCreated) onSubjectCreated(res.data.subject);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error creating subject");
    }
  };

  return (
    <div>
      <h3>Create New Subject</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Subject Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Subject Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit">Create</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateSubject;