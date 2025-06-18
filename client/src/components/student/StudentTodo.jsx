import React, { useState, useEffect } from "react";

const StudentTodo = () => {
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);
  const [todoDocId, setTodoDocId] = useState(null);

  const token = localStorage.getItem("token");
  const studentId = JSON.parse(atob(token.split(".")[1])).id;
  const today = new Date().toISOString().split("T")[0];

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/todos/${studentId}/${today}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.tasks) {
          setTodos(data.tasks);
          setTodoDocId(data._id);
        }
      })
      .catch((err) => console.error("Failed to load todos:", err));
  }, [studentId, today, token]);

  const handleAdd = () => {
    if (task.trim() === "") return;

    fetch("http://localhost:5000/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ studentId, date: today, text: task }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTodos(data.tasks);
        setTodoDocId(data._id);
        setTask("");
      })
      .catch((err) => console.error("Failed to add todo:", err));
  };

  const handleDelete = (index) => {
    fetch(`http://localhost:5000/api/todos/${todoDocId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ taskIndex: index }),
    })
      .then((res) => res.json())
      .then((data) => setTodos(data.tasks))
      .catch((err) => console.error("Failed to delete todo:", err));
  };

  const handleToggleComplete = (index) => {
  fetch(`http://localhost:5000/api/todos/${todoDocId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      taskIndex: index,
      completed: !todos[index].completed,
    }),
  })
    .then((res) => res.json())
    .then((data) => setTodos(data.tasks))
    .catch((err) => console.error("Failed to toggle completion:", err));
};

const handleEdit = (index) => {
  setEditingIndex(index);
  setEditedText(todos[index].text);
};

const handleSaveEdit = (index) => {
  fetch(`http://localhost:5000/api/todos/${todoDocId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      taskIndex: index,
      text: editedText,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      setTodos(data.tasks);
      setEditingIndex(null);
      setEditedText("");
    })
    .catch((err) => console.error("Failed to edit task:", err));
};



  return (
  <div className="todo-container">
    <h1>📝 Student To-Do List</h1>

    <div>
      <input
        type="text"
        value={task}
        placeholder="Enter a task"
        onChange={(e) => setTask(e.target.value)}
      />
      <button onClick={handleAdd}>Add</button>
    </div>

    <ul>
      {todos.map((item, index) => (
        <li key={index} className={item.completed ? "completed" : ""}>
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => handleToggleComplete(index)}
          />

          {editingIndex === index ? (
            <>
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
              />
              <button onClick={() => handleSaveEdit(index)}>💾</button>
              <button onClick={() => setEditingIndex(null)}>❌</button>
            </>
          ) : (
            <>
              <span>{item.text}</span>
              <button onClick={() => handleEdit(index)}>✏️</button>
              <button onClick={() => handleDelete(index)}>🗑️</button>
            </>
          )}
        </li>
      ))}
    </ul>
  </div>
);


};

export default StudentTodo;
