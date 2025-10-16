const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'teacher', 'admin'], required: true, index: true },
  studentId: { type: String, sparse: true, index: true },
  department: { type: String, index: true },
  division: { type: String, enum: ['A', 'B', 'C'], index: true },
  academicYear: { type: String, enum: ['First', 'Second', 'Third', 'Fourth'] },
  semester: { type: Number, min: 1, max: 8 },
  faceDescriptor: [{ type: Number }], // Face recognition data
  profileImage: { type: String },
  isActive: { type: Boolean, default: true, index: true },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
}, {
  timestamps: true
});

// Compound indexes
userSchema.index({ role: 1, department: 1 });
userSchema.index({ role: 1, isActive: 1 });

userSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);