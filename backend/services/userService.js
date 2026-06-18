const userRepository = require('../repositories/userRepository');

class UserService {
  // Watch History
  async saveWatchHistory(userId, historyData) {
    return userRepository.saveWatchHistory(userId, historyData);
  }

  async getWatchHistory(userId) {
    return userRepository.getWatchHistory(userId);
  }

  async getWatchHistoryForMovie(userId, movieSlug) {
    return userRepository.getWatchHistoryForMovie(userId, movieSlug);
  }

  async deleteWatchHistory(userId, movieSlug) {
    return userRepository.deleteWatchHistory(userId, movieSlug);
  }

  // Watchlist
  async addToWatchlist(userId, watchlistData) {
    return userRepository.addToWatchlist(userId, watchlistData);
  }

  async removeFromWatchlist(userId, movieSlug) {
    return userRepository.removeFromWatchlist(userId, movieSlug);
  }

  async getWatchlist(userId) {
    return userRepository.getWatchlist(userId);
  }

  async checkInWatchlist(userId, movieSlug) {
    const isFavorite = await userRepository.checkInWatchlist(userId, movieSlug);
    return { isFavorite };
  }
}

module.exports = new UserService();
