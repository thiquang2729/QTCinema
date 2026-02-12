const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

/**
 * Movie Routes
 * Định nghĩa các endpoints và map đến controller methods
 */

// GET /api/movies - Lấy danh sách phim trang chủ
router.get('/', movieController.getHomeMovies.bind(movieController));

// GET /api/movies/search/:keyword - Tìm kiếm phim
router.get('/search/:keyword', movieController.searchMovies.bind(movieController));

// GET /api/movies/category/:slug - Lấy phim theo thể loại
router.get('/category/:slug', movieController.getMoviesByCategory.bind(movieController));

// GET /api/movies/country/:slug - Lấy phim theo quốc gia
router.get('/country/:slug', movieController.getMoviesByCountry.bind(movieController));

// GET /api/movies/:slug - Lấy chi tiết phim (phải để cuối cùng)
router.get('/:slug', movieController.getMovieBySlug.bind(movieController));

module.exports = router;
