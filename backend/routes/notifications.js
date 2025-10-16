const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Send notification (Teachers only)
router.post('/send', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can send notifications' });
    }

    const { title, message, type, year, division, department } = req.body;

    const notification = new Notification({
      title,
      message,
      type,
      sender: req.user.id,
      recipients: { year, division, department }
    });

    await notification.save();
    res.json({ message: 'Notification sent successfully', notification });
  } catch (error) {
    console.error('Send notification error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all notifications for student with optional filters
router.get('/student', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view notifications' });
    }

    const { year, division, department } = req.query;
    const query = { isActive: true };

    if (year) query['recipients.year'] = parseInt(year);
    if (division) query['recipients.division'] = division;
    if (department) query['recipients.department'] = department;

    const notifications = await Notification.find(query)
      .populate('sender', 'name')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const alreadyRead = notification.isRead.find(r => r.student.toString() === req.user.id);
    if (!alreadyRead) {
      notification.isRead.push({ student: req.user.id });
      await notification.save();
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark read error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;