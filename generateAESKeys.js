const crypto = require('crypto');

// Generate a 32-byte (256-bit) AES secret key
const AES_SECRET_KEY = crypto.randomBytes(32).toString('hex');

// Generate a 16-byte (128-bit) AES initialization vector (IV)
const AES_IV = crypto.randomBytes(16).toString('hex');

console.log('AES Secret Key:', AES_SECRET_KEY);
console.log('AES IV:', AES_IV);
