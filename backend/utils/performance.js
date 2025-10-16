const logger = require('./logger');

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;
    
    logger.info('Request completed', {
      method,
      url: originalUrl,
      statusCode,
      duration: `${duration}ms`,
      ip,
      userAgent: req.get('User-Agent')
    });
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method,
        url: originalUrl,
        duration: `${duration}ms`
      });
    }
  });
  
  next();
};

// Database query optimization helper
const optimizeQuery = (query, options = {}) => {
  const {
    limit = 50,
    sort = { createdAt: -1 },
    lean = true,
    select = null
  } = options;
  
  let optimizedQuery = query.limit(limit).sort(sort);
  
  if (lean) {
    optimizedQuery = optimizedQuery.lean();
  }
  
  if (select) {
    optimizedQuery = optimizedQuery.select(select);
  }
  
  return optimizedQuery;
};

// Cache helper for frequently accessed data
class SimpleCache {
  constructor(ttl = 300000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    const expiry = Date.now() + this.ttl;
    this.cache.set(key, { value, expiry });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  clear() {
    this.cache.clear();
  }
  
  size() {
    return this.cache.size;
  }
}

module.exports = {
  performanceMonitor,
  optimizeQuery,
  SimpleCache
};