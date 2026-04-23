const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const Enrollment = require('../models/Enrollment');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const programs = await Program.find();
    res.json(programs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, duration, type, trainer, startDate, endDate } = req.body;
    const program = new Program({ title, description, duration, type, trainer, startDate, endDate });
    await program.save();
    res.status(201).json({ message: 'Program added!', program });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!program) return res.status(404).json({ message: 'Not found.' });
    res.json({ message: 'Updated!', program });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Enrollment.deleteMany({ program: req.params.id });
    const result = await Program.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Not found.' });
    res.json({ message: 'Deleted!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Seed 10 pre-defined tech courses
router.post('/seed', authMiddleware, async (req, res) => {
  try {
    const programs = [
      { title: 'Web Development Fundamentals', description: 'Master HTML, CSS, JavaScript and responsive design principles.', duration: '4 weeks', type: 'online', trainer: 'Amit Kumar', startDate: new Date('2026-05-01'), endDate: new Date('2026-05-28') },
      { title: 'React.js Complete Guide', description: 'Build modern SPAs using React, hooks, state management and routing.', duration: '3 weeks', type: 'online', trainer: 'Priya Sharma', startDate: new Date('2026-05-01'), endDate: new Date('2026-05-21') },
      { title: 'Node.js & Express Backend', description: 'Create scalable REST APIs using Node.js, Express and middleware patterns.', duration: '3 weeks', type: 'online', trainer: 'Rahul Verma', startDate: new Date('2026-05-05'), endDate: new Date('2026-05-25') },
      { title: 'MongoDB Database Management', description: 'Learn NoSQL database design, CRUD operations and Mongoose ODM.', duration: '2 weeks', type: 'online', trainer: 'Sneha Patel', startDate: new Date('2026-05-10'), endDate: new Date('2026-05-24') },
      { title: 'Python Programming', description: 'Master Python from basics to advanced — OOP, file handling and libraries.', duration: '5 weeks', type: 'hybrid', trainer: 'Vikram Singh', startDate: new Date('2026-05-01'), endDate: new Date('2026-06-05') },
      { title: 'Data Structures & Algorithms', description: 'Essential DSA concepts — arrays, trees, graphs, sorting and searching.', duration: '6 weeks', type: 'online', trainer: 'Arjun Mehta', startDate: new Date('2026-05-01'), endDate: new Date('2026-06-12') },
      { title: 'Cloud Computing with AWS', description: 'AWS services overview — EC2, S3, Lambda, IAM and cloud architecture.', duration: '4 weeks', type: 'online', trainer: 'Neha Gupta', startDate: new Date('2026-05-15'), endDate: new Date('2026-06-12') },
      { title: 'Cybersecurity Fundamentals', description: 'Network security, ethical hacking basics, encryption and threat prevention.', duration: '3 weeks', type: 'offline', trainer: 'Rajesh Kumar', startDate: new Date('2026-05-10'), endDate: new Date('2026-05-31') },
      { title: 'Machine Learning Basics', description: 'Intro to ML — supervised learning, regression, classification and scikit-learn.', duration: '5 weeks', type: 'online', trainer: 'Dr. Anita Roy', startDate: new Date('2026-05-01'), endDate: new Date('2026-06-05') },
      { title: 'DevOps & CI/CD Pipeline', description: 'Git, Docker, Jenkins, CI/CD workflows and deployment automation.', duration: '4 weeks', type: 'hybrid', trainer: 'Suresh Yadav', startDate: new Date('2026-05-15'), endDate: new Date('2026-06-12') }
    ];

    // Check existing titles aur sirf naye add karo
    const existing = await Program.find({}, 'title');
    const existingTitles = existing.map(p => p.title.toLowerCase());
    const newPrograms = programs.filter(p => !existingTitles.includes(p.title.toLowerCase()));

    if (newPrograms.length === 0) {
      return res.status(400).json({ message: 'All 10 tech programs already exist!' });
    }

    await Program.insertMany(newPrograms);
    res.json({ message: `${newPrograms.length} new tech programs added successfully!` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;