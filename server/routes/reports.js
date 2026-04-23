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
    const { days, course } = req.query;
    let baseFilter = {};
    if (days && days !== 'all') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(days));
      baseFilter.enrolledDate = { $gte: cutoff };
    }

    if (course && course !== 'all') {
      // Find course by title first or use provided title (depends on how frontend sends it)
      const program = await Program.findOne({ title: course });
      if (program) {
        baseFilter.program = program._id;
      } else {
        // If course is a title but not found as ID
        baseFilter.program = course; 
      }
    }

    const totalEmployees = await Employee.countDocuments();
    const totalPrograms = await Program.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments(baseFilter);

    const completed = await Enrollment.countDocuments({ ...baseFilter, status: 'completed' });
    const inProgress = await Enrollment.countDocuments({ ...baseFilter, status: 'in-progress' });
    const enrolled = await Enrollment.countDocuments({ ...baseFilter, status: 'enrolled' });
    const cancelled = await Enrollment.countDocuments({ ...baseFilter, status: 'cancelled' });

    // Program wise enrollment count
    let programMatch = {};
    if (days && days !== 'all') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(days));
      programMatch.enrolledDate = { $gte: cutoff };
    }

    const programWise = await Enrollment.aggregate([
      { $match: programMatch },
      {
        $group: {
          _id: '$program',
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
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
          count: 1,
          completed: 1,
          cancelled: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Enrollment Trend
    const trendDays = days && days !== 'all' ? parseInt(days) : 30;
    const trendCutoff = new Date();
    trendCutoff.setDate(trendCutoff.getDate() - trendDays);
    
    let trendFilter = { enrolledDate: { $gte: trendCutoff } };
    if (course && course !== 'all') {
      const p = await Program.findOne({ title: course });
      if (p) trendFilter.program = p._id;
    }

    const enrollmentTrend = await Enrollment.aggregate([
      { $match: trendFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$enrolledDate" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Recent Activity Feed
    const recentEnrollments = await Enrollment.find()
      .populate('userId', 'name')
      .populate('employee', 'name')
      .populate('program', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentFeedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const activityFeed = [
      ...recentEnrollments.map(e => ({
        type: 'enrollment',
        user: (e.userId ? e.userId.name : (e.employee ? e.employee.name : 'Unknown')),
        item: e.program ? e.program.title : 'Program',
        date: e.createdAt
      })),
      ...recentFeedback.map(f => ({
        type: 'feedback',
        user: f.empName,
        item: f.course,
        stars: f.stars,
        date: f.createdAt
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

    // Feedback Stats
    let feedbackBaseFilter = {};
    if (days && days !== 'all') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(days));
      feedbackBaseFilter.date = { $gte: cutoff };
    }
    if (course && course !== 'all') {
      feedbackBaseFilter.course = course;
    }

    const filteredFeedback = await Feedback.find(feedbackBaseFilter);
    const totalFeedback = filteredFeedback.length;
    const avgRating = totalFeedback > 0 ? (filteredFeedback.reduce((a, b) => a + b.stars, 0) / totalFeedback) : 0;
    
    const ratingPerProgram = await Feedback.aggregate([
      { $match: feedbackBaseFilter },
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
      enrollmentTrend,
      activityFeed,
      feedback: {
        totalFeedback,
        avgRating,
        ratingPerProgram
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;