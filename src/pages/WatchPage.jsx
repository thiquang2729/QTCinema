import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMovieById, fetchMovieImages } from '../redux/slices/movieSlice';
import { ArrowLeft } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';

function WatchPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedMovie, movieImages, loading, error } = useSelector((state) => state.movies);

  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [serverIndex, setServerIndex] = useState(
    Number(searchParams.get('server')) || 0
  );

  useEffect(() => {
    if (slug) {
      dispatch(fetchMovieById(slug));
      dispatch(fetchMovieImages(slug));
    }
  }, [slug, dispatch]);

  const movie = selectedMovie;

  const findEpisode = (movieData, sIndex, eIndex) => {
    if (!movieData?.episodes?.length) return null;
    const server = movieData.episodes[sIndex] || movieData.episodes[0];
    if (!server?.server_data?.length) return null;

    const episode =
      typeof eIndex === 'number'
        ? server.server_data[eIndex] || server.server_data[0]
        : server.server_data[0];

    return {
      serverName: server.server_name,
      serverIndex: sIndex,
      episodeIndex: server.server_data.indexOf(episode),
      ...episode,
    };
  };

  // Thiết lập tập hiện tại theo URL hoặc mặc định
  useEffect(() => {
    if (!movie) return;

    const epParam = searchParams.get('ep');
    const epIndex = epParam ? Number(epParam) : undefined;
    const found = findEpisode(movie, serverIndex, epIndex);
    if (found?.link_m3u8) {
      setCurrentEpisode(found);
    }
  }, [movie, serverIndex, searchParams]);

  if (loading || !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-300">
        Đang tải phim...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-500">
        {typeof error === 'string' ? error : 'Không thể tải phim'}
      </div>
    );
  }

  const heroPoster =
    movieImages?.backdrops?.[0]?.urls?.w780 ||
    movieImages?.backdrops?.[0]?.urls?.w1280 ||
    movie.thumbUrl ||
    movie.posterPath;

  const handleBackToDetail = () => {
    // Đi theo history để không tạo thêm entry mới.
    // Tránh trường hợp từ Chi tiết -> Xem -> Quay lại chi tiết,
    // rồi ở Chi tiết bấm nút Back lại quay về trang Xem.
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(`/phim/${slug}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Thanh trên cùng */}
      <div className="h-12 flex items-center px-6 border-b border-gray-900 bg-black/90">
        <button
          type="button"
          onClick={handleBackToDetail}
          className="flex items-center gap-2 text-gray-200 hover:text-white text-sm font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại</span>
        </button>
        <div className="ml-4 text-sm text-gray-300 truncate">
          {movie.title}
          {currentEpisode && ` • Tập ${currentEpisode.name}`}
        </div>
      </div>

      {/* Khu vực player + danh sách tập */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-3rem)]">
        {/* Player */}
        <div className="flex-1 bg-black flex items-center justify-center xl:px-8">
          {currentEpisode ? (
            <VideoPlayer
              src={currentEpisode.link_m3u8}
              poster={heroPoster}
              title={movie.title}
              episodeLabel={`Tập ${currentEpisode.name}`}
              autoPlay
              fullScreen
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Không tìm thấy tập phim để phát
            </div>
          )}
        </div>

        {/* Danh sách tập bên phải (desktop) / bên dưới (mobile) */}
        <div className="w-full lg:w-80 bg-black border-t lg:border-t-0 lg:border-l border-gray-900 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-3">Danh sách tập phim</h2>

            {movie.episodes?.map((server, sIndex) => (
              <div key={sIndex} className="mb-4">
                <h3 className="text-sm font-semibold text-red-500 mb-2">
                  {server.server_name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {server.server_data.map((episode, eIndex) => {
                    const isActive =
                      currentEpisode?.serverIndex === sIndex &&
                      currentEpisode?.episodeIndex === eIndex;

                    return (
                      <button
                        key={eIndex}
                        type="button"
                        onClick={() => {
                          setServerIndex(sIndex);
                          setCurrentEpisode({
                            serverName: server.server_name,
                            serverIndex: sIndex,
                            episodeIndex: eIndex,
                            ...episode,
                          });
                        }}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                          isActive
                            ? 'bg-red-600 border-red-500 text-white'
                            : 'bg-gray-900 border-gray-700 text-gray-200 hover:bg-red-700 hover:border-red-500'
                        }`}
                      >
                        {episode.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WatchPage;

