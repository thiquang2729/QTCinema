import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { fetchMoviesByList } from '../redux/slices/movieSlice';
import MovieList from '../components/MovieList';

const LIST_OPTIONS = [
  { slug: 'phim-moi', label: 'Phim mới' },
  { slug: 'phim-bo', label: 'Phim bộ' },
  { slug: 'phim-le', label: 'Phim lẻ' },
  { slug: 'tv-shows', label: 'TV Shows' },
  { slug: 'hoat-hinh', label: 'Hoạt hình' },
  { slug: 'phim-vietsub', label: 'Phim Vietsub' },
  { slug: 'phim-thuyet-minh', label: 'Phim thuyết minh' },
  { slug: 'phim-long-tien', label: 'Phim lồng tiếng' },
  { slug: 'phim-bo-dang-chieu', label: 'Phim bộ đang chiếu' },
  { slug: 'phim-bo-hoan-thanh', label: 'Phim bộ hoàn thành' },
  { slug: 'phim-sap-chieu', label: 'Phim sắp chiếu' },
  { slug: 'subteam', label: 'Subteam' },
  { slug: 'phim-chieu-rap', label: 'Phim chiếu rạp' },
];

const LIST_TITLES = LIST_OPTIONS.reduce((acc, cur) => {
  acc[cur.slug] = cur.label;
  return acc;
}, {});

// Dữ liệu quốc gia cố định (không fetch từ backend)
const COUNTRY_OPTIONS = [
  { _id: '62093063196e9f4ab6b448b8', name: 'Trung Quốc', slug: 'trung-quoc' },
  { _id: '620a2300e0fc277084dfd6d2', name: 'Hàn Quốc', slug: 'han-quoc' },
  { _id: '620a2307e0fc277084dfd726', name: 'Nhật Bản', slug: 'nhat-ban' },
  { _id: '620a2318e0fc277084dfd77a', name: 'Thái Lan', slug: 'thai-lan' },
  { _id: '620a231fe0fc277084dfd7ce', name: 'Âu Mỹ', slug: 'au-my' },
  { _id: '620a2335e0fc277084dfd822', name: 'Đài Loan', slug: 'dai-loan' },
  { _id: '620a2347e0fc277084dfd876', name: 'Hồng Kông', slug: 'hong-kong' },
  { _id: '620a2355e0fc277084dfd8ca', name: 'Ấn Độ', slug: 'an-do' },
  { _id: '620a2370e0fc277084dfd91e', name: 'Anh', slug: 'anh' },
  { _id: '620a2378e0fc277084dfd972', name: 'Pháp', slug: 'phap' },
  { _id: '620a2381e0fc277084dfd9c6', name: 'Canada', slug: 'canada' },
  { _id: '620a2398e0fc277084dfda1a', name: 'Quốc Gia Khác', slug: 'quoc-gia-khac' },
  { _id: '620e0e8fd9648f114cde77f7', name: 'Đức', slug: 'duc' },
  { _id: '620e0ea0d9648f114cde784b', name: 'Tây Ban Nha', slug: 'tay-ban-nha' },
  { _id: '620f7fa791fa4af90ab6ad1f', name: 'Thổ Nhĩ Kỳ', slug: 'tho-nhi-ky' },
  { _id: '6211e48c1f1609c9d9343bd0', name: 'Hà Lan', slug: 'ha-lan' },
  { _id: '6211fbe91f1609c9d9344bd7', name: 'Indonesia', slug: 'indonesia' },
  { _id: '62121edd1f1609c9d9345940', name: 'Nga', slug: 'nga' },
  { _id: '6212611d1f1609c9d93466cc', name: 'Mexico', slug: 'mexico' },
  { _id: '621262d11f1609c9d934677f', name: 'Ba lan', slug: 'ba-lan' },
  { _id: '62135c8f1f1609c9d9346bb1', name: 'Úc', slug: 'uc' },
  { _id: '62135e8d1f1609c9d9346c8a', name: 'Thụy Điển', slug: 'thuy-dien' },
  { _id: '62159af71f1609c9d934824e', name: 'Malaysia', slug: 'malaysia' },
  { _id: '62159c501f1609c9d934830a', name: 'Brazil', slug: 'brazil' },
  { _id: '6216607570b58bba6858b27c', name: 'Philippines', slug: 'philippines' },
  { _id: '62166eef70b58bba6858b624', name: 'Bồ Đào Nha', slug: 'bo-dao-nha' },
  { _id: '621674a770b58bba6858b852', name: 'Ý', slug: 'y' },
  { _id: '6216751d70b58bba6858b885', name: 'Đan Mạch', slug: 'dan-mach' },
  { _id: '6218e1e7a2d0f024a9de45a2', name: 'UAE', slug: 'uae' },
  { _id: '621a2cb63fb21848d1970e39', name: 'Na Uy', slug: 'na-uy' },
  { _id: '621e33423fb21848d1974d12', name: 'Thụy Sĩ', slug: 'thuy-si' },
  { _id: '621f64afa666e8a57f65c512', name: 'Châu Phi', slug: 'chau-phi' },
  { _id: '621f64bca666e8a57f65c51a', name: 'Nam Phi', slug: 'nam-phi' },
  { _id: '6220d7ba8481266c5b7f08ea', name: 'Ukraina', slug: 'ukraina' },
  { _id: '623f34b1e3cd150b39912d5d', name: 'Ả Rập Xê Út', slug: 'a-rap-xe-ut' },
  { _id: '6246acafc78eb57bbfe35df6', name: 'Bỉ', slug: 'bi' },
  { _id: '625e9769db43524328af1e9c', name: 'Ireland', slug: 'ireland' },
  { _id: '625ff28adb43524328afc13f', name: 'Colombia', slug: 'colombia' },
  { _id: '63295529b4be4e0b655ed084', name: 'Phần Lan', slug: 'phan-lan' },
  { _id: '63e0fd3ecaf0f6e22aeb0616', name: 'Việt Nam', slug: 'viet-nam' },
  { _id: '6401c9e1269d33eaed6b0535', name: 'Chile', slug: 'chile' },
  { _id: '641433f6c9eab12a2a34e4f4', name: 'Hy Lạp', slug: 'hy-lap' },
  { _id: '642fd1c311f407ffb90e8fab', name: 'Nigeria', slug: 'nigeria' },
  { _id: '64399e5d06956a473bb27813', name: 'Argentina', slug: 'argentina' },
  { _id: '644f3b0ed95ac616c32b79ee', name: 'Singapore', slug: 'singapore' },
];

// Dữ liệu thể loại cố định (không fetch từ backend)
const CATEGORY_OPTIONS = [
  { _id: '620a21b2e0fc277084dfd0c5', name: 'Hành Động', slug: 'hanh-dong' },
  { _id: '620a220de0fc277084dfd16d', name: 'Tình Cảm', slug: 'tinh-cam' },
  { _id: '620a221de0fc277084dfd1c1', name: 'Hài Hước', slug: 'hai-huoc' },
  { _id: '620a222fe0fc277084dfd23d', name: 'Cổ Trang', slug: 'co-trang' },
  { _id: '620a2238e0fc277084dfd291', name: 'Tâm Lý', slug: 'tam-ly' },
  { _id: '620a2249e0fc277084dfd2e5', name: 'Hình Sự', slug: 'hinh-su' },
  { _id: '620a2253e0fc277084dfd339', name: 'Chiến Tranh', slug: 'chien-tranh' },
  { _id: '620a225fe0fc277084dfd38d', name: 'Thể Thao', slug: 'the-thao' },
  { _id: '620a2279e0fc277084dfd3e1', name: 'Võ Thuật', slug: 'vo-thuat' },
  { _id: '620a2282e0fc277084dfd435', name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { _id: '620a2293e0fc277084dfd489', name: 'Phiêu Lưu', slug: 'phieu-luu' },
  { _id: '620a229be0fc277084dfd4dd', name: 'Khoa Học', slug: 'khoa-hoc' },
  { _id: '620a22ace0fc277084dfd531', name: 'Kinh Dị', slug: 'kinh-di' },
  { _id: '620a22bae0fc277084dfd585', name: 'Âm Nhạc', slug: 'am-nhac' },
  { _id: '620a22c8e0fc277084dfd5d9', name: 'Thần Thoại', slug: 'than-thoai' },
  { _id: '620e0e64d9648f114cde7728', name: 'Tài Liệu', slug: 'tai-lieu' },
  { _id: '620e4c0b6ba8271c5eef05a8', name: 'Gia Đình', slug: 'gia-dinh' },
  { _id: '620f3d2b91fa4af90ab697fe', name: 'Chính kịch', slug: 'chinh-kich' },
  { _id: '620f84d291fa4af90ab6b3f4', name: 'Bí ẩn', slug: 'bi-an' },
  { _id: '62121e821f1609c9d934585c', name: 'Học Đường', slug: 'hoc-duong' },
  { _id: '6218eb66a2d0f024a9de48d4', name: 'Kinh Điển', slug: 'kinh-dien' },
  { _id: '6242b89cc78eb57bbfe29f91', name: 'Phim 18+', slug: 'phim-18' },
  { _id: '68f786a9f998955ed60add6c', name: 'Short Drama', slug: 'short-drama' },
];

function FilterDropdown({ value, options, onChange, placeholder = 'Tất cả', minWidthClass = 'min-w-44' }) {
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
        className="w-full bg-black border border-gray-700 text-sm text-gray-200 rounded px-2 py-1 focus:outline-none focus:border-red-600 flex items-center justify-between gap-2"
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
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-800 bg-gray-950 shadow-xl overflow-hidden">
          <div className="max-h-72 overflow-y-auto scrollbar-hide py-1">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-900/70 ${
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
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-900/70 ${
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

function MovieListPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { movies, loading, error, pagination } = useSelector((state) => state.movies);

  const currentPage = Number(searchParams.get('page') || 1);
  const sortField = searchParams.get('sort_field') || 'modified.time';
  const sortType = searchParams.get('sort_type') || 'desc';
  const category = searchParams.get('category') || '';
  const country = searchParams.get('country') || '';
  const year = searchParams.get('year') || '';

  useEffect(() => {
    if (!slug) return;

    dispatch(
      fetchMoviesByList({
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
      })
    );
  }, [dispatch, slug, currentPage, sortField, sortType, category, country, year]);

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

  const title = LIST_TITLES[slug] || 'Danh sách phim';

  if (loading && movies.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-gray-300">
        Đang tải danh sách phim...
      </div>
    );
  }

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
        <div className="mb-6 bg-gray-900/60 border border-gray-800 rounded-lg px-4 py-3 flex flex-wrap gap-4 items-center">
          {/* List slug */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Danh sách
            </span>
            <select
              value={slug}
              onChange={(e) => {
                const nextSlug = e.target.value;
                // giữ filter hiện tại, reset page về 1
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set('page', '1');
                  return next;
                });
                navigate(`/danh-sach/${nextSlug}?${searchParams.toString()}`);
              }}
              className="bg-black border border-gray-700 text-sm text-gray-200 rounded px-2 py-1 focus:outline-none focus:border-red-600"
            >
              {LIST_OPTIONS.map((opt) => (
                <option key={opt.slug} value={opt.slug}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort field */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Sắp xếp
            </span>
            <select
              value={sortField}
              onChange={(e) => updateFilterParam('sort_field', e.target.value)}
              className="bg-black border border-gray-700 text-sm text-gray-200 rounded px-2 py-1 focus:outline-none focus:border-red-600"
            >
              <option value="modified.time">Mới cập nhật</option>
              <option value="year">Năm sản xuất</option>
              <option value="_id">ID</option>
            </select>
            <select
              value={sortType}
              onChange={(e) => updateFilterParam('sort_type', e.target.value)}
              className="bg-black border border-gray-700 text-sm text-gray-200 rounded px-2 py-1 focus:outline-none focus:border-red-600"
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
          </div>

          {/* Year */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Năm
            </span>
            <input
              type="number"
              value={year}
              onChange={(e) => updateFilterParam('year', e.target.value)}
              placeholder="VD: 2026"
              className="w-24 bg-black border border-gray-700 text-sm text-gray-200 rounded px-2 py-1 focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Thể loại
            </span>
            <FilterDropdown
              value={category}
              options={CATEGORY_OPTIONS}
              onChange={(val) => updateFilterParam('category', val)}
              placeholder="Tất cả"
              minWidthClass="min-w-44"
            />
          </div>

          {/* Country */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">
              Quốc gia
            </span>
            <FilterDropdown
              value={country}
              options={COUNTRY_OPTIONS}
              onChange={(val) => updateFilterParam('country', val)}
              placeholder="Tất cả"
              minWidthClass="min-w-44"
            />
          </div>
        </div>

        {/* Movie grid */}
        <MovieList movies={movies} title="" />

        {/* Pagination đơn giản */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded bg-gray-800 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Trang trước
            </button>
            <span className="text-gray-300 text-sm">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded bg-gray-800 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieListPage;

