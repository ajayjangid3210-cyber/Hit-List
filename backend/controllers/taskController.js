const Task = require('../models/Task');
const asyncWrapper = require('../utils/asyncWrapper');

const createTask = asyncWrapper(async (req, res) => {
  req.body.createdBy = req.user._id;

  const task = await Task.create(req.body);
  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('project', 'title')
    .populate('createdBy', 'name email');

  res.status(201).json({ success: true, task: populated });
});

const getTasks = asyncWrapper(async (req, res) => {
  const filter = {};

  if (req.query.projectId) filter.project = req.query.projectId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;

  if (req.user.role !== 'admin') {
    filter.assignedTo = req.user._id;
  }

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email')
    .populate('project', 'title')
    .populate('createdBy', 'name email')
    .sort('-createdAt');

  res.json({ success: true, count: tasks.length, tasks });
});

const getTask = asyncWrapper(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('project', 'title')
    .populate('createdBy', 'name email');

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  res.json({ success: true, task });
});

const updateTask = asyncWrapper(async (req, res) => {
  let task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  if (req.user.role === 'member') {
    if (task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only update tasks assigned to you' });
    }
    const { status } = req.body;
    task.status = status;
    await task.save();
  } else {
    Object.assign(task, req.body);
    await task.save();
  }

  const updated = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('project', 'title')
    .populate('createdBy', 'name email');

  res.json({ success: true, task: updated });
});

const deleteTask = async (req, res, next) => {
  try {
    console.log('DELETE request for task:', req.params.id);
    console.log('User role:', req.user?.role);
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    console.log('Task deleted successfully:', req.params.id);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Task deleted successfully' 
    });
  } catch (err) {
    console.error('Delete error:', err);
    next(err);
  }
};

const getDashboardStats = asyncWrapper(async (req, res) => {
  let filter = {};
  if (req.user.role !== 'admin') {
    filter.assignedTo = req.user._id;
  }

  const allTasks = await Task.find(filter);

  const now = new Date();
  let overdue = 0;
  for (const t of allTasks) {
    if (t.dueDate && new Date(t.dueDate) < now && t.status !== 'done') {
      overdue++;
    }
  }

  const total = allTasks.length;
  const completed = allTasks.filter(t => t.status === 'done').length;
  const pending = allTasks.filter(t => t.status === 'in-progress').length;

  res.json({
    success: true,
    stats: { total, completed, pending, overdue }
  });
});

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getDashboardStats
};
