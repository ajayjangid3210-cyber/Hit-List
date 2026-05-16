const Project = require('../models/Project');
const asyncWrapper = require('../utils/asyncWrapper');

const createProject = asyncWrapper(async (req, res) => {
  req.body.createdBy = req.user._id;

  const project = await Project.create(req.body);
  res.status(201).json({ success: true, project });
});

const getProjects = asyncWrapper(async (req, res) => {
  let projects;

  if (req.user.role === 'admin') {
    projects = await Project.find()
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort('-createdAt');
  } else {
    projects = await Project.find({ members: req.user._id })
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort('-createdAt');
  }

  res.json({ success: true, count: projects.length, projects });
});

const getProject = asyncWrapper(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('members', 'name email role');

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (req.user.role !== 'admin' && !project.members.some(m => m._id.toString() === req.user._id.toString())) {
    return res.status(403).json({ success: false, message: 'You are not a member of this project' });
  }

  res.json({ success: true, project });
});

const updateProject = asyncWrapper(async (req, res) => {
  let project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('createdBy', 'name email').populate('members', 'name email');

  res.json({ success: true, project });
});

const deleteProject = asyncWrapper(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  await project.deleteOne();
  res.json({ success: true, message: 'Project deleted' });
});

const addMember = asyncWrapper(async (req, res) => {
  const { userId } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (project.members.includes(userId)) {
    return res.status(400).json({ success: false, message: 'User is already a member of this project' });
  }

  project.members.push(userId);
  await project.save();

  const updated = await Project.findById(project._id)
    .populate('createdBy', 'name email')
    .populate('members', 'name email role');

  res.json({ success: true, project: updated });
});

const removeMember = asyncWrapper(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  project.members = project.members.filter(m => m.toString() !== req.params.userId);
  await project.save();

  const updated = await Project.findById(project._id)
    .populate('createdBy', 'name email')
    .populate('members', 'name email role');

  res.json({ success: true, project: updated });
});

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
