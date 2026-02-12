const serverless = require('serverless-http');
const app = require('../../backend/app');

// Netlify Functions entry
exports.handler = serverless(app);

