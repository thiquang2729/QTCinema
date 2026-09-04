const youtubedl = require('youtube-dl-exec');

/**
 * Validate YouTube URL
 */
function validateYoutubeURL(url) {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})/;
  return regex.test(url);
}

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
   * Lấy thông tin chi tiết của video YouTube sử dụng yt-dlp
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

      if (!validateYoutubeURL(url)) {
        return res.status(400).json({
          status: 'error',
          error: 'Đường dẫn YouTube không hợp lệ'
        });
      }

      // Lấy thông tin video dạng JSON từ yt-dlp
      const info = await youtubedl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noCheckCertificates: true,
        preferFreeFormats: true
      });

      const title = info.title || 'Untitled Video';
      const thumbnail = info.thumbnail || info.thumbnails?.[info.thumbnails.length - 1]?.url || '';
      const duration = parseInt(info.duration || 0, 10);
      const author = info.uploader || info.channel || 'Unknown Author';

      // Lọc các định dạng video có cả hình ảnh và âm thanh (để tải trực tiếp không cần merge ffmpeg)
      const videoFormats = (info.formats || [])
        .filter(f => f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none')
        .map(f => {
          const sizeInBytes = f.filesize || f.filesize_approx;
          const sizeInMb = sizeInBytes ? (parseInt(sizeInBytes, 10) / (1024 * 1024)).toFixed(2) + ' MB' : 'Không rõ';
          return {
            itag: f.format_id,
            qualityLabel: f.height ? `${f.height}p` : (f.format_note || 'Video'),
            container: f.ext || 'mp4',
            size: sizeInMb
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
        error: 'Không thể lấy thông tin video. Vui lòng kiểm tra lại URL hoặc thử lại sau.',
        message: error.message
      });
    }
  }

  /**
   * GET /api/youtube/download?url=<youtube-url>&format=<mp3|mp4>&itag=<itag>
   * Stream trực tiếp video/audio từ YouTube về trình duyệt client qua yt-dlp
   */
  async downloadStream(req, res) {
    let subprocess = null;
    try {
      const { url, format, itag } = req.query;

      if (!url) {
        return res.status(400).json({ status: 'error', error: 'URL YouTube là bắt buộc' });
      }

      if (!validateYoutubeURL(url)) {
        return res.status(400).json({ status: 'error', error: 'Đường dẫn YouTube không hợp lệ' });
      }

      // Lấy title trước để set tên file tải về
      const info = await youtubedl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noCheckCertificates: true
      });
      const title = info.title || 'youtube_download';
      const safeTitle = getSafeFilename(title);

      if (format === 'mp3') {
        // Stream âm thanh tốt nhất về client
        subprocess = youtubedl.exec(url, {
          output: '-',
          format: 'bestaudio/best',
          noWarnings: true,
          noCheckCertificates: true
        });

        // Thiết lập header tải về cho file MP3
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(safeTitle)}.mp3`);
        res.setHeader('Content-Type', 'audio/mpeg');
      } else {
        // Stream video theo itag (format_id) được chọn
        const selectedItag = itag || 'best';
        subprocess = youtubedl.exec(url, {
          output: '-',
          format: selectedItag,
          noWarnings: true,
          noCheckCertificates: true
        });

        // Thiết lập header tải về cho file MP4
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(safeTitle)}.mp4`);
        res.setHeader('Content-Type', 'video/mp4');
      }

      // Xử lý luồng dữ liệu
      subprocess.stdout.pipe(res);

      // Nếu client ngắt kết nối (ví dụ: hủy download), kết thúc subprocess ngay lập tức để tiết kiệm tài nguyên
      res.on('close', () => {
        if (subprocess && !subprocess.killed) {
          subprocess.kill();
          console.log('Subprocess killed due to client disconnection');
        }
      });

      subprocess.on('error', (err) => {
        console.error('yt-dlp stream error:', err.message);
        if (!res.headersSent) {
          res.status(500).json({ status: 'error', error: 'Lỗi truyền phát dữ liệu' });
        }
      });

    } catch (error) {
      console.error('Error in downloadStream:', error.message);
      if (subprocess && !subprocess.killed) {
        subprocess.kill();
      }
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
