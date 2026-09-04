import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { useGetMoviesByListQuery } from '../redux/services/movieApi';
import MovieList from '../components/MovieList';

const LIST_OPTIONS = [
  { slug: 'phim-moi', label: 'Phim mới' },
  { slug: 'phim-bo', label: 'Phim bộ' },
  { slug: 'phim-le', label: 'Phim lẻ' },
  { slug: 'tv-shows', label: 'Shows' },
  { slug: 'hoat-hinh', label: 'Hoạt hình' },
  { slug: 'phim-vietsub', label: 'Phim Vietsub' },
  { slug: 'phim-thuyet-minh', label: 'Phim thuyết minh' },
  { slug: 'phim-long-tieng', label: 'Phim lồng tiếng' },
  { slug: 'phim-bo-dang-chieu', label: 'Phim bộ đang chiếu' },
  { slug: 'phim-bo-hoan-thanh', label: 'Phim bộ đã hoàn thành' },
  { slug: 'subteam', label: 'Subteam' },
  { slug: 'phim-chieu-rap', label: 'Phim chiếu rạp' },
];

const LIST_TITLES = LIST_OPTIONS.reduce((acc, cur) => {
  acc[cur.slug] = cur.label;
  return acc;
}, {});

const LIST_DROPDOWN_OPTIONS = LIST_OPTIONS.map((o) => ({
  ...o,
  name: o.label,
}));

const SORT_FIELD_OPTIONS = [
  { slug: 'modified.time', name: 'Mới cập nhật' },
  { slug: 'year', name: 'Năm sản xuất' },
  { slug: '_id', name: 'ID' },
];

const SORT_TYPE_OPTIONS = [
  { slug: 'desc', name: 'Giảm dần' },
  { slug: 'asc', name: 'Tăng dần' },
];

// Dữ liệu quốc gia theo KKPhim API
const COUNTRY_OPTIONS = [
  { _id: '932bbaca386ee0436ad0159117eabae4', name: 'Anh', slug: 'anh' },
  { _id: '59317f665349487a74856ac3e37b35b5', name: 'Ba Lan', slug: 'ba-lan' },
  { _id: '42537f0fb56e31e20ab9c2305752087d', name: 'Brazil', slug: 'brazil' },
  { _id: 'fcd5da8ea7e4bf894692933ee3677967', name: 'Bồ Đào Nha', slug: 'bo-dao-nha' },
  { _id: '445d337b5cd5de476f99333df6b0c2a7', name: 'Canada', slug: 'canada' },
  { _id: '471cdb11e01cf8fcdafd3ab5cd7b4241', name: 'Châu Phi', slug: 'chau-phi' },
  { _id: '41487913363f08e29ea07f6fdfb49a41', name: 'Hà Lan', slug: 'ha-lan' },
  { _id: '05de95be5fc404da9680bbb3dd8262e6', name: 'Hàn Quốc', slug: 'han-quoc' },
  { _id: 'dcd5551cbd22ea2372726daafcd679c1', name: 'Hồng Kông', slug: 'hong-kong' },
  { _id: '4647d00cf81f8fb0ab80f753320d0fc9', name: 'Indonesia', slug: 'indonesia' },
  { _id: '3f0e49c46cbde0c7adf5ea04a97ab261', name: 'Malaysia', slug: 'malaysia' },
  { _id: '8dbb07a18d46f63d8b3c8994d5ccc351', name: 'Mexico', slug: 'mexico' },
  { _id: '638f494a6d33cf5760f6e95c8beb612a', name: 'Na Uy', slug: 'na-uy' },
  { _id: '3cf479dac2caaead12dfa36105b1c402', name: 'Nam Phi', slug: 'nam-phi' },
  { _id: '2dbf49dd0884691f87e44769a3a3a29e', name: 'Nga', slug: 'nga' },
  { _id: 'd4097fbffa8f7149a61281437171eb83', name: 'Nhật Bản', slug: 'nhat-ban' },
  { _id: '77dab2f81a6c8c9136efba7ab2c4c0f2', name: 'Philippines', slug: 'philippines' },
  { _id: '92f688188aa938a03a61a786d6616dcb', name: 'Pháp', slug: 'phap' },
  { _id: '45a260effdd4ba38e861092ae2a1b96a', name: 'Quốc Gia Khác', slug: 'quoc-gia-khac' },
  { _id: 'cefbf1640a17bad1e13c2f6f2a811a2d', name: 'Thái Lan', slug: 'thai-lan' },
  { _id: '8931caa7f43ee5b07bf046c8300f4eba', name: 'Thổ Nhĩ Kỳ', slug: 'tho-nhi-ky' },
  { _id: '69e561770d6094af667b9361f58f39bd', name: 'Thụy Sĩ', slug: 'thuy-si' },
  { _id: '61709e9e6ca6ca8245bc851c0b781673', name: 'Thụy Điển', slug: 'thuy-dien' },
  { _id: '3e075636c731fe0f889c69e0bf82c083', name: 'Trung Quốc', slug: 'trung-quoc' },
  { _id: '8a40abac202ab3659bb98f71f05458d1', name: 'Tây Ban Nha', slug: 'tay-ban-nha' },
  { _id: 'b6ae56d2d40c99fc293aefe45dcb3b3d', name: 'UAE', slug: 'uae' },
  { _id: 'c338f80e38dd2381f8faf9eccb6e6c1c', name: 'Ukraina', slug: 'ukraina' },
  { _id: 'f6ce1ae8b39af9d38d653b8a0890adb8', name: 'Việt Nam', slug: 'viet-nam' },
  { _id: '74d9fa92f4dea9ecea8fc2233dc7921a', name: 'Âu Mỹ', slug: 'au-my' },
  { _id: '435a85571578e419ed511257881a1e75', name: 'Úc', slug: 'uc' },
  { _id: 'a30878a7fdb6a94348fce16d362edb11', name: 'Ý', slug: 'y' },
  { _id: '208c51751eff7e1480052cdb4e26176a', name: 'Đan Mạch', slug: 'dan-mach' },
  { _id: '559fea9881e3a6a3e374b860fa8fb782', name: 'Đài Loan', slug: 'dai-loan' },
  { _id: '24a5bf049aeef94ab79bad1f73f16b92', name: 'Đức', slug: 'duc' },
  { _id: 'cc85d02a69f06f7b43ab67f5673604a3', name: 'Ả Rập Xê Út', slug: 'a-rap-xe-ut' },
  { _id: 'aadd510492662beef1a980624b26c685', name: 'Ấn Độ', slug: 'an-do' },
];

// Dữ liệu thể loại theo KKPhim API
const CATEGORY_OPTIONS = [
  { _id: '2fb53017b3be83cd754a08adab3e916c', name: 'Bí Ẩn', slug: 'bi-an' },
  { _id: '1bae5183d681b7649f9bf349177f7123', name: 'Chiến Tranh', slug: 'chien-tranh' },
  { _id: '37a7b38b6184a5ebd3c43015aa20709d', name: 'Chính Kịch', slug: 'chinh-kich' },
  { _id: '3a17c7283b71fa84e5a8d76fb790ed3e', name: 'Cổ Trang', slug: 'co-trang' },
  { _id: 'a2492d6cbc4d58f115406ca14e5ec7b6', name: 'Gia Đình', slug: 'gia-dinh' },
  { _id: 'ba6fd52e5a3aca80eaaf1a3b50a182db', name: 'Hài Hước', slug: 'hai-huoc' },
  { _id: '9822be111d2ccc29c7172c78b8af8ff5', name: 'Hành Động', slug: 'hanh-dong' },
  { _id: '7a035ac0b37f5854f0f6979260899c90', name: 'Hình Sự', slug: 'hinh-su' },
  { _id: '01c8abbb7796a1cf1989616ca5c175e6', name: 'Học Đường', slug: 'hoc-duong' },
  { _id: '0bcf4077916678de9b48c89221fcf8ae', name: 'Khoa Học', slug: 'khoa-hoc' },
  { _id: '4db8d7d4b9873981e3eeb76d02997d58', name: 'Kinh Dị', slug: 'kinh-di' },
  { _id: '268385d0de78827ff7bb25c35036ee2a', name: 'Kinh Điển', slug: 'kinh-dien' },
  { _id: 'f8ec3e9b77c509fdf64f0c387119b916', name: 'Lịch Sử', slug: 'lich-su' },
  { _id: 'd111447ee87ec1a46a31182ce4623662', name: 'Miền Tây', slug: 'mien-tay' },
  { _id: '4b4457a1af8554c282dc8ac41fd7b4a1', name: 'Phim 18+', slug: 'phim-18' },
  { _id: '4f02d28224c0747511790d57fbb63a62', name: 'Phim Ngắn', slug: 'phim-ngan' },
  { _id: '66c78b23908113d478d8d85390a244b4', name: 'Phiêu Lưu', slug: 'phieu-luu' },
  { _id: '2276b29204c46f75064735477890afd6', name: 'Thần Thoại', slug: 'than-thoai' },
  { _id: '591bbb2abfe03f5aa13c08f16dfb69a2', name: 'Thể Thao', slug: 'the-thao' },
  { _id: '0c853f6238e0997ee318b646bb1978bc', name: 'Trẻ Em', slug: 'tre-em' },
  { _id: '1645fa23fa33651cef84428b0dcc2130', name: 'Tài Liệu', slug: 'tai-lieu' },
  { _id: 'a7b065b92ad356387ef2e075dee66529', name: 'Tâm Lý', slug: 'tam-ly' },
  { _id: 'bb2b4b030608ca5984c8dd0770f5b40b', name: 'Tình Cảm', slug: 'tinh-cam' },
  { _id: '68564911f00849030f9c9c144ea1b931', name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { _id: '578f80eb493b08d175c7a0c29687cbdf', name: 'Võ Thuật', slug: 'vo-thuat' },
  { _id: '252e74b4c832ddb4233d7499f5ed122e', name: 'Âm Nhạc', slug: 'am-nhac' },
];

function FilterDropdown({
  value,
  options,
  onChange,
  placeholder = 'Tất cả',
  minWidthClass = 'min-w-44',
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selectedLabel =
    value ? options.find((o) => o.slug === value)?.name || value : placeholder;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={`relative ${minWidthClass}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full h-10 bg-linear-to-b from-gray-950 to-black border border-gray-800/80 text-sm text-gray-200 rounded-lg px-3 focus:outline-none focus:border-red-600/90 focus:ring-2 focus:ring-red-600/20 flex items-center justify-between gap-2 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] hover:border-gray-700 transition-colors"
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-800/80 bg-linear-to-b from-gray-950 to-black shadow-2xl overflow-hidden">
          <div className="max-h-80 overflow-y-auto scrollbar-hide py-1">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-900/70 transition-colors ${
                !value ? 'text-white bg-gray-900/50' : 'text-gray-200'
              }`}
            >
              {placeholder}
            </button>
            {options.map((opt) => {
              const active = opt.slug === value;
              return (
                <button
                  key={opt._id || opt.slug}
                  type="button"
                  onClick={() => {
                    onChange(opt.slug);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-900/70 transition-colors ${
                    active ? 'text-white bg-gray-900/50' : 'text-gray-200'
                  }`}
                >
                  {opt.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function getPageNumbers(currentPage, totalPages) {
  const pages = [];
  const delta = 2; // số trang hiển thị mỗi bên trang hiện tại

  // Luôn thêm trang 1
  pages.push(1);

  // Tính range xung quanh currentPage
  const start = Math.max(2, currentPage - delta);
  const end = Math.min(totalPages - 1, currentPage + delta);

  // Ellipsis trước
  if (start > 2) pages.push('...');

  // Các trang ở giữa
  for (let i = start; i <= end; i++) pages.push(i);

  // Ellipsis sau
  if (end < totalPages - 1) pages.push('...');

  // Luôn thêm trang cuối (nếu > 1)
  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

function MovieListPageSkeleton() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.skeleton-card');
      if (cards.length > 0) {
        gsap.killTweensOf(cards);
        gsap.fromTo(
          cards,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.04,
            ease: 'power2.out',
          }
        );
      }
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 py-4 px-4"
    >
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="skeleton-card flex flex-col bg-zinc-950 rounded-lg overflow-hidden border border-zinc-900"
          style={{ opacity: 0 }}
        >
          <div className="aspect-2/3 bg-zinc-900 skeleton-shimmer rounded-lg" />
          <div className="p-3">
            <div className="skeleton-shimmer h-4 bg-zinc-900 rounded w-3/4 mb-2" />
            <div className="skeleton-shimmer h-3 bg-zinc-900 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MovieListPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const paginationRef = useRef(null);

  const currentPage = Number(searchParams.get('page') || 1);

  useEffect(() => {
    if (paginationRef.current) {
      gsap.fromTo(
        paginationRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [currentPage]);
  const sortField = searchParams.get('sort_field') || 'modified.time';
  const sortType = searchParams.get('sort_type') || 'desc';
  const category = searchParams.get('category') || '';
  const country = searchParams.get('country') || '';
  const year = searchParams.get('year') || '';

  const { data, isLoading: loading, error } = useGetMoviesByListQuery(
    {
      slug,
      params: {
        page: currentPage,
        limit: 24,
        sort_field: sortField,
        sort_type: sortType,
        category: category || undefined,
        country: country || undefined,
        year: year || undefined,
      },
    },
    { skip: !slug }
  );

  const movies = data?.items || [];
  const pagination = data?.pagination || {};

  const handlePageChange = (page) => {
    if (page === currentPage || page < 1) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(page));
      return next;
    });
  };

  const updateFilterParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      // Mỗi lần đổi filter quay lại trang 1
      next.set('page', '1');
      return next;
    });
  };

  const handleListSlugChange = (nextSlug) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', '1');
    setSearchParams(next);
    navigate(`/danh-sach/${nextSlug}?${next.toString()}`);
  };

  const title = LIST_TITLES[slug] || 'Danh sách phim';

  // Bỏ early return loading để hiển thị skeleton trong layout chính

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-800 rounded-lg px-6 py-4 text-red-400">
          <p className="font-semibold mb-1">Không thể tải danh sách phim.</p>
          <p className="text-sm">
            {error.message || (typeof error === 'string' ? error : 'Đã xảy ra lỗi')}
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const totalPages = pagination.totalItemsPerPage
    ? Math.ceil((pagination.totalItems || 0) / pagination.totalItemsPerPage)
    : pagination.totalPages || 1;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {pagination.totalItems !== undefined && (
            <p className="text-gray-400 text-sm">
              Tìm thấy {pagination.totalItems} phim
            </p>
          )}
        </div>

        {/* Filter bar */}
        <div className="relative z-40 mb-6 rounded-2xl border border-gray-800/80 bg-linear-to-b from-gray-950/70 to-black/60 backdrop-blur px-4 py-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* List slug */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-widest">
                Danh sách
              </span>
              <FilterDropdown
                value={slug}
                options={LIST_DROPDOWN_OPTIONS}
                onChange={handleListSlugChange}
                placeholder="Chọn danh sách"
                minWidthClass="w-full"
              />
            </div>

            {/* Sort field */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-widest">
                Sắp xếp
              </span>
              <div className="grid grid-cols-2 gap-2">
                <FilterDropdown
                  value={sortField}
                  options={SORT_FIELD_OPTIONS}
                  onChange={(val) => updateFilterParam('sort_field', val)}
                  placeholder="Trường"
                  minWidthClass="w-full"
                />
                <FilterDropdown
                  value={sortType}
                  options={SORT_TYPE_OPTIONS}
                  onChange={(val) => updateFilterParam('sort_type', val)}
                  placeholder="Kiểu"
                  minWidthClass="w-full"
                />
              </div>
            </div>

            {/* Year */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-widest">
                Năm
              </span>
              <input
                type="number"
                value={year}
                onChange={(e) => updateFilterParam('year', e.target.value)}
                placeholder="VD: 2026"
                className="w-full h-10 bg-linear-to-b from-gray-950 to-black border border-gray-800/80 text-sm text-gray-200 rounded-lg px-3 focus:outline-none focus:border-red-600/90 focus:ring-2 focus:ring-red-600/20 hover:border-gray-700 transition-colors"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-widest">
                Thể loại
              </span>
              <FilterDropdown
                value={category}
                options={CATEGORY_OPTIONS}
                onChange={(val) => updateFilterParam('category', val)}
                placeholder="Tất cả"
                minWidthClass="w-full"
              />
            </div>

            {/* Country */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-widest">
                Quốc gia
              </span>
              <FilterDropdown
                value={country}
                options={COUNTRY_OPTIONS}
                onChange={(val) => updateFilterParam('country', val)}
                placeholder="Tất cả"
                minWidthClass="w-full"
              />
            </div>
          </div>
        </div>

        {/* Movie grid */}
        <div className="relative z-0">
          {loading ? (
            <MovieListPageSkeleton />
          ) : (
            <MovieList movies={movies} title="" />
          )}
        </div>

        {/* Pagination nâng cao */}
        {totalPages > 1 && (
          <div
            ref={paginationRef}
            className="mt-8 flex items-center justify-center gap-2 flex-wrap"
          >
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 h-10 rounded-lg bg-zinc-900 border border-zinc-800/80 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 text-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trước</span>
            </button>

            {getPageNumbers(currentPage, totalPages).map((p, idx) => {
              if (p === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 cursor-default select-none"
                  >
                    ...
                  </span>
                );
              }
              const isActive = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-10 h-10 rounded-lg text-sm transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30'
                      : 'bg-zinc-900 border border-zinc-800/80 text-gray-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 h-10 rounded-lg bg-zinc-900 border border-zinc-800/80 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 text-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieListPage;

