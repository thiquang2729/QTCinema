const admin = require('../config/firebase.config');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

class UserRepository {
  constructor() {
    this.db = getFirestore();
  }

  // --- Watch History ---

  /**
   * Lưu hoặc cập nhật lịch sử xem phim
   * @param {string} userId ID của user từ Clerk
   * @param {object} historyData Dữ liệu lịch sử xem
   */
  async saveWatchHistory(userId, historyData) {
    const { movieSlug } = historyData;
    if (!userId || !movieSlug) {
      throw new Error('Thiếu thông tin userId hoặc movieSlug');
    }

    const docRef = this.db.collection('watch_history').doc(`${userId}_${movieSlug}`);
    const data = {
      userId,
      ...historyData,
      updatedAt: FieldValue.serverTimestamp()
    };

    await docRef.set(data, { merge: true });
    return data;
  }

  /**
   * Lấy danh sách lịch sử xem phim của người dùng
   * @param {string} userId ID của user từ Clerk
   */
  async getWatchHistory(userId) {
    if (!userId) {
      throw new Error('UserId là bắt buộc');
    }

    const snapshot = await this.db.collection('watch_history')
      .where('userId', '==', userId)
      .get();

    const history = [];
    snapshot.forEach(doc => {
      history.push(doc.data());
    });

    // Sắp xếp theo updatedAt giảm dần bằng Javascript để tránh yêu cầu composite index trên Firestore
    return history.sort((a, b) => {
      const timeA = a.updatedAt?.seconds || 0;
      const timeB = b.updatedAt?.seconds || 0;
      return timeB - timeA;
    });
  }

  /**
   * Lấy lịch sử xem của một phim cụ thể
   * @param {string} userId ID của user từ Clerk
   * @param {string} movieSlug Slug của phim
   */
  async getWatchHistoryForMovie(userId, movieSlug) {
    if (!userId || !movieSlug) {
      throw new Error('Thiếu thông tin userId hoặc movieSlug');
    }

    const docRef = this.db.collection('watch_history').doc(`${userId}_${movieSlug}`);
    const doc = await docRef.get();
    return doc.exists ? doc.data() : null;
  }

  /**
   * Xóa lịch sử xem của một phim
   * @param {string} userId ID của user từ Clerk
   * @param {string} movieSlug Slug của phim
   */
  async deleteWatchHistory(userId, movieSlug) {
    if (!userId || !movieSlug) {
      throw new Error('Thiếu thông tin userId hoặc movieSlug');
    }

    const docRef = this.db.collection('watch_history').doc(`${userId}_${movieSlug}`);
    await docRef.delete();
    return { success: true };
  }

  // --- Watchlist ---

  /**
   * Thêm phim vào watchlist
   * @param {string} userId ID của user từ Clerk
   * @param {object} watchlistData Dữ liệu phim yêu thích
   */
  async addToWatchlist(userId, watchlistData) {
    const { movieSlug } = watchlistData;
    if (!userId || !movieSlug) {
      throw new Error('Thiếu thông tin userId hoặc movieSlug');
    }

    const docRef = this.db.collection('watchlist').doc(`${userId}_${movieSlug}`);
    const data = {
      userId,
      ...watchlistData,
      addedAt: FieldValue.serverTimestamp()
    };

    await docRef.set(data);
    return data;
  }

  /**
   * Xóa phim khỏi watchlist
   * @param {string} userId ID của user từ Clerk
   * @param {string} movieSlug Slug của phim
   */
  async removeFromWatchlist(userId, movieSlug) {
    if (!userId || !movieSlug) {
      throw new Error('Thiếu thông tin userId hoặc movieSlug');
    }

    const docRef = this.db.collection('watchlist').doc(`${userId}_${movieSlug}`);
    await docRef.delete();
    return { success: true };
  }

  /**
   * Lấy danh sách watchlist của người dùng
   * @param {string} userId ID của user từ Clerk
   */
  async getWatchlist(userId) {
    if (!userId) {
      throw new Error('UserId là bắt buộc');
    }

    const snapshot = await this.db.collection('watchlist')
      .where('userId', '==', userId)
      .get();

    const watchlist = [];
    snapshot.forEach(doc => {
      watchlist.push(doc.data());
    });

    // Sắp xếp theo addedAt giảm dần bằng Javascript để tránh yêu cầu composite index trên Firestore
    return watchlist.sort((a, b) => {
      const timeA = a.addedAt?.seconds || 0;
      const timeB = b.addedAt?.seconds || 0;
      return timeB - timeA;
    });
  }

  /**
   * Kiểm tra phim đã có trong watchlist chưa
   * @param {string} userId ID của user từ Clerk
   * @param {string} movieSlug Slug của phim
   */
  async checkInWatchlist(userId, movieSlug) {
    if (!userId || !movieSlug) {
      throw new Error('Thiếu thông tin userId hoặc movieSlug');
    }

    const docRef = this.db.collection('watchlist').doc(`${userId}_${movieSlug}`);
    const doc = await docRef.get();
    return doc.exists;
  }
}

module.exports = new UserRepository();
