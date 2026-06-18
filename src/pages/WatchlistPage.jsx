import { useUser, useClerk } from '@clerk/react';
import { useGetWatchlistQuery } from '../redux/services/userApi';
import MovieList from '../components/MovieList';
import { Heart, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function WatchlistPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();

  const { data: watchlistData, isLoading, error } = useGetWatchlistQuery(undefined, {
    skip: !isSignedIn,
  });

  const watchlist = watchlistData?.data || [];

  // Chuẩn hóa dữ liệu watchlist thành format mà MovieList component hiểu
  const normalizedMovies = watchlist.map((item) => ({
    id: item.movieSlug,
    slug: item.movieSlug,
    title: item.title,
    originalTitle: item.originalTitle || '',
    posterPath: item.posterPath || '',
    thumbUrl: item.thumbUrl || item.posterPath || '',
    type: item.movieType || 'single',
    rating: item.rating || 0,
    year: item.year || '',
    quality: item.quality || 'FHD',
    lang: item.lang || 'Vietsub',
    episode_current: item.episode_current || '',
  }));

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-gray-900/40 p-8 rounded-2xl border border-gray-800 backdrop-blur-xl">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-2xl font-bold mb-3">Phim yêu thích</h2>
          <p className="text-gray-400 mb-6">
            Vui lòng đăng nhập để lưu trữ và xem danh sách các bộ phim yêu thích của riêng bạn.
          </p>
          <button
            onClick={() => openSignIn()}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-red-600/20 hover:scale-[1.02] cursor-pointer"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Section */}
        <div className="border-b border-gray-900 pb-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-600 fill-red-600" />
              Danh sách yêu thích
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Nơi lưu trữ những bộ phim bạn thích và muốn theo dõi.
            </p>
          </div>
          {normalizedMovies.length > 0 && (
            <span className="text-xs sm:text-sm font-semibold bg-red-600/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-full">
              {normalizedMovies.length} phim
            </span>
          )}
        </div>

        {/* Content */}
        {error ? (
          <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-6 text-center text-red-400 max-w-lg mx-auto">
            <p className="font-semibold">Đã xảy ra lỗi khi tải danh sách</p>
            <p className="text-sm mt-1">{error?.message || 'Vui lòng thử lại sau.'}</p>
          </div>
        ) : normalizedMovies.length > 0 ? (
          <MovieList movies={normalizedMovies} title="" layout="grid" />
        ) : (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-900/60 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
              <Heart className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Danh sách trống</h3>
            <p className="text-gray-400 mb-8 text-sm">
              Bạn chưa thêm bất kỳ bộ phim nào vào danh sách yêu thích của mình.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all hover:scale-[1.02] shadow-lg shadow-red-600/15 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Khám phá phim ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchlistPage;
