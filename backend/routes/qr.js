const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const QRCodeModel = require('../models/QRCode');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Generate QR Code (Teachers only)
router.post('/generate', auth, authorize('teacher'), async (req, res) => {
  try {
    const { subject, duration = 10, latitude, longitude, radius = 20 } = req.body;

    if (!subject || !latitude || !longitude) {
      return res.status(400).json({ message: 'Subject and location are required' });
    }

    const qrData = uuidv4();
    const expiresAt = new Date(Date.now() + duration * 60 * 1000); // duration in minutes

    const qrCodeDoc = new QRCodeModel({
      teacher: req.user._id,
      subject,
      qrData,
      expiresAt,
      location: { latitude, longitude, radius }
    });

    await qrCodeDoc.save();

    const qrCodeImage = await QRCode.toDataURL(JSON.stringify({
      id: qrCodeDoc._id,
      data: qrData,
      subject,
      teacher: req.user.name,
      expiresAt
    }));

    res.json({
      qrCode: qrCodeImage,
      qrData: qrCodeDoc._id,
      expiresAt,
      subject
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Validate QR Code
router.post('/validate', auth, authorize('student'), async (req, res) => {
  try {
    const { qrCodeId, latitude, longitude } = req.body;

    if (!qrCodeId) {
      return res.status(400).json({ message: 'QR code ID is required' });
    }

    const qrCode = await QRCodeModel.findById(qrCodeId).populate('teacher', 'name').lean();

    if (!qrCode || !qrCode.isActive) {
      return res.status(400).json({ message: 'Invalid or expired QR code' });
    }

    if (new Date() > qrCode.expiresAt) {
      await QRCodeModel.findByIdAndUpdate(qrCodeId, { isActive: false });
      return res.status(400).json({ message: 'QR code has expired' });
    }

    // Location validation (only if both student and QR have location data)
    if (latitude && longitude && qrCode.location && qrCode.location.latitude && qrCode.location.longitude) {
      const distance = calculateDistance(
        parseFloat(latitude), parseFloat(longitude),
        parseFloat(qrCode.location.latitude), parseFloat(qrCode.location.longitude)
      );
      
      const requiredRadius = qrCode.location.radius || 20;
      
      console.log(`Location validation: Student(${latitude}, ${longitude}) vs QR(${qrCode.location.latitude}, ${qrCode.location.longitude}) = ${distance}m (limit: ${requiredRadius}m)`);
      
      if (distance > requiredRadius) {
        return res.status(400).json({ 
          message: `You are ${Math.round(distance)}m away from the class location. You must be within ${requiredRadius}m to mark attendance.`,
          distance: Math.round(distance),
          requiredRadius,
          tooFar: true
        });
      }
    }

    res.json({
      valid: true,
      subject: qrCode.subject,
      teacher: qrCode.teacher,
      qrCodeId: qrCode._id
    });
  } catch (error) {
    console.error('QR validation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get live attendance for QR code
router.get('/:qrId/attendance', auth, authorize('teacher'), async (req, res) => {
  try {
    const { qrId } = req.params;
    const Attendance = require('../models/Attendance');
    
    const attendance = await Attendance.find({ qrCodeId: qrId })
      .populate('student', 'name studentId')
      .sort({ markedAt: -1 });
    
    res.json(attendance);
  } catch (error) {
    console.error('Get live attendance error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Validate inputs
  if (!lat1 || !lon1 || !lat2 || !lon2 || 
      isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    console.error('Invalid coordinates for distance calculation:', { lat1, lon1, lat2, lon2 });
    return Infinity; // Return large distance for invalid coordinates
  }
  
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

module.exports = router;