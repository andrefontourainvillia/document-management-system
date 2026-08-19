const path = require('node:path');

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

module.exports = {
  port: positiveInteger(process.env.PORT, 3000),
  storageDirectory: process.env.STORAGE_DIR || path.resolve(__dirname, '../storage'),
  maxFileSizeBytes: positiveInteger(process.env.MAX_FILE_SIZE_BYTES, 10 * 1024 * 1024),
  defaultUserId: process.env.DEFAULT_USER_ID || 'demo-user'
};