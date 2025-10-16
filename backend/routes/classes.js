const express = require('express');
const Class = require('../models/Class');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get teacher's classes
router.get('/teacher', auth, authorize('teacher'), async (req, res) => {
  try {
    console.log('Fetching classes for teacher:', req.user._id);
    const teacherClasses = await Class.find({ teacher: req.user._id }).populate('teacher', 'name email');
    console.log('Found classes:', teacherClasses.length);
    res.json(teacherClasses);
  } catch (error) {
    console.error('Get teacher classes error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new class
router.post('/', auth, authorize('teacher'), async (req, res) => {
  try {
    const { subject, department, class: className, division, type } = req.body;
    
    // Validation
    if (!subject || !department || !className || !division) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check for duplicate class
    const existingClass = await Class.findOne({
      teacher: req.user._id,
      subject,
      department,
      class: className,
      division,
      type
    });
    
    if (existingClass) {
      return res.status(400).json({ message: 'This class already exists' });
    }
    
    const newClass = new Class({
      subject: subject.trim(),
      department: department.trim(),
      class: className.trim(),
      division: division.trim(),
      type: type || 'lecture',
      teacher: req.user._id
    });
    
    await newClass.save();
    console.log('Class created:', newClass);
    res.status(201).json(newClass);
  } catch (error) {
    console.error('Add class error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid data provided' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove class
router.delete('/:classId', auth, authorize('teacher'), async (req, res) => {
  try {
    const { classId } = req.params;
    const deletedClass = await Class.findOneAndDelete({ 
      _id: classId, 
      teacher: req.user._id 
    });
    
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.json({ message: 'Class removed successfully' });
  } catch (error) {
    console.error('Remove class error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;