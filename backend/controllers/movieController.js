const movieService = require('../services/movieService');

/**
 * Controller layer - Xử lý HTTP requests và responses
 * Không chứa business logic, chỉ validate input và format response
 */
class MovieController {
  /**
   * GET /api/movies
   * Lấy danh sách phim trang chủ
   */
  async getHomeMovies(req, res) {
    try {
      const page = req.query.page || 1;
      const result = await movieService.getHomeMovies(page);
      res.json(result);
    } catch (error) {
      console.error('Error in getHomeMovies:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể lấy danh sách phim',
        message: error.message
      });
    }
  }

  /**
   * GET /api/movies/:slug
   * Lấy chi tiết phim theo slug
   */
  async getMovieBySlug(req, res) {
    try {
      const { slug } = req.params;
      
      if (!slug) {
        return res.status(400).json({
          status: 'error',
          error: 'Slug là bắt buộc'
        });
      }

      const result = await movieService.getMovieBySlug(slug);
      res.json(result);
    } catch (error) {
      console.error('Error in getMovieBySlug:', error.message);
      
      if (error.message === 'Không tìm thấy phim') {
        return res.status(404).json({
          status: 'error',
          error: error.message
        });
      }

      res.status(500).json({
        status: 'error',
        error: 'Không thể lấy chi tiết phim',
        message: error.message
      });
    }
  }

  /**
   * GET /api/movies/search/:keyword
   * Tìm kiếm phim
   */
  async searchMovies(req, res) {
    try {
      const { keyword } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 24;

      if (!keyword || keyword.length < 2) {
        return res.status(400).json({
          status: 'error',
          error: 'Từ khóa tìm kiếm phải có ít nhất 2 ký tự'
        });
      }

      const result = await movieService.searchMovies(keyword, page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error in searchMovies:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể tìm kiếm phim',
        message: error.message
      });
    }
  }

  /**
   * GET /api/movies/list/:slug
   * Lấy danh sách phim theo slug danh sách + bộ lọc
   * Ví dụ:
   *   /api/movies/list/phim-moi?page=1&limit=24&sort_field=modified.time&sort_type=desc&category=hanh-dong&country=han-quoc&year=2026
   */
  async getMoviesByList(req, res) {
    try {
      const { slug } = req.params;
      const {
        page,
        limit,
        sort_field,
        sort_type,
        category,
        country,
        year
      } = req.query;

      if (!slug) {
        return res.status(400).json({
          status: 'error',
          error: 'Slug danh sách là bắt buộc'
        });
      }

      const filters = {
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        sort_field,
        sort_type,
        category,
        country,
        year
      };

      const result = await movieService.getMoviesByList(slug, filters);
      res.json(result);
    } catch (error) {
      console.error('Error in getMoviesByList:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể lấy danh sách phim theo bộ lọc',
        message: error.message
      });
    }
  }

  /**
   * GET /api/movies/category/:slug
   * Lấy phim theo thể loại
   */
  async getMoviesByCategory(req, res) {
    try {
      const { slug } = req.params;
      const {
        page,
        limit,
        sort_field,
        sort_type,
        country,
        year
      } = req.query;

      const filters = {
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        sort_field,
        sort_type,
        country,
        year
      };

      const result = await movieService.getMoviesByCategory(slug, filters);
      res.json(result);
    } catch (error) {
      console.error('Error in getMoviesByCategory:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể lấy danh sách phim theo thể loại',
        message: error.message
      });
    }
  }

  /**
   * GET /api/movies/country/:slug
   * Lấy phim theo quốc gia
   */
  async getMoviesByCountry(req, res) {
    try {
      const { slug } = req.params;
      const {
        page,
        limit,
        sort_field,
        sort_type,
        year,
        category
      } = req.query;

      const filters = {
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        sort_field,
        sort_type,
        year,
        category
      };

      const result = await movieService.getMoviesByCountry(slug, filters);
      res.json(result);
    } catch (error) {
      console.error('Error in getMoviesByCountry:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể lấy danh sách phim theo quốc gia',
        message: error.message
      });
    }
  }

  /**
   * GET /api/movies/countries
   * Lấy danh sách quốc gia
   */
  async getCountries(req, res) {
    try {
      const result = await movieService.getCountries();
      res.json(result);
    } catch (error) {
      console.error('Error in getCountries:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể lấy danh sách quốc gia',
        message: error.message
      });
    }
  }

  /**
   * GET /api/movies/:slug/images
   * Lấy danh sách hình ảnh phim
   */
  async getMovieImages(req, res) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({
          status: 'error',
          error: 'Slug là bắt buộc'
        });
      }

      const result = await movieService.getMovieImages(slug);
      res.json(result);
    } catch (error) {
      console.error('Error in getMovieImages:', error.message);
      // Không coi lỗi images là fatal để tránh làm sập trang chi tiết
      res.json({
        status: 'success',
        data: {
          slug: req.params.slug,
          images: [],
          backdrops: [],
          posters: []
        }
      });
    }
  }

  /**
   * GET /api/movies/:slug/peoples
   * Lấy thông tin diễn viên/đạo diễn
   */
  async getMoviePeoples(req, res) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({
          status: 'error',
          error: 'Slug là bắt buộc'
        });
      }

      const result = await movieService.getMoviePeoples(slug);
      res.json(result);
    } catch (error) {
      console.error('Error in getMoviePeoples:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể lấy thông tin diễn viên',
        message: error.message
      });
    }
  }

  /**
   * GET /api/movies/:slug/keywords
   * Lấy từ khóa phim
   */
  async getMovieKeywords(req, res) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({
          status: 'error',
          error: 'Slug là bắt buộc'
        });
      }

      const result = await movieService.getMovieKeywords(slug);
      res.json(result);
    } catch (error) {
      console.error('Error in getMovieKeywords:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể lấy từ khóa phim',
        message: error.message
      });
    }
  }
}

module.exports = new MovieController();
