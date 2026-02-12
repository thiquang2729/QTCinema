import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovies } from '../redux/slices/movieSlice';

function MovieList() {
  const dispatch = useDispatch();
  const { movies, loading, error } = useSelector((state) => state.movies);

  useEffect(() => {
    // Gọi API khi component mount
    dispatch(fetchMovies());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Lỗi khi tải dữ liệu:</p>
        <p className="text-sm mt-1">{error.message || JSON.stringify(error)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Danh sách phim</h2>
      
      {movies.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Chưa có dữ liệu phim</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                {movie.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-3">
                {movie.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-indigo-600 font-medium">
                  {movie.rating} ⭐
                </span>
                <span className="text-gray-500 text-sm">{movie.year}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MovieList;
