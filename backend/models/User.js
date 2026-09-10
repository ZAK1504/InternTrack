const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'company'],
    required: true,
  },
  companyName: {
    type: String,
    // Only required if role is company
    required: function() {
      return this.role === 'company';
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
