const mongoose = require('mongoose');
const Timetable = require('../models/Timetable');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Comprehensive timetable data
const generateTimetableData = () => {
  const departments = ['Computer', 'IT', 'Mechanical', 'Civil', 'Electrical', 'Electronics and Telecommunication'];
  const years = [1, 2, 3, 4];
  const divisions = ['A', 'B', 'C'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const timeSlots = [
    '9:00-10:00',
    '10:00-11:00', 
    '11:00-11:15', // Break
    '11:15-12:15',
    '12:15-13:15', // Lunch Break
    '13:15-16:15'  // Lab/Practical
  ];

  // Subject mappings by department and year
  const subjectsByDeptYear = {
    'Computer': {
      1: ['Mathematics-I', 'Physics', 'Chemistry', 'English', 'Basic Programming', 'Engineering Graphics', 'Workshop'],
      2: ['Mathematics-II', 'Data Structures', 'Database Management', 'Operating Systems', 'Computer Networks', 'OOP', 'Digital Logic'],
      3: ['Software Engineering', 'Machine Learning', 'Web Technology', 'Computer Graphics', 'Compiler Design', 'AI', 'Project-I'],
      4: ['Advanced Algorithms', 'Cyber Security', 'Cloud Computing', 'Mobile Computing', 'Blockchain', 'Project-II', 'Internship']
    },
    'IT': {
      1: ['Mathematics-I', 'Physics', 'Chemistry', 'English', 'IT Fundamentals', 'Programming Logic', 'Digital Systems'],
      2: ['Mathematics-II', 'Java Programming', 'Database Systems', 'Computer Networks', 'Web Development', 'System Analysis', 'Statistics'],
      3: ['Software Testing', 'Information Security', 'Data Mining', 'Mobile App Development', 'Cloud Technologies', 'E-Commerce', 'Project-I'],
      4: ['Big Data Analytics', 'IoT', 'DevOps', 'Enterprise Systems', 'Research Methodology', 'Project-II', 'Industrial Training']
    },
    'Mechanical': {
      1: ['Mathematics-I', 'Physics', 'Chemistry', 'Engineering Mechanics', 'Engineering Graphics', 'Workshop Technology', 'Materials Science'],
      2: ['Mathematics-II', 'Thermodynamics', 'Fluid Mechanics', 'Manufacturing Processes', 'Machine Design', 'Strength of Materials', 'CAD'],
      3: ['Heat Transfer', 'Automobile Engineering', 'Production Technology', 'Control Systems', 'Industrial Engineering', 'Vibrations', 'Project-I'],
      4: ['Advanced Manufacturing', 'Robotics', 'Finite Element Analysis', 'Energy Systems', 'Quality Control', 'Project-II', 'Internship']
    },
    'Civil': {
      1: ['Mathematics-I', 'Physics', 'Chemistry', 'Engineering Mechanics', 'Engineering Graphics', 'Surveying', 'Building Materials'],
      2: ['Mathematics-II', 'Structural Analysis', 'Fluid Mechanics', 'Soil Mechanics', 'Construction Technology', 'Environmental Engineering', 'CAD'],
      3: ['Concrete Technology', 'Transportation Engineering', 'Water Resources', 'Foundation Engineering', 'Project Management', 'GIS', 'Project-I'],
      4: ['Advanced Structures', 'Earthquake Engineering', 'Urban Planning', 'Construction Management', 'Research Methods', 'Project-II', 'Internship']
    },
    'Electrical': {
      1: ['Mathematics-I', 'Physics', 'Chemistry', 'Electrical Circuits', 'Electronics', 'Engineering Graphics', 'Workshop'],
      2: ['Mathematics-II', 'Network Analysis', 'Electromagnetic Fields', 'Digital Electronics', 'Measurements', 'Control Systems', 'Programming'],
      3: ['Power Systems', 'Machines', 'Power Electronics', 'Microprocessors', 'Communication Systems', 'Industrial Drives', 'Project-I'],
      4: ['Renewable Energy', 'Smart Grid', 'VLSI Design', 'Embedded Systems', 'Power Quality', 'Project-II', 'Industrial Training']
    },
    'Electronics and Telecommunication': {
      1: ['Mathematics-I', 'Physics', 'Chemistry', 'Basic Electronics', 'Digital Systems', 'Engineering Graphics', 'Programming'],
      2: ['Mathematics-II', 'Analog Circuits', 'Digital Signal Processing', 'Communication Systems', 'Microprocessors', 'Network Theory', 'MATLAB'],
      3: ['VLSI Design', 'Embedded Systems', 'Wireless Communication', 'Optical Communication', 'Antenna Theory', 'Image Processing', 'Project-I'],
      4: ['5G Technology', 'IoT Systems', 'Satellite Communication', 'Radar Systems', 'Biomedical Electronics', 'Project-II', 'Internship']
    }
  };

  // Teachers pool
  const teachers = [
    'Dr. Rajesh Sharma', 'Prof. Priya Patel', 'Dr. Amit Kumar', 'Prof. Sneha Joshi', 'Dr. Vikram Singh',
    'Prof. Kavita Desai', 'Dr. Rahul Gupta', 'Prof. Meera Nair', 'Dr. Suresh Reddy', 'Prof. Anjali Verma',
    'Dr. Manoj Tiwari', 'Prof. Pooja Agarwal', 'Dr. Deepak Yadav', 'Prof. Ritu Malhotra', 'Dr. Sanjay Jain',
    'Prof. Neha Chopra', 'Dr. Arun Pandey', 'Prof. Shweta Bansal', 'Dr. Rohit Saxena', 'Prof. Divya Bhatt',
    'Dr. Kiran Mehta', 'Prof. Sachin Kulkarni', 'Dr. Preeti Sinha', 'Prof. Gaurav Mishra', 'Dr. Sunita Rao'
  ];

  // Room mappings
  const getRooms = (dept, type) => {
    const deptCode = dept.substring(0, 2).toUpperCase();
    if (type === 'practical') {
      return [`${deptCode}-Lab-1`, `${deptCode}-Lab-2`, `${deptCode}-Lab-3`, `${deptCode}-Lab-4`];
    } else if (type === 'lecture') {
      return [`${deptCode}-101`, `${deptCode}-102`, `${deptCode}-201`, `${deptCode}-202`, `${deptCode}-301`, `${deptCode}-302`];
    }
    return [''];
  };

  const timetableData = [];

  departments.forEach(department => {
    years.forEach(year => {
      divisions.forEach(division => {
        const subjects = subjectsByDeptYear[department][year];
        
        days.forEach(day => {
          let subjectIndex = 0;
          
          timeSlots.forEach((timeSlot, slotIndex) => {
            let entry = {
              year,
              division,
              department,
              day,
              timeSlot,
              isActive: true
            };

            // Handle breaks
            if (timeSlot === '11:00-11:15') {
              entry = {
                ...entry,
                subject: 'Tea Break',
                teacher: '',
                room: '',
                type: 'break',
                duration: 15
              };
            } else if (timeSlot === '12:15-13:15') {
              entry = {
                ...entry,
                subject: 'Lunch Break',
                teacher: '',
                room: '',
                type: 'break',
                duration: 60
              };
            } else if (timeSlot === '13:15-16:15') {
              // Afternoon practical/lab sessions
              const practicalSubjects = subjects.filter(s => 
                s.includes('Lab') || s.includes('Workshop') || s.includes('Project') || 
                s.includes('CAD') || s.includes('Graphics') || s.includes('Programming')
              );
              
              if (practicalSubjects.length > 0) {
                const subject = practicalSubjects[Math.floor(Math.random() * practicalSubjects.length)];
                const rooms = getRooms(department, 'practical');
                
                entry = {
                  ...entry,
                  subject: subject + ' Lab',
                  teacher: teachers[Math.floor(Math.random() * teachers.length)],
                  room: rooms[Math.floor(Math.random() * rooms.length)],
                  type: 'practical',
                  duration: 180
                };
              } else {
                // Regular subject as practical
                const subject = subjects[subjectIndex % subjects.length];
                const rooms = getRooms(department, 'practical');
                
                entry = {
                  ...entry,
                  subject: subject + ' Practical',
                  teacher: teachers[Math.floor(Math.random() * teachers.length)],
                  room: rooms[Math.floor(Math.random() * rooms.length)],
                  type: 'practical',
                  duration: 180
                };
                subjectIndex++;
              }
            } else {
              // Regular lecture slots
              const subject = subjects[subjectIndex % subjects.length];
              const rooms = getRooms(department, 'lecture');
              
              entry = {
                ...entry,
                subject,
                teacher: teachers[Math.floor(Math.random() * teachers.length)],
                room: rooms[Math.floor(Math.random() * rooms.length)],
                type: 'lecture',
                duration: 60
              };
              subjectIndex++;
            }

            timetableData.push(entry);
          });
        });
      });
    });
  });

  return timetableData;
};

const seedTimetable = async () => {
  try {
    await connectDB();
    
    console.log('Clearing existing timetable data...');
    await Timetable.deleteMany({});
    
    console.log('Generating comprehensive timetable data...');
    const timetableData = generateTimetableData();
    
    console.log(`Inserting ${timetableData.length} timetable entries...`);
    await Timetable.insertMany(timetableData);
    
    console.log('✅ Timetable data seeded successfully!');
    
    // Display summary
    const summary = await Timetable.aggregate([
      {
        $group: {
          _id: { department: '$department', year: '$year', division: '$division' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.department': 1, '_id.year': 1, '_id.division': 1 }
      }
    ]);
    
    console.log('\n📊 Timetable Summary:');
    summary.forEach(item => {
      console.log(`${item._id.department} - Year ${item._id.year} - Division ${item._id.division}: ${item.count} entries`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding timetable:', error);
    process.exit(1);
  }
};

// Run the seeding
seedTimetable();