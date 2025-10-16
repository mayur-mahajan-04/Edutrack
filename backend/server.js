const cluster = require('cluster');
const os = require('os');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
require('dotenv').config();

// Cluster for production performance
if (cluster.isMaster && process.env.NODE_ENV === 'production') {
  const numCPUs = Math.min(os.cpus().length, 4);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const app = express();

  // Performance optimizations
  app.set('trust proxy', 1);
  app.use(compression());
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
    origin: function(origin, callback) {
      if (!origin || 
          origin.includes('vercel.app') || 
          origin.includes('localhost') || 
          origin.includes('192.168.') ||
          origin === process.env.FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

// Optimized rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development'
});
app.use('/api', limiter);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Simple performance monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) console.log(`Slow: ${req.method} ${req.originalUrl} - ${duration}ms`);
  });
  next();
});

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

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

  // Optimized MongoDB connection
  const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 30,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 3000,
        socketTimeoutMS: 30000,
        bufferCommands: false,
        bufferMaxEntries: 0
      });
      logger.info('MongoDB connected successfully');
    } catch (err) {
      logger.error('MongoDB connection error', { error: err.message });
      setTimeout(connectDB, 3000);
    }
  };

  connectDB();

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Worker ${process.pid} running on port ${PORT}`);
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
}