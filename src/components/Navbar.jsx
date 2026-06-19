import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X, Search, User, Film } from 'lucide-react';
import { Show, SignInButton, UserButton } from '@clerk/react';
import gsap from 'gsap';
import axiosInstance from '../services/axiosInstance';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const suggestionItemsRef = useRef([]);
  const searchFormRef = useRef(null);
  const searchIconRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // GSAP animation cho dropdown gợi ý
  useLayoutEffect(() => {
    const dropdown = dropdownRef.current;
    if (!dropdown) return;

    // Animate container
    gsap.fromTo(dropdown,
      { opacity: 0, y: -12, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.4)' }
    );

    // Stagger animate suggestion items
    const items = suggestionItemsRef.current.filter(Boolean);
    if (items.length > 0) {
      gsap.fromTo(items,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.045, ease: 'power2.out', delay: 0.1 }
      );
    }

    // Animate header
    const header = dropdown.querySelector('[data-search-header]');
    if (header) {
      gsap.fromTo(header,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }

    // Animate footer
    const footer = dropdown.querySelector('[data-search-footer]');
    if (footer) {
      gsap.fromTo(footer,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', delay: 0.25 }
      );
    }
  }, [searchSuggestions, searchLoading]);

  // Reset refs khi suggestions thay đổi
  const setSuggestionRef = useCallback((el, index) => {
    suggestionItemsRef.current[index] = el;
  }, []);

  // GSAP animation mở/đóng search bar
  useLayoutEffect(() => {
    const form = searchFormRef.current;
    const icon = searchIconRef.current;
    if (!form || !icon) return;

    if (isSearchOpen) {
      // Mở: fade out icon, slide in form từ phải
      gsap.to(icon, {
        opacity: 0, scale: 0.5, duration: 0.15, ease: 'power2.in',
        onComplete: () => gsap.set(icon, { visibility: 'hidden' }),
      });
      gsap.set(form, { visibility: 'visible' });
      gsap.fromTo(form,
        { opacity: 0, x: 30 },
        {
          opacity: 1, x: 0,
          duration: 0.35, ease: 'power3.out',
          onComplete: () => searchInputRef.current?.focus(),
        }
      );
    } else {
      // Đóng: fade out form, fade in icon
      gsap.to(form, {
        opacity: 0, x: 20,
        duration: 0.2, ease: 'power2.in',
        onComplete: () => gsap.set(form, { visibility: 'hidden', x: 0 }),
      });
      gsap.set(icon, { visibility: 'visible' });
      gsap.fromTo(icon,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.25, ease: 'back.out(2)', delay: 0.1 }
      );
    }
  }, [isSearchOpen]);

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
          hideLoader: true,
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-xl border-b ${
        isScrolled
          ? 'bg-black/60 border-transparent shadow-lg shadow-black/20'
          : 'bg-black/20 border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-1.5 md:space-x-2">
              <Film className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
              <span className="text-red-600 text-lg md:text-2xl font-bold tracking-tight">
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
              <Link
                to="/danh-sach/phim-bo"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Phim bộ
              </Link>
              <Link
                to="/danh-sach/phim-le"
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Phim lẻ
              </Link>
              <Show when="signed-in">
                <Link
                  to="/watchlist"
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  Phim yêu thích
                </Link>
              </Show>
            </div>
          </div>

          {/* Right side - Search, User */}
          <div className="flex items-center space-x-4">
            {/* Search icon */}
            <button
              ref={searchIconRef}
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-300 hover:text-white transition-colors flex items-center justify-center w-10 h-10 cursor-pointer"
              aria-label="Mở tìm kiếm"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Profile */}
            <Show when="signed-in">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full border border-gray-700 hover:border-red-600 transition-colors"
                  }
                }}
              />
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors cursor-pointer">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">Đăng nhập</span>
                </button>
              </SignInButton>
            </Show>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Search form overlay - absolute trên navbar, không gây layout shift */}
          <div
            ref={searchFormRef}
            className="absolute inset-y-0 left-0 right-0 flex items-center px-4 sm:px-6 lg:px-8 z-20"
            style={{ visibility: 'hidden' }}
          >
            <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto md:ml-auto md:mr-0 md:w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400"
                aria-hidden="true"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm phim..."
                className="h-10 w-full bg-black/80 border border-gray-700/70 rounded-lg pl-10 pr-20 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-red-600/90 focus:ring-2 focus:ring-red-600/20 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] transition-colors"
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
              <div
                ref={dropdownRef}
                className="absolute left-1/2 md:left-auto md:right-4 lg:md:right-8 -translate-x-1/2 md:translate-x-0 top-full mt-2 w-[92vw] sm:w-[400px] md:w-96 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)_inset] max-h-[480px] overflow-y-auto overflow-x-hidden scrollbar-hide z-50 backdrop-blur-2xl"
                style={{
                  background: 'linear-gradient(170deg, rgba(30,30,36,0.97) 0%, rgba(12,12,16,0.98) 100%)',
                }}
              >
                {searchLoading ? (
                  <div className="p-3 space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-[52px] h-[72px] rounded-lg bg-white/[0.06]" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-3/4 rounded-full bg-white/[0.06]" />
                          <div className="h-2.5 w-1/2 rounded-full bg-white/[0.04]" />
                          <div className="flex gap-2">
                            <div className="h-4 w-8 rounded-full bg-white/[0.04]" />
                            <div className="h-4 w-10 rounded-full bg-white/[0.04]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchSuggestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <Search className="w-8 h-8 text-gray-600 mb-3" />
                    <p className="text-sm text-gray-400 text-center">
                      Không tìm thấy phim phù hợp với
                    </p>
                    <p className="text-sm text-white font-medium mt-1">
                      "{searchKeyword.trim()}"
                    </p>
                  </div>
                ) : (
                  <>
                    <div data-search-header className="px-4 pt-3.5 pb-2.5 border-b border-white/[0.06]">
                      <p className="text-[11px] uppercase tracking-[0.08em] text-gray-500 font-medium">
                        Gợi ý cho&nbsp;
                        <span className="text-red-400 font-semibold normal-case tracking-normal">
                          "{searchKeyword.trim()}"
                        </span>
                      </p>
                    </div>
                    <ul className="py-1.5">
                      {searchSuggestions.map((movie, index) => (
                        <li
                          key={movie.id || movie._id || movie.slug}
                          ref={(el) => setSuggestionRef(el, index)}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              navigate(`/phim/${movie.slug}`);
                              setIsSearchOpen(false);
                              setSearchKeyword('');
                              setSearchSuggestions([]);
                            }}
                            className="group w-full flex items-center gap-3.5 px-3.5 py-2.5 text-left transition-all duration-200 hover:bg-white/[0.04] relative"
                          >
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-3/5 rounded-full bg-gradient-to-b from-red-500 to-orange-500 transition-all duration-300" />
                            <div className="w-[52px] h-[72px] shrink-0 rounded-lg overflow-hidden bg-gray-800/60 ring-1 ring-white/[0.06] group-hover:ring-red-500/30 transition-all duration-300 shadow-md">
                              {movie.thumbUrl ? (
                                <img
                                  src={movie.thumbUrl}
                                  alt={movie.title}
                                  className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-500"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Film className="w-5 h-5 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-gray-100 truncate group-hover:text-white transition-colors">
                                {movie.title}
                              </p>
                              <p className="text-[11px] text-gray-500 truncate mt-0.5 group-hover:text-gray-400 transition-colors">
                                {movie.originalTitle}
                              </p>
                              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                                {movie.year && (
                                  <span className="text-[11px] text-gray-400 tabular-nums">{movie.year}</span>
                                )}
                                {movie.quality && (
                                  <span className="px-1.5 py-[1px] rounded bg-red-600/90 text-white text-[10px] font-bold leading-4 tracking-wide">
                                    {movie.quality}
                                  </span>
                                )}
                                {movie.lang && (
                                  <span className="px-1.5 py-[1px] rounded bg-sky-600/80 text-white text-[10px] font-semibold leading-4">
                                    {movie.lang}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="opacity-0 group-hover:opacity-100 text-gray-500 transition-all duration-200 -translate-x-1 group-hover:translate-x-0">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
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
                      data-search-footer
                      className="group w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-t border-white/[0.06] transition-all duration-200 hover:bg-white/[0.03]"
                      style={{ color: 'rgb(248,113,113)' }}
                    >
                      <span className="group-hover:tracking-wide transition-all duration-300">
                        Xem tất cả kết quả
                      </span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/40 backdrop-blur-xl border-t border-white/10">
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
              <Link
                to="/danh-sach/phim-bo"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-red-600/20 rounded transition-colors"
              >
                Phim bộ
              </Link>
              <Link
                to="/danh-sach/phim-le"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-red-600/20 rounded transition-colors"
              >
                Phim lẻ
              </Link>
              <Show when="signed-in">
                <Link
                  to="/watchlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-red-600/20 rounded transition-colors"
                >
                  Phim yêu thích
                </Link>
              </Show>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
