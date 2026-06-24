import { useState } from 'react';
import { Youtube, Download, Music, Video, Search, AlertCircle, Loader2 } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

function YoutubeDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // Phân tích thời lượng từ giây sang định dạng phút:giây
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleFetchInfo = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await axiosInstance.get('/youtube/info', {
        params: { url: url.trim() },
        hideLoader: true // Tự xử lý loading nội bộ để giao diện mượt mà hơn
      });

      if (response.data?.status === 'success') {
        setVideoInfo(response.data.data);
      } else {
        setError(response.data?.error || 'Không thể lấy thông tin video. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        'Đã xảy ra lỗi khi kết nối tới máy chủ. Vui lòng kiểm tra lại đường dẫn YouTube.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format, itag = null) => {
    if (!url.trim()) return;

    setDownloading(true);

    // Xây dựng URL tải xuống trực tiếp từ API backend
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api';
    const downloadUrl = `${backendUrl}/youtube/download?url=${encodeURIComponent(url.trim())}&format=${format}${itag ? `&itag=${itag}` : ''}`;
    
    // Tạo thẻ <a> ẩn để kích hoạt trình tải xuống mặc định của trình duyệt
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Hiển thị trạng thái tải trong 3 giây để người dùng nhận biết
    setTimeout(() => {
      setDownloading(false);
    }, 3000);
  };

  return (
    <div className="min-h-[85vh] bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-red-600/10 mb-4 ring-1 ring-red-500/20">
            <Youtube className="w-10 h-10 text-red-600 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Tải Nhạc & Video YouTube
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
            Chuyển đổi liên kết YouTube thành nhạc MP3 chất lượng cao hoặc tải video MP4 nhanh chóng và hoàn toàn miễn phí.
          </p>
        </div>

        {/* Input Form */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-2xl mb-8">
          <form onSubmit={handleFetchInfo} className="space-y-4">
            <label htmlFor="yt-url" className="block text-sm font-semibold text-gray-300">
              Nhập đường dẫn video YouTube:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  id="yt-url"
                  type="text"
                  placeholder="Ví dụ: https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full h-12 pl-4 pr-10 bg-black/60 border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all duration-300 shadow-inner"
                  required
                />
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    X
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="h-12 px-6 bg-red-600 hover:bg-red-700 disabled:bg-red-800/40 disabled:text-gray-500 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-lg shadow-red-600/10 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Tìm kiếm
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-950/20 border border-red-800/50 text-red-400 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{error}</div>
            </div>
          )}
        </div>

        {/* Video Info & Download Options */}
        {videoInfo && (
          <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-2xl animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Video Thumbnail and Basic Info */}
              <div className="md:col-span-5 space-y-4">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-900 border border-white/[0.04] shadow-lg relative group">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-xs font-semibold tabular-nums text-white">
                    {formatDuration(videoInfo.duration)}
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-100 line-clamp-2 leading-snug">
                    {videoInfo.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    Kênh: {videoInfo.author}
                  </p>
                </div>
              </div>

              {/* Download Buttons Column */}
              <div className="md:col-span-7 space-y-6">
                <h3 className="text-md font-bold text-gray-300 border-b border-white/[0.06] pb-2 flex items-center gap-2">
                  <Download className="w-5 h-5 text-red-500" />
                  Chọn định dạng để tải về
                </h3>

                {downloading && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/50 text-emerald-400 text-sm font-medium flex items-center gap-2.5 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Quá trình tải xuống đã bắt đầu! Vui lòng chờ trình duyệt tải file về.
                  </div>
                )}

                <div className="space-y-4">
                  {/* MP3 Audio Option */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-orange-600/10 text-orange-500 ring-1 ring-orange-500/20">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-200">Âm thanh MP3</div>
                        <div className="text-xs text-gray-500">Chất lượng cao (128 - 320 kbps)</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload('mp3')}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 font-semibold rounded-lg text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Tải MP3
                    </button>
                  </div>

                  {/* MP4 Video Options */}
                  {videoInfo.videoFormats && videoInfo.videoFormats.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2 px-1">
                        Video MP4 (Có sẵn tiếng)
                      </div>
                      
                      {videoInfo.videoFormats.map((fmt) => (
                        <div
                          key={fmt.itag}
                          className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-sky-600/10 text-sky-500 ring-1 ring-sky-500/20">
                              <Video className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-200">
                                Video {fmt.qualityLabel}
                              </div>
                              <div className="text-xs text-gray-500">
                                Định dạng: {fmt.container.toUpperCase()} • Dung lượng: {fmt.size}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload('mp4', fmt.itag)}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 font-semibold rounded-lg text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                            Tải {fmt.qualityLabel}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 py-2">
                      Không tìm thấy định dạng video tích hợp sẵn tiếng nào được hỗ trợ. Hãy tải về dưới dạng file MP3.
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default YoutubeDownloader;
