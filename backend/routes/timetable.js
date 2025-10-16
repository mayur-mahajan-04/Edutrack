const express = require('express');
const Timetable = require('../models/Timetable');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get timetable by year and division
router.get('/', auth, async (req, res) => {
  try {
    const { year, division, department } = req.query;
    
    if (!year || !division) {
      return res.status(400).json({ message: 'Year and division are required' });
    }

    const query = { 
      year: parseInt(year), 
      division: division.toUpperCase(),
      isActive: true
    };
    
    if (department) {
      query.department = department;
    }

    const timetable = await Timetable.find(query).sort({ 
      day: 1, 
      timeSlot: 1 
    });

    // Group by days for better frontend handling
    const groupedTimetable = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    days.forEach(day => {
      groupedTimetable[day] = timetable.filter(item => item.day === day);
    });

    res.json({
      timetable: groupedTimetable,
      raw: timetable
    });
  } catch (error) {
    console.error('Get timetable error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available classes for dropdown
router.get('/classes', auth, async (req, res) => {
  try {
    const classes = await Timetable.distinct('year');
    const divisions = await Timetable.distinct('division');
    const departments = await Timetable.distinct('department');
    
    res.json({
      years: classes.sort(),
      divisions: divisions.sort(),
      departments: departments.sort()
    });
  } catch (error) {
    console.error('Get classes error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Seed comprehensive timetable data
router.post('/seed', auth, async (req, res) => {
  try {
    await Timetable.deleteMany({});

    const timetableData = [
      // Computer Engineering - 2nd Year A - Monday
      { year: 2, division: 'A', department: 'Computer', day: 'Monday', timeSlot: '9:00-10:00', subject: 'Data Structures', teacher: 'Dr. Smith', room: 'Lab-1', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Monday', timeSlot: '10:00-11:00', subject: 'Database Management', teacher: 'Prof. Johnson', room: 'A-201', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Monday', timeSlot: '11:00-11:15', subject: 'Break', teacher: '', room: '', type: 'break' },
      { year: 2, division: 'A', department: 'Computer', day: 'Monday', timeSlot: '11:15-12:15', subject: 'Operating Systems', teacher: 'Dr. Brown', room: 'A-202', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Monday', timeSlot: '12:15-13:15', subject: 'Lunch Break', teacher: '', room: '', type: 'break' },
      { year: 2, division: 'A', department: 'Computer', day: 'Monday', timeSlot: '13:15-16:15', subject: 'DBMS Lab', teacher: 'Prof. Johnson', room: 'Lab-2', type: 'practical' },
      
      // Computer Engineering - 2nd Year A - Tuesday
      { year: 2, division: 'A', department: 'Computer', day: 'Tuesday', timeSlot: '9:00-10:00', subject: 'Computer Networks', teacher: 'Dr. Wilson', room: 'A-203', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Tuesday', timeSlot: '10:00-11:00', subject: 'Software Engineering', teacher: 'Prof. Davis', room: 'A-204', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Tuesday', timeSlot: '11:00-11:15', subject: 'Break', teacher: '', room: '', type: 'break' },
      { year: 2, division: 'A', department: 'Computer', day: 'Tuesday', timeSlot: '11:15-12:15', subject: 'Mathematics-III', teacher: 'Dr. Taylor', room: 'A-205', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Tuesday', timeSlot: '12:15-13:15', subject: 'Lunch Break', teacher: '', room: '', type: 'break' },
      { year: 2, division: 'A', department: 'Computer', day: 'Tuesday', timeSlot: '13:15-16:15', subject: 'DS Lab', teacher: 'Dr. Smith', room: 'Lab-1', type: 'practical' },
      
      // Computer Engineering - 2nd Year A - Wednesday
      { year: 2, division: 'A', department: 'Computer', day: 'Wednesday', timeSlot: '9:00-10:00', subject: 'Web Technology', teacher: 'Prof. Anderson', room: 'A-206', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Wednesday', timeSlot: '10:00-11:00', subject: 'Computer Graphics', teacher: 'Dr. Martinez', room: 'A-207', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Wednesday', timeSlot: '11:00-11:15', subject: 'Break', teacher: '', room: '', type: 'break' },
      { year: 2, division: 'A', department: 'Computer', day: 'Wednesday', timeSlot: '11:15-12:15', subject: 'Digital Logic Design', teacher: 'Prof. Thompson', room: 'A-208', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Wednesday', timeSlot: '12:15-13:15', subject: 'Lunch Break', teacher: '', room: '', type: 'break' },
      { year: 2, division: 'A', department: 'Computer', day: 'Wednesday', timeSlot: '13:15-16:15', subject: 'Web Tech Lab', teacher: 'Prof. Anderson', room: 'Lab-3', type: 'practical' },
      
      // Computer Engineering - 2nd Year A - Thursday
      { year: 2, division: 'A', department: 'Computer', day: 'Thursday', timeSlot: '9:00-10:00', subject: 'Object Oriented Programming', teacher: 'Dr. White', room: 'A-209', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Thursday', timeSlot: '10:00-11:00', subject: 'Discrete Mathematics', teacher: 'Prof. Clark', room: 'A-210', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Thursday', timeSlot: '11:00-11:15', subject: 'Break', teacher: '', room: '', type: 'break' },
      { year: 2, division: 'A', department: 'Computer', day: 'Thursday', timeSlot: '11:15-12:15', subject: 'Computer Architecture', teacher: 'Dr. Lewis', room: 'A-211', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Thursday', timeSlot: '12:15-13:15', subject: 'Lunch Break', teacher: '', room: '', type: 'break' },
      { year: 2, division: 'A', department: 'Computer', day: 'Thursday', timeSlot: '13:15-16:15', subject: 'OOP Lab', teacher: 'Dr. White', room: 'Lab-4', type: 'practical' },
      
      // Computer Engineering - 2nd Year A - Friday
      { year: 2, division: 'A', department: 'Computer', day: 'Friday', timeSlot: '9:00-10:00', subject: 'Microprocessor', teacher: 'Prof. Garcia', room: 'A-212', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Friday', timeSlot: '10:00-11:00', subject: 'Theory of Computation', teacher: 'Dr. Rodriguez', room: 'A-213', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Friday', timeSlot: '11:00-11:15', subject: 'Break', teacher: '', room: '', type: 'break' },
      { year: 2, division: 'A', department: 'Computer', day: 'Friday', timeSlot: '11:15-12:15', subject: 'Technical Communication', teacher: 'Prof. Lee', room: 'A-214', type: 'lecture' },
      { year: 2, division: 'A', department: 'Computer', day: 'Friday', timeSlot: '12:15-13:15', subject: 'Lunch Break', teacher: '', room: '', type: 'break' },
      { year: 2, division: 'A', department: 'Computer', day: 'Friday', timeSlot: '13:15-16:15', subject: 'Microprocessor Lab', teacher: 'Prof. Garcia', room: 'Lab-5', type: 'practical' },
      
      // IT Department - 3rd Year B
      { year: 3, division: 'B', department: 'IT', day: 'Monday', timeSlot: '9:00-10:00', subject: 'Machine Learning', teacher: 'Dr. Patel', room: 'B-301', type: 'lecture' },
      { year: 3, division: 'B', department: 'IT', day: 'Monday', timeSlot: '10:00-11:00', subject: 'Cloud Computing', teacher: 'Prof. Sharma', room: 'B-302', type: 'lecture' },
      { year: 3, division: 'B', department: 'IT', day: 'Monday', timeSlot: '11:00-11:15', subject: 'Break', teacher: '', room: '', type: 'break' },
      { year: 3, division: 'B', department: 'IT', day: 'Monday', timeSlot: '11:15-12:15', subject: 'Cyber Security', teacher: 'Dr. Kumar', room: 'B-303', type: 'lecture' },
      { year: 3, division: 'B', department: 'IT', day: 'Monday', timeSlot: '12:15-13:15', subject: 'Lunch Break', teacher: '', room: '', type: 'break' },
      { year: 3, division: 'B', department: 'IT', day: 'Monday', timeSlot: '13:15-16:15', subject: 'ML Lab', teacher: 'Dr. Patel', room: 'IT-Lab-1', type: 'practical' }
    ];

    await Timetable.insertMany(timetableData);
    res.json({ message: 'Comprehensive timetable data seeded successfully' });
  } catch (error) {
    console.error('Seed timetable error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;