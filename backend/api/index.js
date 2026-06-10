// Vercel serverless entry — exports the Express app.
// Vercel wraps this as a Node.js serverless function.
const app = require('../src/app');

module.exports = app;
