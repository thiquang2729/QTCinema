/**
 * Transform Service
 * Chịu trách nhiệm transform data từ OPhim API sang format cho frontend
 */

const CDN_IMAGE_URL = 'https://img.ophim.live';

class TransformService {
  /**
   * Transform basic movie data
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
      alternativeNames: movieData.alternative_names || [],
      description: movieData.content,
      rating: movieData.tmdb?.vote_average || 0,
      ratingCount: movieData.tmdb?.vote_count || 0,
      imdb: movieData.imdb,
      year: movieData.year,
      posterPath: movieData.poster_url,
      thumbUrl: movieData.thumb_url,
      type: movieData.type,
      status: movieData.status,
      category: movieData.category,
      country: movieData.country,
      quality: movieData.quality,
      lang: movieData.lang,
      langKey: movieData.lang_key || [],
      episode_current: movieData.episode_current,
      episode_total: movieData.episode_total,
      time: movieData.time,
      view: movieData.view || 0,
      actor: movieData.actor || [],
      director: movieData.director || [],
      trailer_url: movieData.trailer_url,
      episodes: movieData.episodes || []
    };
  }

  /**
   * Tạo URL đầy đủ cho image
   */
  buildImageUrl(imagePath, cdnUrl = CDN_IMAGE_URL) {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${cdnUrl}/uploads/movies/${imagePath}`;
  }

  /**
   * Apply image URLs to movie object
   */
  applyImageUrls(movie, cdnUrl = CDN_IMAGE_URL) {
    if (movie.posterPath) {
      movie.posterPath = this.buildImageUrl(movie.posterPath, cdnUrl);
    }
    if (movie.thumbUrl) {
      movie.thumbUrl = this.buildImageUrl(movie.thumbUrl, cdnUrl);
    }
    return movie;
  }
}

module.exports = new TransformService();
