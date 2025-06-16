const express = require('express');
const router = express.Router();
const {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
} = require('../controllers/todoController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.get('/:studentId/:date', verifyToken, requireRole('student'), getTodos);
router.post('/', verifyToken, requireRole('student'), addTodo);
router.put('/:todoId', verifyToken, requireRole('student'), updateTodo);
router.delete('/:todoId', verifyToken, requireRole('student'), deleteTodo);

module.exports = router;
