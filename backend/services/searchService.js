const movieRepository = require('../repositories/movieRepository');
const transformService = require('./transformService');

/**
 * Search Service
 * Xử lý logic tìm kiếm và filter
 */
class SearchService {
  /**
   * Tìm kiếm phim theo keyword
   */
  async searchMovies(keyword, page = 1, limit = 24) {
    const response = await movieRepository.searchMovies(keyword, page, limit);
    const data = response.data || {};
    const items = data.items || [];

    const movies = items.map(movie => {
      const transformed = transformService.transformMovie(movie);
      return transformService.applyImageUrls(transformed);
    });

    return {
      status: 'success',
      items: movies,
      pagination: data.params?.pagination || {}
    };
  }

  /**
   * Lấy danh sách phim theo slug danh sách + bộ lọc
   * (phim mới, phim lẻ, phim sắp chiếu, v.v.)
   */
  async getMoviesByList(listSlug, filters = {}) {
    const response = await movieRepository.getMoviesByList(listSlug, filters);
    const data = response.data || {};
    const items = data.items || [];

    const movies = items.map(movie => {
      const transformed = transformService.transformMovie(movie);
      return transformService.applyImageUrls(transformed);
    });

    return {
      status: 'success',
      items: movies,
      pagination: data.params?.pagination || {}
    };
  }

  /**
   * Lấy phim theo thể loại
   */
  async getMoviesByCategory(categorySlug, filters = {}) {
    const response = await movieRepository.getMoviesByCategory(categorySlug, filters);
    const data = response.data || {};
    const items = data.items || [];

    const movies = items.map(movie => {
      const transformed = transformService.transformMovie(movie);
      return transformService.applyImageUrls(transformed);
    });

    return {
      status: 'success',
      items: movies,
      pagination: data.params?.pagination || {}
    };
  }

  /**
   * Lấy phim theo quốc gia
   */
  async getMoviesByCountry(countrySlug, filters = {}) {
    const response = await movieRepository.getMoviesByCountry(countrySlug, filters);
    const data = response.data || {};
    const items = data.items || [];

    const movies = items.map(movie => {
      const transformed = transformService.transformMovie(movie);
      return transformService.applyImageUrls(transformed);
    });

    return {
      status: 'success',
      items: movies,
      pagination: data.params?.pagination || {}
    };
  }

  /**
   * Lấy danh sách quốc gia
   */
  async getCountries() {
    const response = await movieRepository.getCountries();
    // OPhim trả: { status: 'success', data: [...] }
    // movieRepository.getCountries() trả về đúng object JSON đó.
    const items = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

    return {
      status: 'success',
      items
    };
  }
}

module.exports = new SearchService();
