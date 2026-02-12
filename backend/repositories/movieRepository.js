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
  async searchMovies(keyword, page = 1, limit = 24) {
    try {
      const response = await this.apiClient.get('/v1/api/tim-kiem', {
        params: { keyword, page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách phim theo slug danh sách + bộ lọc
   * Ví dụ: /v1/api/danh-sach/phim-moi?page=1&limit=24&category=hanh-dong&country=han-quoc
   */
  async getMoviesByList(listSlug, filters = {}) {
    try {
      const {
        page,
        limit,
        sort_field,
        sort_type,
        category,
        country,
        year
      } = filters;

      const response = await this.apiClient.get(`/v1/api/danh-sach/${listSlug}`, {
        params: {
          page,
          limit,
          sort_field,
          sort_type,
          category,
          country,
          year
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách phim theo thể loại
   */
  async getMoviesByCategory(categorySlug, filters = {}) {
    try {
      // Backward compatible: nếu truyền số thì hiểu là page
      const normalizedFilters =
        typeof filters === 'number' ? { page: filters } : filters;

      const {
        page,
        limit,
        sort_field,
        sort_type,
        country,
        year
      } = normalizedFilters;

      const response = await this.apiClient.get(`/v1/api/the-loai/${categorySlug}`, {
        params: {
          page,
          limit,
          sort_field,
          sort_type,
          country,
          year
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách phim theo quốc gia
   */
  async getMoviesByCountry(countrySlug, filters = {}) {
    try {
      // Backward compatible: nếu truyền số thì hiểu là page
      const normalizedFilters =
        typeof filters === 'number' ? { page: filters } : filters;

      const {
        page,
        limit,
        sort_field,
        sort_type,
        year,
        category
      } = normalizedFilters;

      const response = await this.apiClient.get(`/v1/api/quoc-gia/${countrySlug}`, {
        params: {
          page,
          limit,
          sort_field,
          sort_type,
          year,
          category
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`API Error: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách quốc gia
   * GET /v1/api/quoc-gia
   */
  async getCountries() {
    try {
      const response = await this.apiClient.get('/v1/api/quoc-gia');
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
