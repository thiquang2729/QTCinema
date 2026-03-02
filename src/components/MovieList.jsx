import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchMovies } from '../redux/slices/movieSlice';

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
}) {
  const dispatch = useDispatch();
  const { movies: homeMovies, loading, error } = useSelector((state) => state.movies);

  const isUsingExternalMovies = Array.isArray(externalMovies);
  const movies = isUsingExternalMovies ? externalMovies : homeMovies;
  const isRow = layout === 'row';

  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    // Chỉ tự fetch khi dùng cho trang Home (không truyền movies từ ngoài vào)
    if (!isUsingExternalMovies) {
      dispatch(fetchMovies());
    }
  }, [dispatch, isUsingExternalMovies]);

  // Cập nhật trạng thái có thể scroll trái/phải (chỉ dùng cho layout row)
  useEffect(() => {
    if (!isRow) return;

    const el = rowRef.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [isRow, movies?.length]);

  const scrollRowBy = (direction) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: direction * amount, behavior: 'smooth' });
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
            ref={isRow ? rowRef : undefined}
            className={
              isRow
                ? 'flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth'
                : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
            }
          >
          {movies.map((movie) => (
            <Link
              key={movie.id || movie._id || movie.slug}
              to={`/phim/${movie.slug}`}
              className={
                isRow
                  ? 'group relative shrink-0 w-36 sm:w-44 md:w-48 lg:w-52 bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer'
                  : 'group relative bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col'
              }
            >
              {/* Movie Poster */}
              <div className="aspect-2/3 bg-linear-to-br from-gray-800 to-gray-900 relative">
                {movie.thumbUrl ? (
                  <img
                    src={movie.thumbUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">🎬</span>
                  </div>
                )}

                {/* Quality & Episode Badge */}
                <div className="absolute top-2 left-2 flex gap-2">
                  {movie.quality && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                      {movie.quality}
                    </span>
                  )}
                  {movie.lang && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                      {movie.lang}
                    </span>
                  )}
                </div>

                {movie.episode_current && (
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-1 bg-black/70 text-white text-xs font-bold rounded">
                      {movie.episode_current}
                    </span>
                  </div>
                )}
              </div>

              {/* Movie Info Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent opacity-100 flex flex-col justify-end p-4">
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
