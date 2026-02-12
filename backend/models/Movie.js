/**
 * Movie Model
 * Định nghĩa cấu trúc dữ liệu cho Movie
 * Sau này khi có database, sẽ sử dụng ORM/ODM tại đây
 */

class Movie {
  constructor(data) {
    this.id = data.id;
    this.slug = data.slug;
    this.title = data.title;
    this.originalTitle = data.originalTitle;
    this.alternativeNames = data.alternativeNames || [];
    this.description = data.description;
    this.rating = data.rating;
    this.year = data.year;
    this.posterPath = data.posterPath;
    this.thumbUrl = data.thumbUrl;
    this.type = data.type;
    this.category = data.category || [];
    this.country = data.country || [];
    this.quality = data.quality;
    this.lang = data.lang;
    this.episode_current = data.episode_current;
    this.episode_total = data.episode_total;
    this.time = data.time;
    this.actor = data.actor;
    this.director = data.director;
    this.trailer_url = data.trailer_url;
    this.episodes = data.episodes;
  }

  /**
   * Validate movie data
   */
  validate() {
    if (!this.title) {
      throw new Error('Title is required');
    }
    if (!this.slug) {
      throw new Error('Slug is required');
    }
    return true;
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      slug: this.slug,
      title: this.title,
      originalTitle: this.originalTitle,
      alternativeNames: this.alternativeNames,
      description: this.description,
      rating: this.rating,
      year: this.year,
      posterPath: this.posterPath,
      thumbUrl: this.thumbUrl,
      type: this.type,
      category: this.category,
      country: this.country,
      quality: this.quality,
      lang: this.lang,
      episode_current: this.episode_current,
      episode_total: this.episode_total,
      time: this.time,
      actor: this.actor,
      director: this.director,
      trailer_url: this.trailer_url,
      episodes: this.episodes
    };
  }
}

module.exports = Movie;
