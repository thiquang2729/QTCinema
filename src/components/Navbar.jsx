import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, Search, User, Film } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Xử lý scroll để thay đổi background navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Gợi ý phim khi người dùng gõ từ khóa
  useEffect(() => {
    const keyword = searchKeyword.trim();

    // Reset khi đóng ô search hoặc xóa hết ký tự
    if (!isSearchOpen || keyword.length < 2) {
      setSearchSuggestions([]);
      setSearchLoading(false);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      return;
    }

    // Debounce 300ms để tránh spam API
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const response = await axiosInstance.get(`/movies/search/${encodeURIComponent(keyword)}`, {
          params: { page: 1, limit: 8 },
        });
        const items = response.data?.items || [];
        setSearchSuggestions(items);
      } catch (error) {
        console.error('Search suggestions error:', error);
        setSearchSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchKeyword, isSearchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim().length >= 2) {
      navigate(`/search/${searchKeyword.trim()}`);
      setSearchKeyword('');
      setSearchSuggestions([]);
      setIsSearchOpen(false);
    }
  };

  // Giữ "Danh sách phim" như link thường (không dropdown)

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black' : 'bg-linear-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Film className="w-8 h-8 text-red-600" />
              <span className="text-red-600 text-2xl font-bold tracking-tight">
                QTCinema
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6">
              <Link
                to="/"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Trang chủ
              </Link>
              <Link
                to="/danh-sach/phim-moi"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Danh sách phim
              </Link>
            </div>
          </div>

          {/* Right side - Search, User */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            {isSearchOpen ? (
              <div className="relative">
                <form onSubmit={handleSearch} className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Tìm phim..."
                    className="h-10 w-56 sm:w-80 bg-black/40 border border-gray-700/70 rounded-lg pl-10 pr-20 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-red-600/90 focus:ring-2 focus:ring-red-600/20 backdrop-blur shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] transition-colors"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-10 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center"
                    aria-label="Tìm kiếm"
                  >
                    <Search className="w-4 h-4 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchKeyword('');
                      setSearchSuggestions([]);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition-colors flex items-center justify-center"
                    aria-label="Đóng"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>

                {/* Dropdown gợi ý phim */}
                {searchKeyword.trim().length >= 2 && (
                  <div className="absolute right-0 mt-3 w-[320px] sm:w-[360px] bg-linear-to-b from-gray-900/98 via-black/98 to-black/98 border border-gray-800/80 rounded-xl shadow-2xl max-h-[420px] overflow-y-auto overflow-x-hidden scrollbar-hide z-50 backdrop-blur">
                    {searchLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      </div>
                    ) : searchSuggestions.length === 0 ? (
                      <div className="px-4 py-3 text-gray-400 text-sm">
                        Không tìm thấy phim phù hợp
                      </div>
                    ) : (
                      <>
                        <div className="px-3 pt-2 pb-1 border-b border-gray-800/70">
                          <p className="text-[11px] uppercase tracking-wide text-gray-400">
                            Gợi ý cho&nbsp;
                            <span className="text-white font-semibold">
                              “{searchKeyword.trim()}”
                            </span>
                          </p>
                        </div>
                        <ul className="py-1">
                          {searchSuggestions.map((movie, index) => (
                            <li key={movie.id || movie._id || movie.slug}>
                              <button
                                type="button"
                                onClick={() => {
                                  navigate(`/phim/${movie.slug}`);
                                  setIsSearchOpen(false);
                                  setSearchKeyword('');
                                  setSearchSuggestions([]);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all ${
                                  index === 0
                                    ? 'bg-gray-900/80'
                                    : 'hover:bg-gray-900/80 hover:translate-x-px'
                                }`}
                              >
                                <div className="w-12 h-18 sm:w-14 sm:h-20 shrink-0 rounded-md overflow-hidden bg-gray-800 shadow-inner">
                                  {movie.thumbUrl && (
                                    <img
                                      src={movie.thumbUrl}
                                      alt={movie.title}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white truncate">
                                    {movie.title}
                                  </p>
                                  <p className="text-xs text-gray-400 truncate">
                                    {movie.originalTitle}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2 text-[11px]">
                                    {movie.year && (
                                      <span className="text-gray-400">{movie.year}</span>
                                    )}
                                    {movie.quality && (
                                      <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-sm">
                                        {movie.quality}
                                      </span>
                                    )}
                                    {movie.lang && (
                                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-semibold shadow-sm">
                                        {movie.lang}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={() => {
                            if (searchKeyword.trim().length >= 2) {
                              navigate(`/search/${searchKeyword.trim()}`);
                              setIsSearchOpen(false);
                              setSearchSuggestions([]);
                              setSearchKeyword('');
                            }
                          }}
                          className="w-full px-3 py-2.5 text-center text-xs sm:text-sm text-red-400 hover:text-red-300 hover:bg-gray-900/90 border-t border-gray-800/80 font-medium tracking-wide"
                        >
                          Xem tất cả kết quả
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* User Profile */}
            <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Tài khoản</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-red-600/20 rounded transition-colors"
              >
                Trang chủ
              </Link>
              <Link
                to="/danh-sach/phim-moi"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-red-600/20 rounded transition-colors"
              >
                Danh sách phim
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
