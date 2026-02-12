import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovieById, fetchMovieImages, fetchMoviePeoples, fetchMovieKeywords } from '../redux/slices/movieSlice';
import { ArrowLeft, Play, Star, Calendar, Clock, Eye } from 'lucide-react';
import ImageGallery from '../components/ImageGallery';

function MovieDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedMovie, movieImages, moviePeoples, movieKeywords, loading, imagesLoading, error } = useSelector((state) => state.movies);
  const movie = selectedMovie;

  useEffect(() => {
    if (slug) {
      dispatch(fetchMovieById(slug));
      dispatch(fetchMovieImages(slug));
      // dispatch(fetchMoviePeoples(slug));
      // dispatch(fetchMovieKeywords(slug));
    }
  }, [slug, dispatch]);

  const handlePlayDefault = () => {
    if (!movie) return;
    navigate(`/xem/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-gray-400 text-xl">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!selectedMovie) return null;

  const heroBackdrop =
    movieImages?.backdrops?.[0]?.urls?.w1280 ||
    movieImages?.backdrops?.[0]?.urls?.original ||
    null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[70vh]">
        <div className="absolute inset-0">
          <img
            src={heroBackdrop || movie.thumbUrl || movie.posterPath}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-10 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Movie Info */}
        <div className="relative h-full flex items-end pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{movie.title}</h1>
              <p className="text-gray-300 text-lg mb-4">{movie.originalTitle}</p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {movie.rating > 0 && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-5 h-5" fill="currentColor" />
                    <span className="font-semibold">{movie.rating.toFixed(1)}</span>
                    {movie.ratingCount > 0 && (
                      <span className="text-gray-400 text-sm">({movie.ratingCount})</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>{movie.year}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-300">
                  <Clock className="w-4 h-4" />
                  <span>{movie.time}</span>
                </div>
                {movie.view > 0 && (
                  <div className="flex items-center gap-1 text-gray-300">
                    <Eye className="w-4 h-4" />
                    <span>{movie.view.toLocaleString()}</span>
                  </div>
                )}
                <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded">
                  {movie.quality}
                </span>
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
                  {movie.lang}
                </span>
              </div>

              {/* Play Button */}
              <button
                onClick={handlePlayDefault}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center gap-3 transition-all hover:scale-105"
              >
                <Play className="w-6 h-6" fill="currentColor" />
                Xem phim
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Nội dung phim</h2>
              <p className="text-gray-300 leading-relaxed">{movie.description}</p>
            </div>

            {/* Episodes */}
            {movie.episodes && movie.episodes.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Danh sách tập phim</h2>
                {movie.episodes.map((server, serverIndex) => (
                  <div key={serverIndex} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-red-500">
                      Server: {server.server_name}
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {server.server_data.map((episode, epIndex) => (
                        <button
                          key={epIndex}
                          onClick={() =>
                            navigate(
                              `/xem/${slug}?server=${serverIndex}&ep=${epIndex}`
                            )
                          }
                          className="px-4 py-2 rounded transition-all text-sm border bg-gray-800 border-gray-700 text-gray-100 hover:bg-red-600 hover:border-red-500"
                        >
                          {episode.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Image Gallery */}
            {movieImages && (
              <ImageGallery
                backdrops={movieImages.backdrops || []}
                posters={movieImages.posters || []}
              />
            )}

            {/* Keywords */}
            {/* {movieKeywords && movieKeywords.keywords && movieKeywords.keywords.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Từ khóa</h2>
                <div className="flex flex-wrap gap-2">
                  {movieKeywords.keywords.map((keyword, index) => (
                    <span
                      key={keyword.tmdbKeywordId || index}
                      className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700 text-gray-300 text-sm rounded-full border border-gray-700 transition-all cursor-pointer"
                      title={keyword.name}
                    >
                      {keyword.nameVn || keyword.name}
                    </span>
                  ))}
                </div>
              </div>
            )} */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Poster */}
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src={movie.posterPath}
                alt={movie.title}
                className="w-full"
              />
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Trạng thái</h3>
                <p className="text-white">{movie.status === 'completed' ? 'Hoàn thành' : 'Đang cập nhật'}</p>
              </div>

              <div>
                <h3 className="text-gray-400 text-sm mb-1">Số tập</h3>
                <p className="text-white">{movie.episode_current} / {movie.episode_total}</p>
              </div>

              {movie.category && movie.category.length > 0 && (
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">Thể loại</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.category.map((cat) => (
                      <span
                        key={cat.id}
                        className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.country && movie.country.length > 0 && (
                <div>
                  <h3 className="text-gray-400 text-sm mb-2">Quốc gia</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.country.map((cnt) => (
                      <span
                        key={cnt.id}
                        className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full"
                      >
                        {cnt.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {movie.actor && movie.actor.length > 0 && (
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Diễn viên</h3>
                  <p className="text-white text-sm">{movie.actor.join(', ')}</p>
                </div>
              )}

              {movie.director && movie.director.length > 0 && (
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Đạo diễn</h3>
                  <p className="text-white text-sm">{movie.director.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
