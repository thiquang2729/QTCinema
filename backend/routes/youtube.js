const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');

/**
 * YouTube Downloader Routes
 */

// GET /api/youtube/info - Lấy thông tin video YouTube
router.get('/info', youtubeController.getVideoInfo.bind(youtubeController));

// GET /api/youtube/download - Tải và stream video hoặc audio trực tiếp
router.get('/download', youtubeController.downloadStream.bind(youtubeController));

module.exports = router;
