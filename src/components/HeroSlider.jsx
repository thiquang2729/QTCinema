import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';

function HeroSlider() {
  const { movies } = useSelector((state) => state.movies);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Lấy 5 phim đầu tiên cho slider
  const sliderMovies = movies.slice(0, 5);

  // Auto play slider
  useEffect(() => {
    if (!isAutoPlaying || sliderMovies.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderMovies.length);
    }, 3000); // Chuyển slide mỗi 3 giây

    return () => clearInterval(interval);
  }, [isAutoPlaying, sliderMovies.length]);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderMovies.length) % sliderMovies.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderMovies.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  if (sliderMovies.length === 0) {
    return (
      <div className="relative h-[80vh] bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-gray-400">Đang tải phim...</div>
      </div>
    );
  }

  const currentMovie = sliderMovies[currentSlide];

  return (
    <div className="relative h-[80vh] overflow-hidden">
      {/* Slides Container */}
      <div className="relative h-full">
        {sliderMovies.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={movie.thumbUrl || movie.posterPath}
                alt={movie.title}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl space-y-4">
                  {/* Title */}
                  <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
                    {movie.title}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm md:text-base">
                    {movie.rating > 0 && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <span className="text-lg">⭐</span>
                        <span className="font-semibold">{movie.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <span className="text-gray-300">{movie.year}</span>
                    {movie.quality && (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                        {movie.quality}
                      </span>
                    )}
                    {movie.episode_current && (
                      <span className="text-gray-300">{movie.episode_current}</span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm md:text-base line-clamp-3 max-w-xl">
                    {movie.description || movie.originalTitle}
                  </p>

                  {/* Categories */}
                  {movie.category && movie.category.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {movie.category.slice(0, 3).map((cat) => (
                        <span
                          key={cat.id}
                          className="px-3 py-1 bg-gray-800/60 text-gray-300 text-xs rounded-full"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Link
                      to={`/phim/${movie.slug}`}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                      <Play className="w-5 h-5" fill="currentColor" />
                      Xem ngay
                    </Link>
                    <Link
                      to={`/phim/${movie.slug}`}
                      className="px-6 py-3 bg-gray-700/80 hover:bg-gray-700 text-white font-semibold rounded flex items-center gap-2 transition-all border border-gray-600"
                    >
                      <Info className="w-5 h-5" />
                      Thông tin
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {sliderMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-red-600 w-8'
                : 'bg-gray-400 hover:bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSlider;
