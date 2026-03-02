import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMovies } from '../redux/slices/movieSlice';

/**
 * MovieList - Grid hiển thị danh sách phim dạng Netflix
 * - Nếu được truyền props `movies`, component chỉ render UI với danh sách đó (dùng cho trang tìm kiếm, category, v.v.)
 * - Nếu KHÔNG truyền `movies`, component tự gọi API lấy danh sách phim trang chủ (dùng cho Home)
 */
function MovieList({ movies: externalMovies, title = 'Phim mới cập nhật' }) {
  const dispatch = useDispatch();
  const { movies: homeMovies, loading, error } = useSelector((state) => state.movies);

  const isUsingExternalMovies = Array.isArray(externalMovies);
  const movies = isUsingExternalMovies ? externalMovies : homeMovies;

  useEffect(() => {
    // Chỉ tự fetch khi dùng cho trang Home (không truyền movies từ ngoài vào)
    if (!isUsingExternalMovies) {
      dispatch(fetchMovies());
    }
  }, [dispatch, isUsingExternalMovies]);

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
      <h2 className="text-2xl font-bold text-white">{title}</h2>

      {(!movies || movies.length === 0) ? (
        <p className="text-gray-400 text-center py-8">Chưa có dữ liệu phim</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <Link
              key={movie.id || movie._id || movie.slug}
              to={`/phim/${movie.slug}`}
              className="group relative bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col"
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
      )}
    </div>
  );
}

export default MovieList;
