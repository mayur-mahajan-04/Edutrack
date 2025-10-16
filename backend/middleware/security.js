const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Rate limiting for different endpoints
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Strict rate limiting for auth endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  'Too many authentication attempts, please try again later'
);

// General API rate limiting
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests
  'Too many requests, please try again later'
);

// QR code generation rate limiting
const qrLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  10, // 10 QR codes
  'Too many QR code generation attempts'
);

// Input validation middleware
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Sanitize input data
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

// Validation rules
const userValidation = {
  register: [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6, max: 128 }).withMessage('Password must be 6-128 characters'),
    body('role').isIn(['student', 'teacher', 'admin']).withMessage('Invalid role'),
    body('studentId').optional().trim().isLength({ min: 1, max: 20 }),
    body('department').optional().trim().isLength({ min: 1, max: 50 }),
    body('semester').optional().isInt({ min: 1, max: 8 })
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ]
};

const qrValidation = {
  generate: [
    body('subject').trim().isLength({ min: 1, max: 100 }).withMessage('Subject required'),
    body('duration').isInt({ min: 1, max: 180 }).withMessage('Duration must be 1-180 minutes'),
    body('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('location.radius').optional().isInt({ min: 10, max: 1000 }).withMessage('Radius must be 10-1000 meters')
  ]
};

module.exports = {
  authLimiter,
  apiLimiter,
  qrLimiter,
  validateInput,
  sanitizeInput,
  userValidation,
  qrValidation
};