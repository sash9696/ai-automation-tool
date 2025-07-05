const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLevel = process.env.LOG_LEVEL || 'INFO';

const shouldLog = (level) => {
  return logLevels[level] <= logLevels[currentLevel];
};

const formatMessage = (level, message, data) => {
  const timestamp = new Date().toISOString();
  const baseMessage = `[${timestamp}] ${level}: ${message}`;
  
  if (data) {
    return `${baseMessage} ${JSON.stringify(data, null, 2)}`;
  }
  
  return baseMessage;
};

export const logger = {
  error: (message, data) => {
    if (shouldLog('ERROR')) {
      console.error(formatMessage('ERROR', message, data));
    }
  },

  warn: (message, data) => {
    if (shouldLog('WARN')) {
      console.warn(formatMessage('WARN', message, data));
    }
  },

  info: (message, data) => {
    if (shouldLog('INFO')) {
      console.info(formatMessage('INFO', message, data));
    }
  },

  debug: (message, data) => {
    if (shouldLog('DEBUG')) {
      console.debug(formatMessage('DEBUG', message, data));
    }
  }
}; 