/**
 * Movie Service - Main Service
 * Aggregate service - điều phối các service modules khác
 */

const homeService = require('./homeService');
const movieDetailService = require('./movieDetailService');
const searchService = require('./searchService');

class MovieService {
  /**
   * Lấy danh sách phim từ trang chủ
   */
  async getHomeMovies(page = 1) {
    return homeService.getHomeMovies(page);
  }

  /**
   * Lấy chi tiết phim
   */
  async getMovieBySlug(slug) {
    return movieDetailService.getMovieBySlug(slug);
  }

  /**
   * Tìm kiếm phim
   */
  async searchMovies(keyword, page = 1) {
    return searchService.searchMovies(keyword, page);
  }

  /**
   * Lấy phim theo thể loại
   */
  async getMoviesByCategory(categorySlug, page = 1) {
    return searchService.getMoviesByCategory(categorySlug, page);
  }

  /**
   * Lấy phim theo quốc gia
   */
  async getMoviesByCountry(countrySlug, page = 1) {
    return searchService.getMoviesByCountry(countrySlug, page);
  }

  /**
   * Lấy hình ảnh phim
   */
  async getMovieImages(slug) {
    return movieDetailService.getMovieImages(slug);
  }

  /**
   * Lấy thông tin diễn viên
   */
  async getMoviePeoples(slug) {
    return movieDetailService.getMoviePeoples(slug);
  }

  /**
   * Lấy từ khóa phim
   */
  async getMovieKeywords(slug) {
    return movieDetailService.getMovieKeywords(slug);
  }
}

module.exports = new MovieService();
