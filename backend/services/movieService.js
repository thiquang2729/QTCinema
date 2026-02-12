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
   * Lấy danh sách phim theo slug danh sách + bộ lọc
   * Ví dụ: phim mới, phim bộ, phim lẻ, phim sắp chiếu...
   */
  async getMoviesByList(listSlug, filters = {}) {
    return searchService.getMoviesByList(listSlug, filters);
  }

  /**
   * Lấy phim theo thể loại
   */
  async getMoviesByCategory(categorySlug, filters = {}) {
    return searchService.getMoviesByCategory(categorySlug, filters);
  }

  /**
   * Lấy phim theo quốc gia
   */
  async getMoviesByCountry(countrySlug, filters = {}) {
    return searchService.getMoviesByCountry(countrySlug, filters);
  }

  /**
   * Lấy danh sách quốc gia
   */
  async getCountries() {
    return searchService.getCountries();
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
