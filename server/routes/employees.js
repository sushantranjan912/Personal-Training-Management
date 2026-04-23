const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const User = require('../models/user');
const Enrollment = require('../models/Enrollment');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/registered-users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: 'employee' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, department, position } = req.body;
    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists.' });
    }
    const employee = new Employee({ name, email, phone, department, position });
    await employee.save();
    const existingUser = await User.findOne({
      name: { $regex: new RegExp('^' + name.trim() + '$', 'i') }
    });
    if (existingUser) {
      await Enrollment.updateMany(
        { employee: employee._id, userId: null },
        { $set: { userId: existingUser._id } }
      );
    }
    res.status(201).json({ message: 'Employee added successfully!', employee });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    res.json({ message: 'Employee updated successfully!', employee });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Deleting employee:', req.params.id);
    await Enrollment.deleteMany({ employee: req.params.id });
    const result = await Employee.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Employee not found.' });
    console.log('Employee deleted successfully');
    res.json({ message: 'Employee deleted successfully!' });
  } catch (err) {
    console.log('Delete error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;