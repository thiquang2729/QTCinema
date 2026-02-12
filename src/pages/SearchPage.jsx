import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchMovies } from '../redux/slices/movieSlice';
import MovieList from '../components/MovieList';
import { Search } from 'lucide-react';

function SearchPage() {
  const { keyword } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { searchResults, searchLoading, searchPagination } = useSelector((state) => state.movies);

  useEffect(() => {
    if (keyword && keyword.length >= 2) {
      dispatch(searchMovies({ keyword, page: 1, limit: 24 }));
    }
  }, [keyword, dispatch]);

  if (!keyword || keyword.length < 2) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-2xl font-bold mb-2">Tìm kiếm phim</h2>
          <p className="text-gray-400">Vui lòng nhập từ khóa (tối thiểu 2 ký tự)</p>
        </div>
      </div>
    );
  }

  if (searchLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Kết quả tìm kiếm: <span className="text-red-600">{keyword}</span>
          </h1>
          {searchPagination.totalItems > 0 && (
            <p className="text-gray-400">
              Tìm thấy {searchPagination.totalItems} kết quả
            </p>
          )}
        </div>

        {/* Results */}
        {searchResults.length > 0 ? (
          <MovieList movies={searchResults} />
        ) : (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-400 mb-6">
              Không có phim nào phù hợp với từ khóa "{keyword}"
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
            >
              Về trang chủ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
