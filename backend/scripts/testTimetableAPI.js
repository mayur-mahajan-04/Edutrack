const mongoose = require('mongoose');
const Timetable = require('../models/Timetable');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const testTimetableAPI = async () => {
  try {
    await connectDB();
    
    console.log('🧪 Testing Timetable API Logic...\n');
    
    // Test query similar to what the API would do
    const year = 2;
    const division = 'A';
    const department = 'Computer';
    
    console.log(`Searching for: Year ${year}, Division ${division}, Department ${department}`);
    
    const query = { 
      year: parseInt(year), 
      division: division.toUpperCase(),
      isActive: true
    };
    
    if (department) {
      query.department = department;
    }
    
    console.log('Query object:', query);
    
    const timetable = await Timetable.find(query).sort({ 
      day: 1, 
      timeSlot: 1 
    });
    
    console.log(`\n📊 Found ${timetable.length} timetable entries`);
    
    if (timetable.length > 0) {
      console.log('\n📅 Sample entries:');
      timetable.slice(0, 5).forEach(entry => {
        console.log(`${entry.day} | ${entry.timeSlot} | ${entry.subject} | ${entry.teacher || 'N/A'} | ${entry.type}`);
      });
      
      // Group by days
      const groupedTimetable = {};
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      days.forEach(day => {
        groupedTimetable[day] = timetable.filter(item => item.day === day);
      });
      
      console.log('\n📋 Grouped by days:');
      Object.keys(groupedTimetable).forEach(day => {
        console.log(`${day}: ${groupedTimetable[day].length} entries`);
      });
      
      // Test the API response format
      const apiResponse = {
        timetable: groupedTimetable,
        raw: timetable
      };
      
      console.log('\n✅ API Response structure is valid');
      console.log(`Raw entries: ${apiResponse.raw.length}`);
      console.log(`Grouped days: ${Object.keys(apiResponse.timetable).length}`);
    } else {
      console.log('\n❌ No timetable entries found!');
      
      // Check what data exists
      const allEntries = await Timetable.find({}).limit(5);
      console.log('\n🔍 Sample of existing data:');
      allEntries.forEach(entry => {
        console.log(`${entry.department} | Year ${entry.year} | Div ${entry.division} | ${entry.day} | ${entry.subject}`);
      });
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error testing timetable API:', error);
    process.exit(1);
  }
};

testTimetableAPI();