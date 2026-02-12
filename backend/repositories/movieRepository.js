const axios = require('axios');
const API_CONFIG = require('../config/api.config');

/**
 * Repository layer - Chịu trách nhiệm gọi API bên ngoài (OPhim)
 * Sau này khi có database, layer này sẽ tương tác với DB
 */
class MovieRepository {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS
    });
  }

  /**
   * Lấy danh sách phim từ trang chủ
   */
  async getHomeMovies(page = 1) {
    try {
      const response = await this.apiClient.get('/v1/api/home', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }

  /**
   * Lấy chi tiết phim theo slug
   */
  async getMovieBySlug(slug) {
    try {
      const response = await this.apiClient.get(`/phim/${slug}`);
      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }

  /**
   * Tìm kiếm phim
   */
  async searchMovies(keyword, page = 1) {
    try {
      const response = await this.apiClient.get('/v1/api/tim-kiem', {
        params: { keyword, page }
      });
      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách phim theo thể loại
   */
  async getMoviesByCategory(categorySlug, page = 1) {
    try {
      const response = await this.apiClient.get(`/v1/api/the-loai/${categorySlug}`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách phim theo quốc gia
   */
  async getMoviesByCountry(countrySlug, page = 1) {
    try {
      const response = await this.apiClient.get(`/v1/api/quoc-gia/${countrySlug}`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách hình ảnh phim
   */
  async getMovieImages(slug) {
    try {
      const response = await this.apiClient.get(`/v1/api/phim/${slug}/images`);
      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin diễn viên/đạo diễn
   */
  async getMoviePeoples(slug) {
    try {
      const response = await this.apiClient.get(`/v1/api/phim/${slug}/peoples`);
      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }

  /**
   * Lấy từ khóa phim
   */
  async getMovieKeywords(slug) {
    try {
      const response = await this.apiClient.get(`/v1/api/phim/${slug}/keywords`);
      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }
}

module.exports = new MovieRepository();
