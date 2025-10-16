const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const { performanceMonitor } = require('./utils/performance');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Performance monitoring
app.use(performanceMonitor);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/users', require('./routes/users'));
app.use('/api/qr', require('./routes/qr'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/face', require('./routes/face'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/notifications', require('./routes/notifications'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Database connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error('MongoDB connection error', { error: err.message });
    process.exit(1);
  }
};

connectDB();

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, { environment: process.env.NODE_ENV });
});