const mongoose = require('mongoose');

const FB_Schema = new mongoose.Schema({
  empName: { type: String, required: true },
  email: { type: String },
  course: { type: String, required: true },
  type: { type: String, required: true },
  text: { type: String, required: true },
  improve: { type: String },
  recommend: { type: String },
  stars: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', FB_Schema);
