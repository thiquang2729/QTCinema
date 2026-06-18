import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetHomeMoviesQuery } from '../redux/services/movieApi';
import gsap from 'gsap';

const formatLanguage = (lang) => {
  if (!lang) return '';
  return lang
    .replace(/Thuyết [Mm]inh/g, 'TM')
    .replace(/Lồng [Tt]iếng/g, 'LT')
    .replace(/\s*\+\s*/g, ' + ');
};

/**
 * MovieList - Grid hiển thị danh sách phim dạng Netflix
 * - Nếu được truyền props `movies`, component chỉ render UI với danh sách đó (dùng cho trang tìm kiếm, category, v.v.)
 * - Nếu KHÔNG truyền `movies`, component tự gọi API lấy danh sách phim trang chủ (dùng cho Home)
 */
function MovieList({
  movies: externalMovies,
  title = 'Phim mới cập nhật',
  layout = 'grid', // 'grid' | 'row'
  titleRight = null, // ReactNode hiển thị bên phải title
  loading: externalLoading = false,
  error: externalError = null,
}) {
  const isUsingExternalMovies = Array.isArray(externalMovies);

  const { data: homeData, isLoading: homeLoading, error: homeError } = useGetHomeMoviesQuery(undefined, {
    skip: isUsingExternalMovies,
  });

  const movies = isUsingExternalMovies ? externalMovies : (homeData?.items || []);
  const loading = isUsingExternalMovies ? externalLoading : homeLoading;
  const error = isUsingExternalMovies ? externalError : homeError;

  const isRow = layout === 'row';

  const rowRef = useRef(null);
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Chuỗi định danh danh sách phim để tránh chạy lại animation khi tham chiếu array thay đổi nhưng data giữ nguyên
  const moviesIdString = (movies || []).map((m) => m.id || m._id || m.slug).join(',');

  // GSAP animation for movie cards staggered entrance
  useEffect(() => {
    if (movies && movies.length > 0 && containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.movie-card-item');
      if (cards.length > 0) {
        gsap.killTweensOf(cards);
        
        gsap.fromTo(cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: {
              amount: 0.35,
              grid: 'auto'
            },
            ease: 'power2.out',
            clearProps: 'transform'
          }
        );
      }
    }
  }, [moviesIdString]);

  // Cập nhật trạng thái có thể scroll trái/phải (chỉ dùng cho layout row)
  useEffect(() => {
    if (!isRow) return;

    const el = rowRef.current;
    if (!el) return;

    let timeoutId = null;

    const updateState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    };

    const debouncedUpdate = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        updateState();
        timeoutId = null;
      }, 80);
    };

    // Chạy lần đầu ngay lập tức
    updateState();

    el.addEventListener('scroll', debouncedUpdate, { passive: true });
    window.addEventListener('resize', updateState);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      el.removeEventListener('scroll', debouncedUpdate);
      window.removeEventListener('resize', updateState);
    };
  }, [isRow, movies?.length]);

  const scrollRowBy = (direction) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8);
    const targetScroll = el.scrollLeft + direction * amount;
    
    // Sử dụng GSAP để tạo hiệu ứng cuộn mượt mà có giảm tốc nghệ thuật (custom easing)
    gsap.to(el, {
      scrollLeft: targetScroll,
      duration: 0.75,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  };

  const handleMouseEnter = (e) => {
    const card = e.currentTarget;
    const img = card.querySelector('.movie-poster-img');
    
    gsap.killTweensOf([card, img]);
    
    gsap.to(card, {
      scale: 1.05,
      y: -6,
      duration: 0.3,
      ease: 'power2.out'
    });
    
    if (img) {
      gsap.to(img, {
        scale: 1.1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    const img = card.querySelector('.movie-poster-img');
    
    gsap.killTweensOf([card, img]);
    
    gsap.to(card, {
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: 'power2.out',
      clearProps: 'transform'
    });
    
    if (img) {
      gsap.to(img, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
        clearProps: 'transform'
      });
    }
  };

  // Chỉ hiển thị trạng thái loading / error khi đang dùng dữ liệu trang Home
  if (!isUsingExternalMovies && loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isUsingExternalMovies && error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
        <p className="font-semibold">Lỗi khi tải dữ liệu:</p>
        <p className="text-sm mt-1">{error.message || JSON.stringify(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title ? (
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {titleRight ? <div className="shrink-0">{titleRight}</div> : null}
        </div>
      ) : null}

      {(!movies || movies.length === 0) ? (
        <p className="text-gray-400 text-center py-8">Chưa có dữ liệu phim</p>
      ) : (
        <div className={isRow ? 'relative' : undefined}>
          {/* Nút scroll trái/phải (desktop) */}
          {isRow && (
            <>
              <button
                type="button"
                onClick={() => scrollRowBy(-1)}
                disabled={!canScrollLeft}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Cuộn trái"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => scrollRowBy(1)}
                disabled={!canScrollRight}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Cuộn phải"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            ref={(el) => {
              containerRef.current = el;
              if (isRow) rowRef.current = el;
            }}
            className={
              isRow
                ? 'flex gap-4 overflow-x-auto scrollbar-hide py-4 -mx-4 px-4 sm:mx-0 sm:px-0'
                : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 py-4 px-4'
            }
          >
          {movies.map((movie) => (
            <Link
              key={movie.id || movie._id || movie.slug}
              to={`/phim/${movie.slug}`}
              onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={
                (isRow
                  ? 'group relative shrink-0 w-36 sm:w-44 md:w-48 lg:w-52 bg-black rounded-lg overflow-hidden cursor-pointer will-change-transform'
                  : 'group relative bg-black rounded-lg overflow-hidden cursor-pointer flex flex-col will-change-transform') + ' movie-card-item opacity-0'
              }
            >
              {/* Movie Poster */}
              <div className="aspect-2/3 bg-linear-to-br from-black to-black relative overflow-hidden rounded-lg">
                {movie.thumbUrl ? (
                  <img
                    src={movie.thumbUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover rounded-lg movie-poster-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">🎬</span>
                  </div>
                )}

                {/* Quality & Episode Badge */}
                <div className="absolute top-2 left-2 flex gap-2">
                  {/* {movie.quality && (
                    <span className="inline-flex items-center h-[22px] px-2 bg-red-600 text-white text-xs font-bold rounded">
                      {movie.quality}
                    </span>
                  )} */}
                  {movie.lang && (
                    <span className="inline-flex items-center h-[22px] px-2 bg-blue-600 text-white text-xs font-bold rounded">
                      {formatLanguage(movie.lang)}
                    </span>
                  )}
                </div>

                {movie.episode_current && (
                  <div className="absolute top-2 right-2 flex">
                    <span className="inline-flex items-center h-[22px] px-2 bg-black/70 text-white text-xs font-bold rounded">
                      {movie.episode_current}
                    </span>
                  </div>
                )}
              </div>

              {/* Movie Info - Below Poster */}
              <div className="p-3">
                <h3 className="font-semibold text-white mb-1 text-sm line-clamp-2">
                  {movie.title}
                </h3>
                <p className="text-gray-400 text-xs mb-2 line-clamp-1">
                  {movie.originalTitle}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-yellow-500 font-medium">
                    ⭐ {movie.rating > 0 ? movie.rating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="text-gray-400">{movie.year}</span>
                </div>
              </div>
            </Link>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieList;
