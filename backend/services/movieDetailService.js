const movieRepository = require('../repositories/movieRepository');
const transformService = require('./transformService');

/**
 * Movie Detail Service
 * Xử lý logic chi tiết phim
 */
class MovieDetailService {
  /**
   * Lấy chi tiết phim theo slug
   */
  async getMovieBySlug(slug) {
    const response = await movieRepository.getMovieBySlug(slug);
    
    // API trả về: { status, message, data: { item: {...} } }
    const movieData = response.data?.item || response.movie;

    if (!movieData) {
      throw new Error('Không tìm thấy phim');
    }

    const movie = transformService.transformMovieDetail(movieData);
    transformService.applyImageUrls(movie);

    return {
      status: 'success',
      data: movie
    };
  }
}

module.exports = new MovieDetailService();
