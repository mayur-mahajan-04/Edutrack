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

const verifyTimetable = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Verifying Timetable Data...\n');
    
    // Total count
    const totalCount = await Timetable.countDocuments();
    console.log(`📊 Total timetable entries: ${totalCount}`);
    
    // Count by type
    const typeStats = await Timetable.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n📋 Entries by Type:');
    typeStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });
    
    // Count by department
    const deptStats = await Timetable.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('\n🏢 Entries by Department:');
    deptStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });
    
    // Sample data for Computer 2nd Year A
    console.log('\n📅 Sample Timetable (Computer - 2nd Year - Division A - Monday):');
    const sampleData = await Timetable.find({
      department: 'Computer',
      year: 2,
      division: 'A',
      day: 'Monday'
    }).sort({ timeSlot: 1 });
    
    sampleData.forEach(entry => {
      console.log(`  ${entry.timeSlot} | ${entry.subject} | ${entry.teacher || 'N/A'} | ${entry.room || 'N/A'} | ${entry.type}`);
    });
    
    // Check for any validation issues
    const invalidEntries = await Timetable.find({
      $or: [
        { subject: { $exists: false } },
        { day: { $exists: false } },
        { timeSlot: { $exists: false } }
      ]
    });
    
    if (invalidEntries.length > 0) {
      console.log(`\n⚠️  Found ${invalidEntries.length} invalid entries`);
    } else {
      console.log('\n✅ All entries are valid');
    }
    
    console.log('\n🎉 Timetable verification completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error verifying timetable:', error);
    process.exit(1);
  }
};

verifyTimetable();