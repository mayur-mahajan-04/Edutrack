const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  year: { type: Number, required: true }, // 1, 2, 3, 4
  division: { type: String, required: true }, // A, B, C
  day: { type: String, required: true }, // Monday, Tuesday, etc.
  timeSlot: { type: String, required: true }, // 9:00-10:00
  subject: { type: String, required: true },
  teacher: { 
    type: String, 
    required: function() { return this.type !== 'break'; }
  },
  room: { 
    type: String, 
    required: function() { return this.type !== 'break'; }
  },
  type: { type: String, enum: ['lecture', 'practical', 'break'], default: 'lecture' },
  department: { type: String, required: true },
  duration: { type: Number, default: 60 }, // in minutes
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

timetableSchema.index({ year: 1, division: 1, day: 1, department: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);