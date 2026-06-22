import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import gsap from 'gsap';
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw, RotateCw, Film, SkipForward } from 'lucide-react';

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
  startTime = 0,
  onTimeUpdate,
  onPause,
  onEnded,
  nextEpisode = null,
  onNextEpisode,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const progressRef = useRef(null);
  const hideControlsTimeoutRef = useRef(null);
  const gestureTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const speedMenuRef = useRef(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const tapTimeoutRef = useRef(null);
  const tapCountRef = useRef(0);
  const lastTapXRef = useRef(0);

  // Next episode popup state
  const [showNextPopup, setShowNextPopup] = useState(false);
  const [nextCountdown, setNextCountdown] = useState(10);
  const nextPopupRef = useRef(null);
  const nextCountdownRef = useRef(null);
  const nextCountdownCircleRef = useRef(null);
  const nextPopupDismissedRef = useRef(false);
  const nextPopupShownRef = useRef(false);
  const onNextEpisodeRef = useRef(onNextEpisode);

  // Sync callback ref
  useEffect(() => {
    onNextEpisodeRef.current = onNextEpisode;
  }, [onNextEpisode]);

  // Cập nhật document.title để media player bên ngoài hiển thị tên phim + tập
  useEffect(() => {
    const originalTitle = document.title;
    if (title || episodeLabel) {
      const parts = [];
      if (title) parts.push(title);
      if (episodeLabel) parts.push(episodeLabel);
      document.title = parts.join(' - ');
    }
    return () => {
      document.title = originalTitle;
    };
  }, [title, episodeLabel]);

  // Khởi tạo HLS khi src thay đổi
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Reset trạng thái khi đổi tập
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsBuffering(true);
    setShowNextPopup(false);
    setNextCountdown(10);
    // GIỮ nextPopupShownRef = true để block detection effect
    // với stale state values (currentTime/duration chưa reset kịp).
    // Sẽ reset về false trong onLoadedMetadata khi video mới load xong.
    nextPopupShownRef.current = true;
    if (nextCountdownRef.current) {
      clearInterval(nextCountdownRef.current);
      nextCountdownRef.current = null;
    }

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

    let startTimeApplied = false;

    const applyStartTime = () => {
      if (startTime && startTime > 0 && !startTimeApplied) {
        video.currentTime = startTime;
        startTimeApplied = true;
      }
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsBuffering(false);
      // Áp dụng tốc độ phát hiện tại (phòng trường hợp đổi src)
      video.playbackRate = playbackRate;

      // Reset next episode popup cho tập mới
      // (an toàn vì lúc này duration đã có giá trị mới)
      nextPopupShownRef.current = false;
      nextPopupDismissedRef.current = false;

      applyStartTime();

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

    const handleVideoTimeUpdate = () => {
      const current = video.currentTime || 0;
      const dur = video.duration || 0;
      setCurrentTime(current);
      if (onTimeUpdate) {
        onTimeUpdate(current, dur);
      }
    };

    const onWaiting = () => {
      setIsBuffering(true);
    };

    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };

    const onPauseEvent = () => {
      setIsPlaying(false);
      if (onPause) {
        onPause(video.currentTime || 0);
      }
    };

    const onEndedEvent = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      if (onEnded) {
        onEnded();
      }
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    // loadeddata và canplay cũng giúp đảm bảo jump tới time chính xác cho một số trình duyệt
    video.addEventListener('loadeddata', applyStartTime);
    video.addEventListener('timeupdate', handleVideoTimeUpdate);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPauseEvent);
    video.addEventListener('ended', onEndedEvent);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('loadeddata', applyStartTime);
      video.removeEventListener('timeupdate', handleVideoTimeUpdate);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPauseEvent);
      video.removeEventListener('ended', onEndedEvent);
    };
  }, [autoPlay, playbackRate, startTime, onTimeUpdate, onPause, onEnded]);

  // Đồng bộ playbackRate vào video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackRate;
  }, [playbackRate]);

  // Đóng menu tốc độ khi controls bị ẩn
  useEffect(() => {
    if (!controlsVisible) {
      setSpeedMenuOpen(false);
      setShowVolumeSlider(false);
    }
  }, [controlsVisible]);

  // Click outside để đóng menu tốc độ
  useEffect(() => {
    const onMouseDown = (e) => {
      if (!speedMenuRef.current) return;
      if (!speedMenuRef.current.contains(e.target)) {
        setSpeedMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

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

  // Add effect to trigger when `isPlaying` changes so controls automatically hide
  // when video is playing without mouse movement.
  useEffect(() => {
    resetHideControlsTimer();
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  const handlePointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    resetHideControlsTimer();
  };

  // Dọn timer khi unmount
  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }
      if (nextCountdownRef.current) {
        clearInterval(nextCountdownRef.current);
      }
    };
  }, []);

  // Next episode: hiển popup khi còn 2 phút cuối video
  useEffect(() => {
    if (!nextEpisode || !duration || duration <= 0) return;
    if (nextPopupDismissedRef.current) return;
    if (nextPopupShownRef.current) return;

    const timeRemaining = duration - currentTime;

    // Hiển popup khi còn ≤ 120s (2 phút)
    if (timeRemaining <= 120 && timeRemaining > 0) {
      nextPopupShownRef.current = true;
      setShowNextPopup(true);
      setNextCountdown(10);
    }
  }, [currentTime, duration, nextEpisode]);

  // GSAP animation khi popup xuất hiện + countdown timer
  useEffect(() => {
    if (!showNextPopup) return;

    const popupEl = nextPopupRef.current;
    const circleEl = nextCountdownCircleRef.current;
    if (!popupEl) return;

    // GSAP slide-in animation
    gsap.fromTo(
      popupEl,
      { x: 120, opacity: 0, scale: 0.9 },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'back.out(1.4)',
      }
    );

    // Animate countdown circle (SVG stroke-dashoffset)
    if (circleEl) {
      const circumference = 2 * Math.PI * 18; // r=18
      gsap.fromTo(
        circleEl,
        { strokeDashoffset: 0 },
        {
          strokeDashoffset: circumference,
          duration: 10,
          ease: 'linear',
        }
      );
    }

    // Pulse glow effect trên nút
    const btnEl = popupEl.querySelector('.next-ep-btn');
    if (btnEl) {
      gsap.to(btnEl, {
        boxShadow: '0 0 20px rgba(220, 38, 38, 0.6), 0 0 40px rgba(220, 38, 38, 0.3)',
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: 'sine.inOut',
      });
    }

    // Countdown interval
    let count = 10;
    nextCountdownRef.current = setInterval(() => {
      count -= 1;
      setNextCountdown(count);
      if (count <= 0) {
        clearInterval(nextCountdownRef.current);
        nextCountdownRef.current = null;
        // Tự động chuyển tập
        if (onNextEpisodeRef.current) {
          // Slide-out animation trước khi chuyển
          gsap.to(popupEl, {
            x: 120,
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
              setShowNextPopup(false);
              onNextEpisodeRef.current();
            },
          });
        }
      }
    }, 1000);

    return () => {
      if (nextCountdownRef.current) {
        clearInterval(nextCountdownRef.current);
        nextCountdownRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNextPopup]);

  const handleNextEpisode = () => {
    if (!onNextEpisode) return;
    // Dừng countdown
    if (nextCountdownRef.current) {
      clearInterval(nextCountdownRef.current);
      nextCountdownRef.current = null;
    }
    const popupEl = nextPopupRef.current;
    if (popupEl) {
      gsap.to(popupEl, {
        x: 120,
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setShowNextPopup(false);
          onNextEpisode();
        },
      });
    } else {
      setShowNextPopup(false);
      onNextEpisode();
    }
  };

  const handleDismissNextPopup = () => {
    if (nextCountdownRef.current) {
      clearInterval(nextCountdownRef.current);
      nextCountdownRef.current = null;
    }
    nextPopupDismissedRef.current = true;
    const popupEl = nextPopupRef.current;
    if (popupEl) {
      gsap.to(popupEl, {
        x: 120,
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => setShowNextPopup(false),
      });
    } else {
      setShowNextPopup(false);
    }
  };

  // Xử lý tap trên video: single tap = play/pause, double tap = tua
  const handleVideoTap = (e) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const rect = videoEl.getBoundingClientRect();
    lastTapXRef.current = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0;

    tapCountRef.current += 1;

    if (tapCountRef.current === 1) {
      // Đợi xem có tap thứ 2 không
      tapTimeoutRef.current = setTimeout(() => {
        // Single tap → play/pause
        togglePlay();
        resetHideControlsTimer();
        tapCountRef.current = 0;
      }, 250);
    } else if (tapCountRef.current === 2) {
      // Double tap → tua
      clearTimeout(tapTimeoutRef.current);
      tapCountRef.current = 0;
      const half = rect.width / 2;
      const clickX = lastTapXRef.current - rect.left;
      if (clickX < half) {
        seekBy(-10);
      } else {
        seekBy(10);
      }
    }
  };

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
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
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
  const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

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
      onPointerMove={handlePointerMove}

      tabIndex={0}
    >
      {/* Video */}
      <div className={videoWrapperClass}>
        {/* Logo góc phải (giống Navbar) */}
        <div className="pointer-events-none absolute top-8 opacity-50 right-8 z-30 flex items-center gap-2 select-none">
          <Film className="w-6 h-6 text-red-600 drop-shadow" aria-hidden="true" />
          <span className="text-red-600 text-lg font-bold tracking-tight drop-shadow">
            QTCinema
          </span>
        </div>

        <video
          ref={videoRef}
          poster={poster}
          className={videoClass}
          controls={false}
          playsInline
          onClick={handleVideoTap}
        />

        {/* Loading overlay */}
        {isBuffering && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-4 border-white/30 border-t-red-600 animate-spin" />
          </div>
        )}

        {/* Next episode popup - Netflix style */}
        {showNextPopup && nextEpisode && (
          <div
            ref={nextPopupRef}
            className="absolute bottom-20 right-2 md:bottom-28 md:right-4 z-30 w-56 md:w-72 rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15,15,15,0.95) 0%, rgba(30,10,10,0.95) 100%)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset',
            }}
          >
            {/* Header */}
            <div className="px-3 pt-2.5 pb-1.5 md:px-4 md:pt-3 md:pb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 md:gap-2">
                <SkipForward className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
                <span className="text-[10px] md:text-xs font-semibold text-gray-300 uppercase tracking-wider">Tập tiếp theo</span>
              </div>
              {/* Countdown circle */}
              <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                <svg className="w-8 h-8 md:w-10 md:h-10 -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  <circle
                    ref={nextCountdownCircleRef}
                    cx="20" cy="20" r="18"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={0}
                  />
                </svg>
                <span className="absolute text-[10px] md:text-xs font-bold text-white">{nextCountdown}</span>
              </div>
            </div>

            {/* Episode info */}
            <div className="px-3 pb-1.5 md:px-4 md:pb-2">
              <p className="text-white font-semibold text-xs md:text-sm truncate">
                {nextEpisode.name ? `Tập ${nextEpisode.name}` : 'Tập tiếp theo'}
              </p>
              {title && (
                <p className="text-gray-400 text-xs mt-0.5 truncate">{title}</p>
              )}
            </div>

            {/* Actions */}
            <div className="px-3 pb-2.5 md:px-4 md:pb-3 flex gap-2">
              <button
                type="button"
                onClick={handleNextEpisode}
                className="next-ep-btn flex-1 py-1.5 md:py-2 bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-semibold rounded-lg flex items-center justify-center gap-1 md:gap-1.5 transition-colors"
              >
                <SkipForward className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Xem ngay
              </button>
              <button
                type="button"
                onClick={handleDismissNextPopup}
                className="px-2.5 py-1.5 md:px-3 md:py-2 bg-white/10 hover:bg-white/20 text-gray-300 text-xs md:text-sm rounded-lg transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Gradient overlay + thông tin tập hiện tại (ẩn cùng controls) */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
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
          <div className="absolute inset-0 hidden md:grid grid-cols-2 items-center pointer-events-none">
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
        } px-4 pb-4 pt-6 bg-linear-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${
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
          <div className="flex items-center gap-2">
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
              className="flex items-center gap-1 px-2 py-1 mx-0 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white"
            >
              <RotateCcw className="w-4 h-4" />
              <span>-10s</span>
            </button>

            {/* Seek +10s */}
            <button
              type="button"
              onClick={() => seekBy(10)}
              className="flex items-center gap-1 px-2 py-1 mx-0 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white"
            >
              <RotateCw className="w-4 h-4" />
              <span>+10s</span>
            </button>

            {/* Volume */}
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => {
                  setShowVolumeSlider((v) => !v);
                  resetHideControlsTimer();
                }}
                className="text-gray-200 hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              {showVolumeSlider && (
                <div className="ml-2 w-15 mb-1.5">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1.5 cursor-pointer accent-red-600"
                  />
                </div>
              )}
            </div>

            {/* Speed */}
            <div ref={speedMenuRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setSpeedMenuOpen((v) => !v);
                  resetHideControlsTimer();
                }}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white font-semibold"
                aria-haspopup="menu"
                aria-expanded={speedMenuOpen}
              >
                {playbackRate}x
              </button>

              {speedMenuOpen && (
                <div className="absolute bottom-full mb-2 right-0 w-24 rounded-lg border border-gray-800 bg-black/95 shadow-2xl overflow-hidden z-30">
                  {SPEED_OPTIONS.map((r) => {
                    const active = r === playbackRate;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setPlaybackRate(r);
                          setSpeedMenuOpen(false);
                          resetHideControlsTimer();
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-900 ${
                          active ? 'text-white bg-gray-900/70' : 'text-gray-200'
                        }`}
                      >
                        {r}x
                      </button>
                    );
                  })}
                </div>
              )}
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

