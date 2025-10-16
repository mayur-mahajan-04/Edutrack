const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { role, department } = req.query;
    
    let filter = {};
    // Sanitize inputs to prevent NoSQL injection
    if (role && typeof role === 'string') {
      filter.role = role.trim();
    }
    if (department && typeof department === 'string') {
      filter.department = department.trim();
    }

    const users = await User.find(filter).select('-password -faceDescriptor');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students for teacher
router.get('/students', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { department, semester } = req.query;
    
    let filter = { role: 'student' };
    // Sanitize inputs to prevent NoSQL injection
    if (department && typeof department === 'string') {
      filter.department = department.trim();
    }
    if (semester && !isNaN(parseInt(semester))) {
      filter.semester = parseInt(semester);
    }

    const students = await User.find(filter).select('-password -faceDescriptor');
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student by enrollment number
router.get('/student/:enrollmentId', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    
    const student = await User.findOne({ 
      studentId: enrollmentId.trim(), 
      role: 'student' 
    }).select('-password -faceDescriptor');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Get student by enrollment error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, department, semester, faceDescriptor } = req.body;
    
    const updateData = {};
    // Sanitize and validate inputs
    if (name && typeof name === 'string') {
      updateData.name = name.trim();
    }
    if (department && typeof department === 'string') {
      updateData.department = department.trim();
    }
    if (semester && !isNaN(parseInt(semester))) {
      updateData.semester = parseInt(semester);
    }
    // Normalize faceDescriptor: accept [128] or [[128]]; coerce to numbers; only set if valid length
    const normalizeDescriptor = (input) => {
      if (!input) return undefined;
      const arr = Array.isArray(input) && Array.isArray(input[0]) ? input[0] : input;
      if (!Array.isArray(arr)) return undefined;
      const nums = arr.map((v) => Number(v)).filter((v) => Number.isFinite(v));
      if (nums.length === 128) return nums;
      return undefined;
    };
    const normalized = normalizeDescriptor(faceDescriptor);
    if (normalized) {
      updateData.faceDescriptor = normalized;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (Admin only)
router.delete('/:userId', auth, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user status (Admin only)
router.patch('/:userId/toggle-status', auth, authorize('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ message: 'User status updated', isActive: user.isActive });
  } catch (error) {
    console.error('Toggle user status error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;