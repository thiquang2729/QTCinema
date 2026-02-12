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
   * Lấy phim theo thể loại
   */
  async getMoviesByCategory(categorySlug, page = 1) {
    const response = await movieRepository.getMoviesByCategory(categorySlug, page);
    const items = response.items || response.data?.items || [];

    const movies = items.map(movie => {
      const transformed = transformService.transformMovie(movie);
      return transformService.applyImageUrls(transformed);
    });

    return {
      status: 'success',
      items: movies,
      pagination: response.pagination || {}
    };
  }

  /**
   * Lấy phim theo quốc gia
   */
  async getMoviesByCountry(countrySlug, page = 1) {
    const response = await movieRepository.getMoviesByCountry(countrySlug, page);
    const items = response.items || response.data?.items || [];

    const movies = items.map(movie => {
      const transformed = transformService.transformMovie(movie);
      return transformService.applyImageUrls(transformed);
    });

    return {
      status: 'success',
      items: movies,
      pagination: response.pagination || {}
    };
  }
}

module.exports = new SearchService();
