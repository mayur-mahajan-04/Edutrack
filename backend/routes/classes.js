const express = require('express');
const Class = require('../models/Class');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get teacher's classes
router.get('/teacher', auth, authorize('teacher'), async (req, res) => {
  try {
    const teacherClasses = await Class.find({ teacher: req.user._id });
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
    
    const newClass = new Class({
      subject,
      department,
      class: className,
      division,
      type,
      teacher: req.user._id
    });
    
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    console.error('Add class error:', error.message);
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