const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true, index: true },
  qrData: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    radius: { type: Number, default: 100, min: 10, max: 1000 } // meters
  },
  isActive: { type: Boolean, default: true, index: true },
  usageCount: { type: Number, default: 0 },
  maxUsage: { type: Number, default: 100 }
}, {
  timestamps: true
});

// TTL index for automatic cleanup
qrCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes for better query performance
qrCodeSchema.index({ teacher: 1, subject: 1, isActive: 1 });
qrCodeSchema.index({ qrData: 1, isActive: 1 });
qrCodeSchema.index({ createdAt: 1, isActive: 1 });

module.exports = mongoose.model('QRCode', qrCodeSchema);