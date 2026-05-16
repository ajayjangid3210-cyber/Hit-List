const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getDashboardStats
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

router.use(protect);

router.get('/dashboard', getDashboardStats);

router.route('/')
  .get(getTasks)
  .post(restrictTo('admin'), createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(restrictTo('admin'), deleteTask);

module.exports = router;
