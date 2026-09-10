const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeUrl: {
    type: String,
    required: true
  },
  resumeText: {
    type: String,
    required: true
  },
  pitch: {
    type: String,
  },
  aiScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  aiExplanation: {
    type: String,
    default: null
  },
  aiSummary: {
    type: String,
    default: null
  },
  aiStrengths: {
    type: [String],
    default: []
  },
  aiWeaknesses: {
    type: [String],
    default: []
  },
  aiRecommendation: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected'],
    default: 'applied'
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
