const express = require('express');
const cors = require('cors');
const { clerkMiddleware, requireAuth, getAuth } = require('@clerk/express');
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
app.use(clerkMiddleware());

// Routes
app.use('/api/movies', movieRoutes);

// Protected Route - Kiểm thử xác thực
app.get('/api/profile', requireAuth(), (req, res) => {
  const auth = getAuth(req);
  res.json({
    status: 'OK',
    message: 'Bạn đã truy cập thành công vào route được bảo mật!',
    userId: auth.userId,
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend đang hoạt động' });
});

module.exports = app;

