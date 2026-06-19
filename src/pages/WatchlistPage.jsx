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
        <div className="text-center max-w-md bg-gray-900/30 p-10 rounded-3xl border border-gray-800/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          {/* Hiệu ứng ánh sáng nền mờ */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl" />

          <div className="w-20 h-20 bg-gray-800/55 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700/50 shadow-lg">
            <Heart className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-3xl font-black mb-3 text-white tracking-tight">Phim Yêu Thích</h2>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            Vui lòng đăng nhập để lưu trữ, đồng bộ và quản lý danh sách các bộ phim yêu thích của riêng bạn trên mọi thiết bị.
          </p>
          <button
            onClick={() => openSignIn()}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/30 hover:shadow-red-600/40 hover:scale-[1.02] active:scale-95 cursor-pointer"
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

  const firstMovie = normalizedMovies[0];
  const backdropUrl = firstMovie?.thumbUrl || firstMovie?.posterPath || '';

  return (
    <div className="min-h-screen bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Hero hiển thị ảnh mờ của bộ phim đầu tiên */}
        {normalizedMovies.length > 0 && (
          <div className="relative h-[220px] sm:h-[280px] md:h-[320px] overflow-hidden rounded-2xl mb-10 shadow-2xl border border-gray-800/60">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 filter blur-md scale-105"
              style={{ backgroundImage: `url(${backdropUrl})` }}
            />
            {/* Dark Overlay & Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            
            {/* Content inside Banner */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 z-10 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600/90 text-white text-[10px] sm:text-xs font-semibold rounded-full uppercase tracking-wider mb-2.5 w-fit shadow-lg shadow-red-600/30">
                <Heart className="w-3 h-3 fill-white" /> Bộ sưu tập của tôi
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight drop-shadow-md bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                Danh Sách Yêu Thích
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm md:text-base max-w-xl line-clamp-2 drop-shadow-sm">
                Nơi lưu trữ những bộ phim bạn thích và muốn theo dõi. Hiện tại bạn đang lưu trữ <span className="text-red-500 font-bold">{normalizedMovies.length}</span> tựa phim.
              </p>
            </div>
          </div>
        )}

        {/* Cấu trúc Header chính nếu không có banner (ví dụ khi danh sách trống) */}
        {normalizedMovies.length === 0 && (
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
          </div>
        )}

        {/* Content */}
        {error ? (
          <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-8 text-center text-red-400 max-w-lg mx-auto backdrop-blur-xl shadow-lg">
            <p className="font-bold text-lg">Đã xảy ra lỗi khi tải danh sách</p>
            <p className="text-sm mt-1.5 opacity-80">{error?.message || 'Vui lòng thử lại sau.'}</p>
          </div>
        ) : normalizedMovies.length > 0 ? (
          <MovieList movies={normalizedMovies} title="" layout="grid" />
        ) : (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-900/40 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800 relative shadow-inner">
              <Heart className="w-12 h-12 text-gray-600 animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-red-500/10 scale-125 animate-ping opacity-20" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-200">Danh sách trống</h3>
            <p className="text-gray-400 mb-8 text-sm max-w-sm mx-auto leading-relaxed">
              Bạn chưa thêm bất kỳ bộ phim nào vào danh sách yêu thích của mình. Hãy khám phá và lưu lại những tựa phim hấp dẫn!
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all hover:scale-[1.03] shadow-lg shadow-red-600/30 hover:shadow-red-600/40 cursor-pointer active:scale-95"
            >
              <Home className="w-4.5 h-4.5" />
              Khám phá phim ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchlistPage;
