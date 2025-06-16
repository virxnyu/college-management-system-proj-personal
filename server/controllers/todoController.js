const Todo = require('../models/Todo');

exports.getTodos = async (req, res) => {
  try {
    const { studentId, date } = req.params;
    const todos = await Todo.findOne({ studentId, date });
    res.json(todos || { studentId, date, tasks: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addTodo = async (req, res) => {
  const { studentId, date, text } = req.body;
  try {
    let todoDoc = await Todo.findOne({ studentId, date });

    if (!todoDoc) {
      todoDoc = new Todo({ studentId, date, tasks: [{ text }] });
    } else {
      todoDoc.tasks.push({ text });
    }

    await todoDoc.save();
    res.json(todoDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTodo = async (req, res) => {
  const { todoId } = req.params;
  const { taskIndex, text, completed } = req.body;

  try {
    const todoDoc = await Todo.findById(todoId);
    if (todoDoc && todoDoc.tasks[taskIndex]) {
      if (text !== undefined) todoDoc.tasks[taskIndex].text = text;
      if (completed !== undefined) todoDoc.tasks[taskIndex].completed = completed;
      await todoDoc.save();
      res.json(todoDoc);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTodo = async (req, res) => {
  const { todoId } = req.params;
  const { taskIndex } = req.body;

  try {
    const todoDoc = await Todo.findById(todoId);
    if (todoDoc && todoDoc.tasks[taskIndex]) {
      todoDoc.tasks.splice(taskIndex, 1);
      await todoDoc.save();
      res.json(todoDoc);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
