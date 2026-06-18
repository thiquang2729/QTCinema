const { getAuth } = require('@clerk/express');
const userService = require('../services/userService');

class UserController {
  // --- Watch History ---

  /**
   * POST /api/users/history
   * Lưu hoặc cập nhật lịch sử xem phim
   */
  async saveWatchHistory(req, res) {
    try {
      const auth = getAuth(req);
      const userId = auth.userId;

      if (!userId) {
        return res.status(401).json({ status: 'error', error: 'Chưa đăng nhập' });
      }

      const historyData = req.body;
      const result = await userService.saveWatchHistory(userId, historyData);
      res.json({ status: 'success', data: result });
    } catch (error) {
      console.error('Error in saveWatchHistory:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể lưu lịch sử xem phim',
        message: error.message
      });
    }
  }

  /**
   * GET /api/users/history
   * Lấy danh sách lịch sử xem phim
   */
  async getWatchHistory(req, res) {
    try {
      const auth = getAuth(req);
      const userId = auth.userId;

      if (!userId) {
        return res.status(401).json({ status: 'error', error: 'Chưa đăng nhập' });
      }

      const result = await userService.getWatchHistory(userId);
      res.json({ status: 'success', data: result });
    } catch (error) {
      console.error('Error in getWatchHistory:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể lấy lịch sử xem phim',
        message: error.message
      });
    }
  }

  /**
   * GET /api/users/history/:movieSlug
   * Lấy lịch sử xem của một phim cụ thể
   */
  async getWatchHistoryForMovie(req, res) {
    try {
      const auth = getAuth(req);
      const userId = auth.userId;
      const { movieSlug } = req.params;

      if (!userId) {
        return res.status(401).json({ status: 'error', error: 'Chưa đăng nhập' });
      }

      if (!movieSlug) {
        return res.status(400).json({ status: 'error', error: 'MovieSlug là bắt buộc' });
      }

      const result = await userService.getWatchHistoryForMovie(userId, movieSlug);
      res.json({ status: 'success', data: result });
    } catch (error) {
      console.error('Error in getWatchHistoryForMovie:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể lấy lịch sử xem phim này',
        message: error.message
      });
    }
  }

  /**
   * DELETE /api/users/history/:movieSlug
   * Xóa lịch sử xem của phim
   */
  async deleteWatchHistory(req, res) {
    try {
      const auth = getAuth(req);
      const userId = auth.userId;
      const { movieSlug } = req.params;

      if (!userId) {
        return res.status(401).json({ status: 'error', error: 'Chưa đăng nhập' });
      }

      if (!movieSlug) {
        return res.status(400).json({ status: 'error', error: 'MovieSlug là bắt buộc' });
      }

      const result = await userService.deleteWatchHistory(userId, movieSlug);
      res.json({ status: 'success', data: result });
    } catch (error) {
      console.error('Error in deleteWatchHistory:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể xóa lịch sử xem phim này',
        message: error.message
      });
    }
  }

  // --- Watchlist ---

  /**
   * POST /api/users/watchlist
   * Thêm phim vào watchlist
   */
  async addToWatchlist(req, res) {
    try {
      const auth = getAuth(req);
      const userId = auth.userId;

      if (!userId) {
        return res.status(401).json({ status: 'error', error: 'Chưa đăng nhập' });
      }

      const watchlistData = req.body;
      const result = await userService.addToWatchlist(userId, watchlistData);
      res.json({ status: 'success', data: result });
    } catch (error) {
      console.error('Error in addToWatchlist:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể thêm phim vào danh sách yêu thích',
        message: error.message
      });
    }
  }

  /**
   * DELETE /api/users/watchlist/:movieSlug
   * Xóa phim khỏi watchlist
   */
  async removeFromWatchlist(req, res) {
    try {
      const auth = getAuth(req);
      const userId = auth.userId;
      const { movieSlug } = req.params;

      if (!userId) {
        return res.status(401).json({ status: 'error', error: 'Chưa đăng nhập' });
      }

      if (!movieSlug) {
        return res.status(400).json({ status: 'error', error: 'MovieSlug là bắt buộc' });
      }

      const result = await userService.removeFromWatchlist(userId, movieSlug);
      res.json({ status: 'success', data: result });
    } catch (error) {
      console.error('Error in removeFromWatchlist:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể xóa phim khỏi danh sách yêu thích',
        message: error.message
      });
    }
  }

  /**
   * GET /api/users/watchlist
   * Lấy danh sách phim yêu thích
   */
  async getWatchlist(req, res) {
    try {
      const auth = getAuth(req);
      const userId = auth.userId;

      if (!userId) {
        return res.status(401).json({ status: 'error', error: 'Chưa đăng nhập' });
      }

      const result = await userService.getWatchlist(userId);
      res.json({ status: 'success', data: result });
    } catch (error) {
      console.error('Error in getWatchlist:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể lấy danh sách phim yêu thích',
        message: error.message
      });
    }
  }

  /**
   * GET /api/users/watchlist/:movieSlug
   * Kiểm tra phim đã có trong watchlist chưa
   */
  async checkInWatchlist(req, res) {
    try {
      const auth = getAuth(req);
      const userId = auth.userId;
      const { movieSlug } = req.params;

      if (!userId) {
        return res.status(401).json({ status: 'error', error: 'Chưa đăng nhập' });
      }

      if (!movieSlug) {
        return res.status(400).json({ status: 'error', error: 'MovieSlug là bắt buộc' });
      }

      const result = await userService.checkInWatchlist(userId, movieSlug);
      res.json({ status: 'success', data: result });
    } catch (error) {
      console.error('Error in checkInWatchlist:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Không thể kiểm tra trạng thái yêu thích',
        message: error.message
      });
    }
  }
}

module.exports = new UserController();
