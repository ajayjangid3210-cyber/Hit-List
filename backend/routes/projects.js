const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(restrictTo('admin'), createProject);

router.route('/:id')
  .get(getProject)
  .put(restrictTo('admin'), updateProject)
  .delete(restrictTo('admin'), deleteProject);

router.post('/:id/members', restrictTo('admin'), addMember);
router.delete('/:id/members/:userId', restrictTo('admin'), removeMember);

module.exports = router;
