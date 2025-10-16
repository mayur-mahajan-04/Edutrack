const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { authLimiter, validateInput, sanitizeInput, userValidation } = require('../middleware/security');

const router = express.Router();

// Apply security middleware
router.use(sanitizeInput);

// Register
router.post('/register', authLimiter, userValidation.register, validateInput, async (req, res) => {
  try {
    const { name, email, password, role, studentId, department, semester } = req.body;

    const normalizeDescriptor = (input) => {
      if (!input) return undefined;
      const arr = Array.isArray(input) && Array.isArray(input[0]) ? input[0] : input;
      if (!Array.isArray(arr)) return undefined;
      const nums = arr.map((v) => Number(v)).filter((v) => Number.isFinite(v));
      if (nums.length === 128) return nums;
      return undefined;
    };
    const faceDescriptor = normalizeDescriptor(req.body.faceDescriptor);

    // Log registration attempt without sensitive data
    console.log('Registration attempt:', { name, email, role, studentId, department, semester });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      studentId: role === 'student' ? studentId : undefined,
      department,
      semester: role === 'student' ? semester : undefined,
      faceDescriptor
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        semester: user.semester
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', authLimiter, userValidation.login, validateInput, async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        semester: user.semester,
        faceDescriptor: user.faceDescriptor
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        studentId: req.user.studentId,
        department: req.user.department,
        semester: req.user.semester,
        faceDescriptor: req.user.faceDescriptor
      }
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;