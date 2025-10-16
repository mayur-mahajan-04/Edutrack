const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  division: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['lecture', 'practical'],
    default: 'lecture'
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Class', classSchema);