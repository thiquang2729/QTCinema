import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { useGetHomeMoviesQuery } from '../redux/services/movieApi';
import { useUser } from '@clerk/react';
import {
  useGetWatchHistoryQuery,
  useDeleteWatchHistoryMutation,
} from '../redux/services/userApi';
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
  isContinueWatching = false,
}) {
  const isUsingExternalMovies = Array.isArray(externalMovies);

  const { data: homeData, isLoading: homeLoading, error: homeError } = useGetHomeMoviesQuery(undefined, {
    skip: isUsingExternalMovies,
  });

  const movies = isUsingExternalMovies ? externalMovies : (homeData?.items || []);
  const loading = isUsingExternalMovies ? externalLoading : homeLoading;
  const error = isUsingExternalMovies ? externalError : homeError;

  const isRow = layout === 'row';

  const { isSignedIn } = useUser();
  const { data: historyData } = useGetWatchHistoryQuery(undefined, {
    skip: !isSignedIn,
  });
  const watchHistory = historyData?.data || [];
  const [deleteWatchHistory] = useDeleteWatchHistoryMutation();

  const handleDeleteHistory = async (e, movieSlug) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteWatchHistory(movieSlug).unwrap();
    } catch (err) {
      console.error('Failed to delete history:', err);
    }
  };

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
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);
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
          {/* Nút scroll trái/phải (desktop) và các dải gradient mờ ở 2 bên rìa dọc */}
          {isRow && (
            <>
              {/* Lớp gradient mờ ở rìa trái (hiển thị khi có thể cuộn trái hoặc là mục tiếp tục xem) */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent pointer-events-none z-20 transition-opacity duration-300 ${
                  (canScrollLeft || isContinueWatching) ? 'opacity-100' : 'opacity-0'
                }`}
              />
              {/* Lớp gradient mờ ở rìa phải (hiển thị khi có thể cuộn phải) */}
              <div
                className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent pointer-events-none z-20 transition-opacity duration-300 ${
                  canScrollRight ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollRowBy(-1)}
                  className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white transition hover:scale-105"
                  aria-label="Cuộn trái"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollRowBy(1)}
                  className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-30 h-12 w-12 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white transition hover:scale-105"
                  aria-label="Cuộn phải"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
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
            {movies.map((movie) => {
              const historyItem = watchHistory.find(
                (h) => h.movieSlug === movie.slug || h.movieSlug === movie.id
              );
              const percent = (historyItem && historyItem.duration)
                ? (historyItem.currentTime / historyItem.duration) * 100
                : (historyItem && historyItem.currentTime > 0 ? 50 : 0);
              const progressPercent = Math.min(Math.max(percent, 0), 100);

              const cardLink = isContinueWatching && historyItem
                ? `/xem/${movie.slug}?server=${historyItem.serverIndex || 0}&ep=${historyItem.epIndex || 0}`
                : `/phim/${movie.slug}`;

              return (
                <Link
                  key={movie.id || movie._id || movie.slug}
                  to={cardLink}
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
                    {movie.thumbUrl || movie.posterPath ? (
                      <img
                        src={movie.thumbUrl || movie.posterPath}
                        alt={movie.title}
                        className="w-full h-full object-cover rounded-lg movie-poster-img transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">🎬</span>
                      </div>
                    )}

                    {/* Nút X xóa lịch sử (chỉ khi là danh sách tiếp tục xem và đang hover) */}
                    {isContinueWatching && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistory(e, movie.slug)}
                        className="absolute top-2 right-2 z-35 w-6.5 h-6.5 rounded-full bg-black/70 hover:bg-black/95 text-gray-300 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-md hover:scale-105"
                        title="Xóa khỏi danh sách"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}



                    {/* Quality & Episode Badge */}
                    <div className="absolute top-2 left-2 flex gap-2">
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

                    {/* Red Progress Bar - Hiển thị ở tất cả các thẻ phim khi có tiến độ xem dở */}
                    {progressPercent > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800/80 backdrop-blur-xs rounded-b-lg">
                        <div
                          className="h-full bg-red-600 transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Movie Info - Below Poster */}
                  <div className="p-3">
                    <h3 className="font-semibold text-white mb-1 text-sm line-clamp-1 group-hover:text-red-500 transition-colors duration-200">
                      {movie.title}
                    </h3>

                    {isContinueWatching && historyItem ? (
                      <>
                        <p className="text-gray-400 text-xs mb-2 line-clamp-1">
                          Đang xem: {historyItem.episodeName || 'Tập 1'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Tiến độ: {Math.round(progressPercent)}%</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-400 text-xs mb-2 line-clamp-1">
                          {movie.originalTitle}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-yellow-500 font-medium">
                            ⭐ {movie.rating > 0 ? movie.rating.toFixed(1) : '10.0'}
                          </span>
                          <span className="text-gray-400">{movie.year || '2026'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieList;
