import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetMovieByIdQuery, useGetMovieImagesQuery } from '../redux/services/movieApi';
import { useUser } from '@clerk/react';
import {
  useGetWatchHistoryForMovieQuery,
  useSaveWatchHistoryMutation,
} from '../redux/services/userApi';
import { ArrowLeft, AlertTriangle, Film } from 'lucide-react';
import gsap from 'gsap';
import VideoPlayer from '../components/VideoPlayer';

function WatchPageSkeleton() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const topBar = containerRef.current.querySelector('.skeleton-top-bar');
      const player = containerRef.current.querySelector('.skeleton-player');
      const sidebarElements = containerRef.current.querySelectorAll('.skeleton-sidebar-element');

      gsap.fromTo(topBar, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      gsap.fromTo(player, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' });
      gsap.fromTo(sidebarElements, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.03, ease: 'power2.out' });
    }
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white flex flex-col">
      {/* Top bar skeleton */}
      <div className="skeleton-top-bar h-12 flex items-center px-6 border-b border-zinc-900 bg-black/90 opacity-0">
        <div className="w-20 h-5 bg-zinc-900 skeleton-shimmer rounded" />
        <div className="ml-4 w-40 h-5 bg-zinc-900 skeleton-shimmer rounded" />
      </div>

      {/* Main content skeleton */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-3rem)]">
        {/* Player skeleton */}
        <div className="flex-1 bg-black flex items-center justify-center xl:px-8 p-4">
          <div className="skeleton-player w-full max-w-4xl aspect-video bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col items-center justify-center gap-3 skeleton-shimmer opacity-0">
            <Film className="w-12 h-12 text-zinc-800 animate-pulse" />
            <span className="text-zinc-600 text-sm font-medium">Đang thiết lập trình phát phim...</span>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="w-full lg:w-80 bg-black border-t lg:border-t-0 lg:border-l border-zinc-900 overflow-y-auto p-4 flex flex-col">
          <div className="skeleton-sidebar-element w-1/2 h-6 bg-zinc-900 skeleton-shimmer rounded mb-4 opacity-0" />
          <div className="skeleton-sidebar-element w-1/3 h-5 bg-zinc-900 skeleton-shimmer rounded mb-3 opacity-0" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 16 }).map((_, idx) => (
              <div
                key={idx}
                className="skeleton-sidebar-element h-8 bg-zinc-900 skeleton-shimmer rounded opacity-0"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WatchPageError({ error, onRetry, onHome }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)' }
      );
    }
  }, []);

  const errorMessage = error?.message || (typeof error === 'string' ? error : 'Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại mạng hoặc thử lại sau.');

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div
        ref={containerRef}
        className="w-full max-w-md bg-red-950/20 border border-red-900/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl text-center flex flex-col items-center opacity-0"
      >
        <div className="w-16 h-16 rounded-full bg-red-900/20 border border-red-800/40 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-red-400 mb-2">Không thể tải phim</h2>
        <p className="text-sm text-red-400/80 mb-6 leading-relaxed">
          {errorMessage}
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={onRetry}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-850 text-white text-sm font-semibold rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer hover:scale-[1.02]"
          >
            Thử lại
          </button>
          <button
            onClick={onHome}
            className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-sm font-semibold rounded-xl transition-all cursor-pointer hover:scale-[1.02]"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}

function WatchPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { isSignedIn } = useUser();

  const { data: movieData, isLoading: loading, error } = useGetMovieByIdQuery(slug, { skip: !slug });
  const { data: movieImagesRaw } = useGetMovieImagesQuery(slug, { skip: !slug });

  // Lấy lịch sử xem của phim
  const { data: historyData } = useGetWatchHistoryForMovieQuery(slug, {
    skip: !isSignedIn || !slug,
  });
  const [saveWatchHistory] = useSaveWatchHistoryMutation();

  const movie = movieData?.data || movieData;
  const movieImages = movieImagesRaw?.data || movieImagesRaw;

  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [serverIndex, setServerIndex] = useState(
    Number(searchParams.get('server')) || 0
  );

  const [startTime, setStartTime] = useState(0);

  // Refs để theo dõi giây hiện tại mà không làm trigger re-render liên tục
  const progressRef = useRef({ currentTime: 0, duration: 0 });
  const saveTimeoutRef = useRef(null);
  const initialLoadedRef = useRef(false);

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

  // Khôi phục tập đang xem dở từ lịch sử xem khi vào trang lần đầu (không có params trên URL)
  useEffect(() => {
    if (!movie || historyData === undefined || initialLoadedRef.current) return;

    const epParam = searchParams.get('ep');
    const serverParam = searchParams.get('server');

    if (epParam === null && serverParam === null) {
      const history = historyData?.data;
      if (history) {
        // Cập nhật URL sang tập và server đang xem dở
        navigate(`/xem/${slug}?server=${history.serverIndex || 0}&ep=${history.epIndex || 0}`, { replace: true });
      }
    }
    initialLoadedRef.current = true;
  }, [movie, historyData, slug, searchParams, navigate]);

  // Thiết lập tập hiện tại theo URL hoặc mặc định
  useEffect(() => {
    if (!movie) return;

    const epParam = searchParams.get('ep');
    const serverParam = searchParams.get('server');
    
    const sIndex = serverParam !== null ? Number(serverParam) : 0;
    const eIndex = epParam !== null ? Number(epParam) : 0;

    // Cập nhật serverIndex state
    setServerIndex(sIndex);

    const found = findEpisode(movie, sIndex, eIndex);
    if (found?.link_m3u8) {
      setCurrentEpisode(found);
      
      // Khôi phục startTime từ lịch sử xem nếu có
      const history = historyData?.data;
      if (
        history &&
        history.episodeSlug === found.slug &&
        history.serverIndex === sIndex &&
        history.currentTime > 5 // Chỉ khôi phục nếu đã xem hơn 5 giây
      ) {
        setStartTime(history.currentTime);
      } else {
        setStartTime(0);
      }

      // Reset progress ref
      progressRef.current = { currentTime: 0, duration: 0 };
    }
  }, [movie, searchParams, historyData]);

  // Hàm thực hiện lưu lịch sử lên server
  const triggerSaveHistory = async (time, duration) => {
    if (!isSignedIn || !movie || !currentEpisode) return;
    
    const curTime = time !== undefined ? time : progressRef.current.currentTime;
    const dur = duration !== undefined ? duration : progressRef.current.duration;

    // Không lưu nếu thời gian không hợp lệ hoặc bằng 0
    if (curTime <= 0) return;

    try {
      await saveWatchHistory({
        movieSlug: slug,
        movieTitle: movie.title,
        moviePoster: movie.posterPath || '',
        movieThumb: movie.thumbUrl || '',
        movieType: movie.type || 'single',
        episodeSlug: currentEpisode.slug,
        episodeName: currentEpisode.name,
        currentTime: curTime,
        duration: dur,
        serverIndex,
        epIndex: currentEpisode.episodeIndex,
      }).unwrap();
    } catch (err) {
      console.error('Failed to save watch history:', err);
    }
  };

  // Định kỳ lưu tiến trình mỗi 10 giây khi đang xem
  useEffect(() => {
    if (!isSignedIn) return;

    const interval = setInterval(() => {
      if (progressRef.current.currentTime > 0) {
        triggerSaveHistory();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      // Lưu tiến độ cuối cùng khi rời trang
      if (progressRef.current.currentTime > 0) {
        triggerSaveHistory();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, movie, currentEpisode, serverIndex]);

  const handleTimeUpdate = (time, duration) => {
    progressRef.current = { currentTime: time, duration };
  };

  const handlePause = (time) => {
    if (time > 0) {
      progressRef.current.currentTime = time;
      triggerSaveHistory(time);
    }
  };

  if (loading || !movie) {
    return <WatchPageSkeleton />;
  }

  if (error) {
    return (
      <WatchPageError
        error={error}
        onRetry={() => window.location.reload()}
        onHome={() => navigate('/')}
      />
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
              startTime={startTime}
              onTimeUpdate={handleTimeUpdate}
              onPause={handlePause}
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
                <div className="grid grid-cols-4 xl:grid-cols-5 gap-2">
                  {server.server_data.map((episode, eIndex) => {
                    const isActive =
                      currentEpisode?.serverIndex === sIndex &&
                      currentEpisode?.episodeIndex === eIndex;

                    return (
                      <button
                        key={eIndex}
                        type="button"
                        onClick={() => {
                          navigate(`/xem/${slug}?server=${sIndex}&ep=${eIndex}`, { replace: true });
                        }}
                        className={`py-1.5 rounded text-xs font-medium border transition-all text-center ${
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

