const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    return JSON.stringify(logEntry);
  }

  writeToFile(level, message) {
    const filename = path.join(logsDir, `${level.toLowerCase()}.log`);
    fs.appendFileSync(filename, message + '\n');
  }

  log(level, message, meta = {}) {
    if (logLevels[level] <= logLevels[this.level]) {
      const formattedMessage = this.formatMessage(level, message, meta);
      
      // Console output
      console.log(formattedMessage);
      
      // File output for errors and warnings
      if (level === 'ERROR' || level === 'WARN') {
        this.writeToFile(level, formattedMessage);
      }
    }
  }

  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }
}

module.exports = new Logger();