const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Employee = require('../models/Employee');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('employee', 'name email department')
      .populate('userId', 'name email')
      .populate('program', 'title trainer duration type');
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/my-enrollments', authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id })
      .populate('program', 'title trainer duration type description startDate endDate');
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { employee, program } = req.body;
    if (!employee || !program) return res.status(400).json({ message: 'Employee and program required.' });
    const existing = await Enrollment.findOne({ employee, program });
    if (existing) return res.status(400).json({ message: 'Employee already enrolled!' });
    const emp = await Employee.findById(employee);
    let userId = null;
    if (emp) {
      const userAccount = await User.findOne({ name: { $regex: new RegExp('^' + emp.name.trim() + '$', 'i') } });
      if (userAccount) userId = userAccount._id;
    }
    const enrollment = new Enrollment({ employee, program, userId });
    await enrollment.save();
    res.status(201).json({ message: 'Assigned!', enrollment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, progress } = req.body;
    const updateData = { status, progress };
    if (status === 'completed') updateData.completedDate = Date.now();
    const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!enrollment) return res.status(404).json({ message: 'Not found.' });
    res.json({ message: 'Updated!', enrollment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Enrollment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Removed!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;