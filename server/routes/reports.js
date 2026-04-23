const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Employee = require('../models/Employee');
const Program = require('../models/Program');
const Feedback = require('../models/Feedback');
const authMiddleware = require('../middleware/auth');

// Sabhi stats ek saath lao
router.get('/', authMiddleware, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalPrograms = await Program.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();

    const completed = await Enrollment.countDocuments({ status: 'completed' });
    const inProgress = await Enrollment.countDocuments({ status: 'in-progress' });
    const enrolled = await Enrollment.countDocuments({ status: 'enrolled' });
    const cancelled = await Enrollment.countDocuments({ status: 'cancelled' });

    // Program wise enrollment count
    const programWise = await Enrollment.aggregate([
      {
        $group: {
          _id: '$program',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'programs',
          localField: '_id',
          foreignField: '_id',
          as: 'program'
        }
      },
      { $unwind: '$program' },
      {
        $project: {
          title: '$program.title',
          count: 1
        }
      }
    ]);

    // Feedback Stats
    const allFeedback = await Feedback.find();
    const totalFeedback = allFeedback.length;
    const avgRating = totalFeedback > 0 ? (allFeedback.reduce((a, b) => a + b.stars, 0) / totalFeedback) : 0;
    
    // Feedback Types Breakdown
    const feedbackTypes = await Feedback.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Avg Rating per Program
    const ratingPerProgram = await Feedback.aggregate([
      { $group: { _id: '$course', avg: { $avg: '$stars' }, count: { $sum: 1 } } }
    ]);

    res.json({
      totalEmployees,
      totalPrograms,
      totalEnrollments,
      completed,
      inProgress,
      enrolled,
      cancelled,
      programWise,
      feedback: {
        totalFeedback,
        avgRating,
        feedbackTypes,
        ratingPerProgram
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;