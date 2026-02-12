import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, RotateCw } from 'lucide-react';

/**
 * VideoPlayer
 * - Phát m3u8 với HLS.js + <video>
 * - UI tùy biến theo style Netflix (tối, đỏ)
 * - Nếu fullScreen = true: chiếm toàn bộ không gian cha (overlay)
 */
function VideoPlayer({
  src,
  poster,
  title,
  episodeLabel,
  autoPlay = false,
  fullScreen = false,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const progressRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);

  // Khởi tạo HLS khi src thay đổi
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Reset trạng thái khi đổi tập
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsBuffering(true);

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari iOS/macOS hỗ trợ HLS native
      video.src = src;
    } else {
      console.error('Trình duyệt không hỗ trợ HLS');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Sự kiện từ thẻ video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsBuffering(false);

      if (autoPlay) {
        setIsBuffering(true);
        video
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Trình duyệt có thể chặn autoplay với âm thanh, bỏ qua lỗi
            setIsBuffering(false);
          });
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
    };

    const onWaiting = () => {
      setIsBuffering(true);
    };

    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('ended', onEnded);
    };
  }, [autoPlay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      setIsBuffering(true);
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch(() => {
          setIsBuffering(false);
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const seekBy = (seconds) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    setIsBuffering(true);
    const newTime = Math.min(
      Math.max(video.currentTime + seconds, 0),
      duration
    );
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressChange = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const value = Number(e.target.value);
    const newTime = (value / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const value = Number(e.target.value);
    video.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  };

  const resetHideControlsTimer = () => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }

    // Khi video đang tạm dừng: luôn hiện controls, không auto-hide
    if (!isPlaying) {
      setControlsVisible(true);
      return;
    }

    // Khi video đang chạy: hiện controls rồi tự ẩn sau 5s nếu không tương tác
    setControlsVisible(true);
    hideControlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 5000);
  };

  const handleMouseMove = () => {
    resetHideControlsTimer();
  };

  // Dọn timer khi unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts: Space (play/pause), ArrowLeft/ArrowRight (seek 10s)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Chỉ xử lý khi player đang được focus hoặc phím là space/arrow (giống Netflix)
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
        resetHideControlsTimer();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekBy(10);
        resetHideControlsTimer();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekBy(-10);
        resetHideControlsTimer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, isPlaying]);

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      container.requestFullscreen?.();
    }
    // Việc hiển thị controls sẽ được xử lý trong listener fullscreenchange
  };

  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || Number.isNaN(timeInSeconds)) return '00:00';
    const total = Math.floor(timeInSeconds);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  if (!src) {
    return (
      <div className="w-full bg-black/80 rounded-xl border border-gray-800 flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">
          Chưa có nguồn phát cho tập này
        </p>
      </div>
    );
  }

  const containerClass = fullScreen
    ? 'relative w-full h-full bg-black overflow-hidden'
    : 'w-full bg-black/80 rounded-xl border border-gray-800 overflow-hidden shadow-2xl flex flex-col';

  const videoWrapperClass = fullScreen
    ? 'w-full h-full bg-black'
    : 'relative bg-black';

  const videoClass = fullScreen
    ? 'w-full h-full bg-black object-contain'
    : 'w-full max-h-[70vh] bg-black';

  return (
    <div
      ref={containerRef}
      className={containerClass}
      onMouseMove={handleMouseMove}
      tabIndex={0}
    >
      {/* Video */}
      <div className={videoWrapperClass}>
        <video
          ref={videoRef}
          poster={poster}
          className={videoClass}
          controls={false}
          playsInline
          onClick={togglePlay}
          onDoubleClick={(e) => {
            const videoEl = videoRef.current;
            if (!videoEl) return;
            const rect = videoEl.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const half = rect.width / 2;

            if (clickX < half) {
              seekBy(-10);
            } else {
              seekBy(10);
            }
          }}
        />

        {/* Loading overlay */}
        {isBuffering && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-4 border-white/30 border-t-red-600 animate-spin" />
          </div>
        )}

        {/* Gradient overlay + thông tin tập hiện tại (ẩn cùng controls) */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {(title || episodeLabel) && (
          <div
            className={`absolute left-4 bottom-28 z-10 max-w-[80%] transition-opacity duration-300 ${
              controlsVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {episodeLabel && (
              <div className="inline-flex items-center px-2 py-0.5 mb-1 rounded bg-red-600 text-[11px] font-semibold uppercase tracking-wide">
                {episodeLabel}
              </div>
            )}
            {title && (
              <h2 className="text-lg md:text-xl font-semibold text-white drop-shadow">
                {title}
              </h2>
            )}
          </div>
        )}

        {/* Nút tua -10s / +10s ở giữa 2 nửa màn hình (PC) */}
        {controlsVisible && (
          <div className="absolute inset-0 grid grid-cols-2 items-center pointer-events-none">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => seekBy(-10)}
                className="pointer-events-auto flex items-center gap-2 text-white/80 hover:text-white focus:outline-none"
              >
                <RotateCcw className="w-7 h-7" />
                <span className="text-lg font-semibold">-10s</span>
              </button>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => seekBy(10)}
                className="pointer-events-auto flex items-center gap-2 text-white/80 hover:text-white focus:outline-none"
              >
                <span className="text-lg font-semibold">+10s</span>
                <RotateCw className="w-7 h-7" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div
        className={`${
          fullScreen
            ? 'absolute inset-x-0 bottom-0 z-20'
            : 'relative z-20'
        } px-4 pb-4 pt-6 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[11px] text-gray-300 w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            ref={progressRef}
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progressPercent}
            onChange={handleProgressChange}
            className="flex-1 h-1.5 cursor-pointer accent-red-600"
          />
          <span className="text-[11px] text-gray-400 w-12">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>

            {/* Seek -10s */}
            <button
              type="button"
              onClick={() => seekBy(-10)}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white"
            >
              <RotateCcw className="w-4 h-4" />
              <span>-10s</span>
            </button>

            {/* Seek +10s */}
            <button
              type="button"
              onClick={() => seekBy(10)}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white"
            >
              <RotateCw className="w-4 h-4" />
              <span>+10s</span>
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="text-gray-200 hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1.5 cursor-pointer accent-red-600"
              />
            </div>
          </div>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-gray-200 hover:text-white"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;

