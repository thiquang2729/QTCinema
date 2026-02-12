const movieRepository = require('../repositories/movieRepository');
const transformService = require('./transformService');

/**
 * Home Service
 * Xử lý logic cho trang chủ
 */
class HomeService {
  /**
   * Lấy danh sách phim từ trang chủ
   */
  async getHomeMovies(page = 1) {
    const response = await movieRepository.getHomeMovies(page);
    const data = response.data || {};
    const items = data.items || [];
    const cdnImageUrl = data.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live';

    // Transform và apply image URLs
    const movies = items.map(movie => {
      const transformed = transformService.transformMovie(movie);
      return transformService.applyImageUrls(transformed, cdnImageUrl);
    });

    return {
      status: 'success',
      items: movies,
      pagination: data.params?.pagination || {},
      cdnImageUrl: cdnImageUrl
    };
  }
}

module.exports = new HomeService();
