require('dotenv').config();
const mongoose = require('mongoose');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  const Project = require('./models/Project');
  const Task = require('./models/Task');

  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});

  // Create Admin
  const admin = await User.create({
    name: 'Admin User', email: 'admin@test.com',
    password: 'Admin@123456', role: 'admin'
  });

  // Create 5 Members
  const m1 = await User.create({ name: 'Alice Smith', email: 'alice@test.com', password: 'Member@123456', role: 'member' });
  const m2 = await User.create({ name: 'Bob Johnson', email: 'bob@test.com', password: 'Member@123456', role: 'member' });
  const m3 = await User.create({ name: 'Charlie Brown', email: 'charlie@test.com', password: 'Member@123456', role: 'member' });
  const m4 = await User.create({ name: 'Diana Prince', email: 'diana@test.com', password: 'Member@123456', role: 'member' });
  const m5 = await User.create({ name: 'Evan Wright', email: 'evan@test.com', password: 'Member@123456', role: 'member' });

  // Create Projects
  const p1 = await Project.create({
    title: 'Website Redesign',
    description: 'Overhaul the company website to the new Floema UI.',
    members: [admin._id, m1._id, m2._id, m3._id],
    createdBy: admin._id
  });

  const p2 = await Project.create({
    title: 'Mobile App MVP',
    description: 'Initial release of the iOS and Android applications.',
    members: [admin._id, m4._id, m5._id, m1._id],
    createdBy: admin._id
  });

  const p3 = await Project.create({
    title: 'Marketing Campaign',
    description: 'Q3 outreach and social media marketing push.',
    members: [admin._id, m2._id, m3._id, m4._id],
    createdBy: admin._id
  });

  const now = Date.now();
  const day = 86400000;

  // Create Tasks
  await Task.create([
    // Website Redesign Tasks
    { title: 'Create wireframes', project: p1._id, assignedTo: m1._id, status: 'done', priority: 'medium', dueDate: new Date(now - 2 * day), createdBy: admin._id },
    { title: 'Develop homepage', project: p1._id, assignedTo: m2._id, status: 'in-progress', priority: 'high', dueDate: new Date(now + 1 * day), createdBy: admin._id },
    { title: 'Setup database', project: p1._id, assignedTo: m3._id, status: 'done', priority: 'high', dueDate: new Date(now - 5 * day), createdBy: admin._id },
    { title: 'Write integration tests', project: p1._id, assignedTo: m1._id, status: 'todo', priority: 'low', dueDate: new Date(now + 4 * day), createdBy: admin._id },

    // Mobile App MVP Tasks
    { title: 'Design app icon', project: p2._id, assignedTo: m4._id, status: 'todo', priority: 'low', dueDate: new Date(now + 3 * day), createdBy: admin._id },
    { title: 'Implement auth module', project: p2._id, assignedTo: m5._id, status: 'in-progress', priority: 'high', dueDate: new Date(now - 1 * day), createdBy: admin._id }, // Overdue!
    { title: 'Push notifications', project: p2._id, assignedTo: m1._id, status: 'todo', priority: 'medium', dueDate: new Date(now + 7 * day), createdBy: admin._id },
    { title: 'App Store submission', project: p2._id, assignedTo: m4._id, status: 'todo', priority: 'high', dueDate: new Date(now + 14 * day), createdBy: admin._id },

    // Marketing Campaign Tasks
    { title: 'Write blog post', project: p3._id, assignedTo: m2._id, status: 'done', priority: 'medium', dueDate: new Date(now - 1 * day), createdBy: admin._id },
    { title: 'Social media assets', project: p3._id, assignedTo: m3._id, status: 'in-progress', priority: 'medium', dueDate: new Date(now), createdBy: admin._id },
    { title: 'Email newsletter prep', project: p3._id, assignedTo: m4._id, status: 'todo', priority: 'high', dueDate: new Date(now + 1 * day), createdBy: admin._id },
    { title: 'Analyze ad performance', project: p3._id, assignedTo: m2._id, status: 'in-progress', priority: 'low', dueDate: new Date(now - 3 * day), createdBy: admin._id } // Overdue!
  ]);

  console.log('✅ Seed done!');
  console.log('Admin: admin@test.com / Admin@123456');
  console.log('Members: alice@test.com, bob@test.com, charlie@test.com, diana@test.com, evan@test.com / Member@123456');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
