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
    
    /**
     * Các API OPhim có 2 kiểu response phổ biến:
     * - https://ophim1.com/phim/:slug
     *   { status: true, msg: '', movie: {...}, episodes: [...] }
     * - Một số domain khác:
     *   { status, message, data: { item: {..., episodes: [...] } } }
     */
    const movieData =
      response.data?.item || // kiểu { data: { item } }
      response.data?.movie || // phòng trường hợp movie nằm trong data.movie
      response.movie; // kiểu { movie }

    // Lấy danh sách episodes nếu có
    const episodes =
      response.data?.item?.episodes || // kiểu { data: { item: { episodes } } }
      response.data?.episodes || // kiểu { data: { episodes } }
      response.episodes || // kiểu { episodes }
      [];

    if (!movieData) {
      throw new Error('Không tìm thấy phim');
    }

    const movie = transformService.transformMovieDetail(movieData);
    transformService.applyImageUrls(movie);

    // Gắn episodes vào movie để FE hiển thị danh sách tập phim
    movie.episodes = episodes;

    return {
      status: 'success',
      data: movie
    };
  }

  /**
   * Lấy danh sách hình ảnh phim
   */
  async getMovieImages(slug) {
    const response = await movieRepository.getMovieImages(slug);
    
    if (!response.success) {
      throw new Error('Không thể lấy hình ảnh phim');
    }

    const data = response.data;
    const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

    // Transform images với full URLs
    const images = data.images.map(img => ({
      width: img.width,
      height: img.height,
      aspectRatio: img.aspect_ratio,
      type: img.type,
      filePath: img.file_path,
      // Tạo URLs với các sizes khác nhau
      urls: {
        original: `${TMDB_IMAGE_BASE}/original${img.file_path}`,
        w1280: img.type === 'backdrop' ? `${TMDB_IMAGE_BASE}/w1280${img.file_path}` : null,
        w780: `${TMDB_IMAGE_BASE}/w780${img.file_path}`,
        w342: img.type === 'poster' ? `${TMDB_IMAGE_BASE}/w342${img.file_path}` : null,
        w300: img.type === 'backdrop' ? `${TMDB_IMAGE_BASE}/w300${img.file_path}` : null,
        w185: img.type === 'poster' ? `${TMDB_IMAGE_BASE}/w185${img.file_path}` : null
      }
    }));

    return {
      status: 'success',
      data: {
        tmdbId: data.tmdb_id,
        tmdbType: data.tmdb_type,
        ophimId: data.ophim_id,
        slug: data.slug,
        imdbId: data.imdb_id,
        imageSizes: data.image_sizes,
        images: images,
        // Phân loại images
        backdrops: images.filter(img => img.type === 'backdrop'),
        posters: images.filter(img => img.type === 'poster')
      }
    };
  }

  /**
   * Lấy thông tin diễn viên/đạo diễn
   */
  async getMoviePeoples(slug) {
    const response = await movieRepository.getMoviePeoples(slug);
    
    if (!response.success) {
      throw new Error('Không thể lấy thông tin diễn viên');
    }

    const data = response.data;
    const TMDB_PROFILE_BASE = 'https://image.tmdb.org/t/p';

    // Transform peoples với full profile URLs
    const peoples = data.peoples.map(person => ({
      tmdbPeopleId: person.tmdb_people_id,
      adult: person.adult,
      gender: person.gender,
      genderName: person.gender_name,
      name: person.name,
      originalName: person.original_name,
      character: person.character,
      knownForDepartment: person.known_for_department,
      profilePath: person.profile_path,
      // Tạo URLs với các sizes khác nhau
      profileUrls: person.profile_path ? {
        original: `${TMDB_PROFILE_BASE}/original${person.profile_path}`,
        h632: `${TMDB_PROFILE_BASE}/h632${person.profile_path}`,
        w185: `${TMDB_PROFILE_BASE}/w185${person.profile_path}`,
        w45: `${TMDB_PROFILE_BASE}/w45${person.profile_path}`
      } : null
    }));

    return {
      status: 'success',
      data: {
        tmdbId: data.tmdb_id,
        tmdbType: data.tmdb_type,
        ophimId: data.ophim_id,
        slug: data.slug,
        imdbId: data.imdb_id,
        profileSizes: data.profile_sizes,
        peoples: peoples,
        // Phân loại theo department
        cast: peoples.filter(p => p.knownForDepartment === 'Acting'),
        crew: peoples.filter(p => p.knownForDepartment !== 'Acting')
      }
    };
  }

  /**
   * Lấy từ khóa phim
   */
  async getMovieKeywords(slug) {
    const response = await movieRepository.getMovieKeywords(slug);
    
    if (!response.success) {
      throw new Error('Không thể lấy từ khóa phim');
    }

    const data = response.data;

    // Transform keywords
    const keywords = data.keywords.map(keyword => ({
      tmdbKeywordId: keyword.tmdb_keyword_id,
      name: keyword.name,
      nameVn: keyword.name_vn
    }));

    return {
      status: 'success',
      data: {
        tmdbId: data.tmdb_id,
        tmdbType: data.tmdb_type,
        ophimId: data.ophim_id,
        slug: data.slug,
        imdbId: data.imdb_id,
        keywords: keywords
      }
    };
  }
}

module.exports = new MovieDetailService();
