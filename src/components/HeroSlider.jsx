import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import gsap from 'gsap';

function HeroSlider({ movies = [], loading = false }) {
  const sliderMovies = Array.isArray(movies) ? movies.slice(0, 5) : [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const slideRef = useRef(null);

  // GSAP animation for slider transitions
  useEffect(() => {
    if (slideRef.current && sliderMovies.length > 0) {
      const title = slideRef.current.querySelector('.slide-title');
      const meta = slideRef.current.querySelector('.slide-meta');
      const desc = slideRef.current.querySelector('.slide-desc');
      const cats = slideRef.current.querySelector('.slide-cats');
      const buttons = slideRef.current.querySelector('.slide-buttons');
      const bg = slideRef.current.querySelector('.slide-bg');

      const ctx = gsap.context(() => {
        // Zoom in & fade in background image
        if (bg) {
          gsap.fromTo(bg, 
            { scale: 1.1, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' }
          );
        }

        // Stagger slide up and fade in text elements
        const textElements = [title, meta, desc, cats, buttons].filter(Boolean);
        if (textElements.length > 0) {
          gsap.fromTo(textElements,
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
          );
        }
      }, slideRef);

      return () => ctx.revert();
    }
  }, [currentSlide, sliderMovies.length]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

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

  if (loading || sliderMovies.length === 0) {
    return (
      <div className="relative h-[60vh] md:h-[80vh] bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-gray-400">Đang tải phim...</div>
      </div>
    );
  }

  const currentMovie = sliderMovies[currentSlide];

  return (
    <div
      className="relative h-[60vh] md:h-[80vh] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div className="relative h-full">
        {sliderMovies.map((movie, index) => (
          <div
            key={movie.id}
            ref={index === currentSlide ? slideRef : null}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={movie.thumbUrl || movie.posterPath}
                alt={movie.title}
                className="w-full h-full object-cover slide-bg"
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
                  <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg slide-title">
                    {movie.title}
                  </h1>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm md:text-base slide-meta">
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
                  <p className="text-gray-300 text-sm md:text-base line-clamp-3 max-w-xl slide-desc">
                    {movie.description || movie.originalTitle}
                  </p>

                  {/* Categories */}
                  {movie.category && movie.category.length > 0 && (
                    <div className="flex flex-wrap gap-2 slide-cats">
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
                  <div className="flex gap-2 md:gap-3 pt-2 slide-buttons">
                    <Link
                      to={`/phim/${movie.slug}`}
                      className="px-3 py-2 md:px-6 md:py-3 text-xs md:text-base bg-red-600 hover:bg-red-700 text-white font-semibold rounded flex items-center gap-1 md:gap-2 transition-all hover:scale-105 active:scale-95"
                    >
                      <Play className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
                      Xem ngay
                    </Link>
                    <Link
                      to={`/phim/${movie.slug}`}
                      className="px-3 py-2 md:px-6 md:py-3 text-xs md:text-base bg-gray-700/80 hover:bg-gray-700 text-white font-semibold rounded flex items-center gap-1 md:gap-2 transition-all border border-gray-600"
                    >
                      <Info className="w-4 h-4 md:w-5 md:h-5" />
                      Thông tin
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - ẩn trên mobile */}
      <button
        onClick={goToPrevious}
        className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={goToNext}
        className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all z-10"
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
