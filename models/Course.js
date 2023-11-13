const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a course title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  handouts: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Handouts',
    required: true,
  },
});

module.exports = mongoose.model('Course', courseSchema);
