const User = require('../models/User');
const asyncWrapper = require('../utils/asyncWrapper');

const getAllUsers = asyncWrapper(async (req, res) => {
  const users = await User.find().select('-__v');
  res.json({ success: true, count: users.length, users });
});

const getUserById = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id).select('-__v');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user });
});

const updateUser = asyncWrapper(async (req, res) => {
  const { name } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true, runValidators: true }
  ).select('-__v');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user });
});

module.exports = { getAllUsers, getUserById, updateUser };
