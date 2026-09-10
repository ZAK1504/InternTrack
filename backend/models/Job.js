const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['internship', 'full-time'],
    required: true
  },
  skills: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
