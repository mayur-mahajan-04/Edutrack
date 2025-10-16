const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipients: {
    year: { type: Number, required: true },
    division: { type: String, required: true },
    department: { type: String, required: true }
  },
  isRead: [{ 
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);