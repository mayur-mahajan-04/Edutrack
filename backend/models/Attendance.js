const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true, index: true },
  date: { type: Date, default: () => { const d = new Date(); d.setHours(0,0,0,0); return d; }, index: true },
  status: { type: String, enum: ['present', 'absent'], default: 'present' },
  markedAt: { type: Date, default: Date.now },
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  verificationMethod: { type: String, enum: ['qr', 'face', 'manual'], required: true },
  qrCodeId: { type: String },
  faceVerified: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Optimized indexes
attendanceSchema.index({ student: 1, date: -1 });
attendanceSchema.index({ teacher: 1, subject: 1, date: -1 });
attendanceSchema.index({ date: -1, status: 1 });
attendanceSchema.index({ student: 1, date: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);