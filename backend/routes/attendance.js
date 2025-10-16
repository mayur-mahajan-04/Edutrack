const express = require('express');
const Attendance = require('../models/Attendance');
const QRCodeModel = require('../models/QRCode');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Mark attendance via QR code
router.post('/mark', auth, authorize('student'), async (req, res) => {
  try {
    const { qrCodeId, latitude, longitude, faceVerified = false } = req.body;

    const qrCode = await QRCodeModel.findById(qrCodeId).populate('teacher');
    if (!qrCode || !qrCode.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive QR code' });
    }

    // Check if QR code has expired
    if (new Date() > qrCode.expiresAt) {
      return res.status(400).json({ message: 'QR code has expired' });
    }

    // Check if attendance already marked for this subject today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const existingAttendance = await Attendance.findOne({
      student: req.user._id,
      subject: qrCode.subject,
      date: { $gte: today, $lt: tomorrow }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this subject today' });
    }

    const attendance = new Attendance({
      student: req.user._id,
      teacher: qrCode.teacher._id,
      subject: qrCode.subject,
      location: { latitude, longitude },
      verificationMethod: 'qr',
      qrCodeId,
      faceVerified
    });

    const savedAttendance = await attendance.save();
    res.json({ message: 'Attendance marked successfully', attendance: savedAttendance });
  } catch (error) {
    console.error('Mark attendance error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student attendance history
router.get('/student', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.user._id })
      .populate('teacher', 'name')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error('Fetch attendance error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student attendance by student ID (for teachers)
router.get('/student/:studentId', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const attendance = await Attendance.find({ student: studentId })
      .populate('teacher', 'name')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error('Fetch student attendance error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get class attendance (Teachers and Admins)
router.get('/class', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { subject, date } = req.query;

    // Validate and sanitize subject input
    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({ message: 'Valid subject is required' });
    }

    // Subject: exact, case-insensitive match
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const subjectFilter = { $regex: new RegExp(`^${esc(subject.trim())}$`, 'i') };

    // Date range support
    const dayBoundsLocal = (dateStr) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
      const [y, m, d] = dateStr.split('-').map(Number);
      const start = new Date(y, m - 1, d, 0, 0, 0, 0);
      const end = new Date(y, m - 1, d + 1, 0, 0, 0, 0);
      return { start, end };
    };

    let dateFilter = {};
    if (req.query.startDate && req.query.endDate) {
      const startBounds = dayBoundsLocal(req.query.startDate);
      const endBounds = dayBoundsLocal(req.query.endDate);
      if (!startBounds || !endBounds) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      dateFilter = { date: { $gte: startBounds.start, $lt: endBounds.end } };
    } else if (date) {
      const bounds = dayBoundsLocal(date);
      if (!bounds) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      dateFilter = { date: { $gte: bounds.start, $lt: bounds.end } };
    }

    const attendance = await Attendance.find({
      subject: subjectFilter,
      ...dateFilter,
      ...(req.user.role === 'teacher' ? { teacher: req.user._id } : {})
    })
      .populate('student', 'name studentId department semester')
      .populate('teacher', 'name')
      .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error('Fetch class attendance error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});



// Submit final attendance (Teachers)
router.post('/submit', auth, authorize('teacher'), async (req, res) => {
  try {
    const { qrCodeId, attendanceList } = req.body;
    
    // Mark QR code as inactive
    await QRCodeModel.findByIdAndUpdate(qrCodeId, { isActive: false });
    
    res.json({ message: 'Attendance submitted successfully', count: attendanceList.length });
  } catch (error) {
    console.error('Submit attendance error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance statistics (Admin only)
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today }
    });

    const attendanceBySubject = await Attendance.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalStudents,
      totalTeachers,
      todayAttendance,
      attendanceBySubject
    });
  } catch (error) {
    console.error('Fetch stats error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;