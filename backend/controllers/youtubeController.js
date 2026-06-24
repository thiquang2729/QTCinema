const ytdl = require('@distube/ytdl-core');

/**
 * Clean up filename to be safe for downloading
 */
function getSafeFilename(title) {
  // Loại bỏ các ký tự không hợp lệ cho tên file, giữ lại chữ cái Tiếng Việt và khoảng trắng
  return title
    .replace(/[\\\/*?:"<>|]/g, '')
    .trim();
}

class YoutubeController {
  /**
   * GET /api/youtube/info?url=<youtube-url>
   * Lấy thông tin chi tiết của video YouTube
   */
  async getVideoInfo(req, res) {
    try {
      const { url } = req.query;

      if (!url) {
        return res.status(400).json({
          status: 'error',
          error: 'URL YouTube là bắt buộc'
        });
      }

      if (!ytdl.validateURL(url)) {
        return res.status(400).json({
          status: 'error',
          error: 'Đường dẫn YouTube không hợp lệ'
        });
      }

      const info = await ytdl.getInfo(url);
      
      const title = info.videoDetails.title;
      const thumbnail = info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]?.url || '';
      const duration = parseInt(info.videoDetails.lengthSeconds, 10);
      const author = info.videoDetails.author.name;

      // Lọc các định dạng video có cả hình ảnh và âm thanh (không cần merge bằng ffmpeg)
      const videoFormats = info.formats
        .filter(f => f.hasVideo && f.hasAudio)
        .map(f => {
          let container = 'mp4';
          if (f.mimeType) {
            const match = f.mimeType.match(/video\/([a-zA-Z0-9]+);/);
            if (match) container = match[1];
          }
          return {
            itag: f.itag,
            qualityLabel: f.qualityLabel,
            container: container,
            size: f.contentLength ? (parseInt(f.contentLength, 10) / (1024 * 1024)).toFixed(2) + ' MB' : 'Không rõ'
          };
        });

      res.json({
        status: 'success',
        data: {
          title,
          thumbnail,
          duration,
          author,
          videoFormats
        }
      });
    } catch (error) {
      console.error('Error in getVideoInfo:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể lấy thông tin video. Vui lòng kiểm tra lại URL.',
        message: error.message
      });
    }
  }

  /**
   * GET /api/youtube/download?url=<youtube-url>&format=<mp3|mp4>&itag=<itag>
   * Stream trực tiếp video/audio từ YouTube về trình duyệt client
   */
  async downloadStream(req, res) {
    try {
      const { url, format, itag } = req.query;

      if (!url) {
        return res.status(400).json({ status: 'error', error: 'URL YouTube là bắt buộc' });
      }

      if (!ytdl.validateURL(url)) {
        return res.status(400).json({ status: 'error', error: 'Đường dẫn YouTube không hợp lệ' });
      }

      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title;
      const safeTitle = getSafeFilename(title) || 'youtube_download';

      if (format === 'mp3') {
        // Tải âm thanh chất lượng tốt nhất
        const stream = ytdl(url, {
          filter: 'audioonly',
          quality: 'highestaudio'
        });

        // Thiết lập header tải về cho file MP3
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(safeTitle)}.mp3`);
        res.setHeader('Content-Type', 'audio/mpeg');

        stream.on('error', (err) => {
          console.error('Audio stream error:', err.message);
          if (!res.headersSent) {
            res.status(500).json({ status: 'error', error: 'Lỗi truyền phát âm thanh' });
          }
        });

        stream.pipe(res);
      } else {
        // Tải video theo itag được chọn, mặc định lấy định dạng tốt nhất có sẵn tiếng
        const selectedItag = itag ? parseInt(itag, 10) : 'highest';
        const stream = ytdl(url, {
          quality: selectedItag
        });

        // Thiết lập header tải về cho file MP4
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(safeTitle)}.mp4`);
        res.setHeader('Content-Type', 'video/mp4');

        stream.on('error', (err) => {
          console.error('Video stream error:', err.message);
          if (!res.headersSent) {
            res.status(500).json({ status: 'error', error: 'Lỗi truyền phát video' });
          }
        });

        stream.pipe(res);
      }
    } catch (error) {
      console.error('Error in downloadStream:', error.message);
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          error: 'Không thể tải xuống nội dung này. Vui lòng thử lại sau.',
          message: error.message
        });
      }
    }
  }
}

module.exports = new YoutubeController();
