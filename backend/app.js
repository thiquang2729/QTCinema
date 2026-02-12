const express = require('express');
const cors = require('cors');
const movieRoutes = require('./routes/movies');

/**
 * Express app dùng chung cho:
 * - Local server (backend/server.js)
 * - Netlify Functions (netlify/functions/api.cjs)
 */
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/movies', movieRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend đang hoạt động' });
});

module.exports = app;

