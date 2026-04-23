const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Enrollment = require('../models/Enrollment');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Name check karo
    const existingName = await User.findOne({ 
      name: { $regex: new RegExp('^' + name.trim() + '$', 'i') } 
    });
    if (existingName) {
      return res.status(400).json({ message: 'An account with this name already exists.' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      email,
      password: hashedPassword,
      role: role || 'employee'
    });
    await user.save();

    // Ab employee record dhundo same name se aur enrollments link karo
    const employee = await Employee.findOne({
      name: { $regex: new RegExp('^' + name.trim() + '$', 'i') }
    });

    if (employee) {
      // Is employee ke saare enrollments mein userId add karo
      await Enrollment.updateMany(
        { employee: employee._id, userId: null },
        { $set: { userId: user._id } }
      );
    }

    res.status(201).json({ message: 'Account created successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;