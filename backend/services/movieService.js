const movieRepository = require('../repositories/movieRepository');

/**
 * Service layer - Chứa business logic
 * Transform data từ repository thành format phù hợp cho frontend
 */
class MovieService {
  /**
   * Transform movie data từ OPhim API
   */
  transformMovie(movie) {
    return {
      id: movie._id,
      slug: movie.slug,
      title: movie.name,
      originalTitle: movie.origin_name,
      alternativeNames: movie.alternative_names || [],
      description: movie.content || movie.description || '',
      rating: movie.tmdb?.vote_average || 0,
      year: movie.year,
      posterPath: movie.poster_url,
      thumbUrl: movie.thumb_url,
      type: movie.type,
      category: movie.category?.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug
      })) || [],
      country: movie.country?.map(cnt => ({
        id: cnt.id,
        name: cnt.name,
        slug: cnt.slug
      })) || [],
      quality: movie.quality,
      lang: movie.lang,
      episode_current: movie.episode_current,
      episode_total: movie.episode_total
    };
  }

  /**
   * Transform detailed movie data
   */
  transformMovieDetail(movieData) {
    return {
      id: movieData._id,
      slug: movieData.slug,
      title: movieData.name,
      originalTitle: movieData.origin_name,
      description: movieData.content,
      rating: movieData.tmdb?.vote_average || 0,
      year: movieData.year,
      posterPath: movieData.poster_url,
      thumbUrl: movieData.thumb_url,
      type: movieData.type,
      category: movieData.category,
      country: movieData.country,
      quality: movieData.quality,
      lang: movieData.lang,
      episode_current: movieData.episode_current,
      episode_total: movieData.episode_total,
      time: movieData.time,
      actor: movieData.actor,
      director: movieData.director,
      trailer_url: movieData.trailer_url,
      episodes: movieData.episodes
    };
  }

  /**
   * Lấy danh sách phim từ trang chủ
   */
  async getHomeMovies(page = 1) {
    const response = await movieRepository.getHomeMovies(page);
    const data = response.data || {};
    const items = data.items || [];

    return {
      status: 'success',
      items: items.map(movie => this.transformMovie(movie)),
      pagination: data.params?.pagination || {},
      cdnImageUrl: data.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.cc/uploads/movies/'
    };
  }

  /**
   * Lấy chi tiết phim
   */
  async getMovieBySlug(slug) {
    const response = await movieRepository.getMovieBySlug(slug);
    const movieData = response.movie || response.data?.item;

    if (!movieData) {
      throw new Error('Không tìm thấy phim');
    }

    return {
      status: 'success',
      data: this.transformMovieDetail(movieData)
    };
  }

  /**
   * Tìm kiếm phim
   */
  async searchMovies(keyword, page = 1) {
    const response = await movieRepository.searchMovies(keyword, page);
    const items = response.items || response.data?.items || [];

    return {
      status: 'success',
      items: items.map(movie => this.transformMovie(movie)),
      pagination: response.pagination || {}
    };
  }

  /**
   * Lấy phim theo thể loại
   */
  async getMoviesByCategory(categorySlug, page = 1) {
    const response = await movieRepository.getMoviesByCategory(categorySlug, page);
    const items = response.items || response.data?.items || [];

    return {
      status: 'success',
      items: items.map(movie => this.transformMovie(movie)),
      pagination: response.pagination || {}
    };
  }

  /**
   * Lấy phim theo quốc gia
   */
  async getMoviesByCountry(countrySlug, page = 1) {
    const response = await movieRepository.getMoviesByCountry(countrySlug, page);
    const items = response.items || response.data?.items || [];

    return {
      status: 'success',
      items: items.map(movie => this.transformMovie(movie)),
      pagination: response.pagination || {}
    };
  }
}

module.exports = new MovieService();
