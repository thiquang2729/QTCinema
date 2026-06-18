const express = require('express');
const router = express.Router();
const { getAuth } = require('@clerk/express');
const userController = require('../controllers/userController');

// Middleware xác thực tự tùy biến sử dụng getAuth() của Clerk để tránh cảnh báo deprecated
const requireClerkAuth = (req, res, next) => {
  const auth = getAuth(req);
  if (!auth || !auth.userId) {
    return res.status(401).json({
      status: 'error',
      error: 'Chưa đăng nhập',
      message: 'Vui lòng đăng nhập để thực hiện tác vụ này'
    });
  }
  next();
};

// Tất cả các routes liên quan đến người dùng đều cần xác thực bằng Clerk
router.use(requireClerkAuth);

// --- Watch History ---
router.post('/history', userController.saveWatchHistory.bind(userController));
router.get('/history', userController.getWatchHistory.bind(userController));
router.get('/history/:movieSlug', userController.getWatchHistoryForMovie.bind(userController));
router.delete('/history/:movieSlug', userController.deleteWatchHistory.bind(userController));

// --- Watchlist ---
router.post('/watchlist', userController.addToWatchlist.bind(userController));
router.delete('/watchlist/:movieSlug', userController.removeFromWatchlist.bind(userController));
router.get('/watchlist', userController.getWatchlist.bind(userController));
router.get('/watchlist/:movieSlug', userController.checkInWatchlist.bind(userController));

module.exports = router;
