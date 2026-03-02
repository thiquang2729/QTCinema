import { useEffect, useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import MovieList from '../components/MovieList';
import axiosInstance from '../services/axiosInstance';
import { Link } from 'react-router-dom';

function Home() {
  const [koreanMovies, setKoreanMovies] = useState([]);
  const [koreanLoading, setKoreanLoading] = useState(false);
  const [koreanError, setKoreanError] = useState(null);
  const [chinaMovies, setChinaMovies] = useState([]);
  const [chinaLoading, setChinaLoading] = useState(false);
  const [chinaError, setChinaError] = useState(null);
  const [europeMovies, setEuropeMovies] = useState([]);
  const [europeLoading, setEuropeLoading] = useState(false);
  const [europeError, setEuropeError] = useState(null);
  const [animationMovies, setAnimationMovies] = useState([]);
  const [animationLoading, setAnimationLoading] = useState(false);
  const [animationError, setAnimationError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchKorean = async () => {
      try {
        setKoreanLoading(true);
        setKoreanError(null);
        const res = await axiosInstance.get('/movies/country/han-quoc', {
          params: {
            page: 1,
            limit: 24,
            sort_field: 'modified.time',
            sort_type: 'desc',
          },
        });
        const items = res.data?.items || [];
        if (mounted) setKoreanMovies(Array.isArray(items) ? items : []);
      } catch (err) {
        if (mounted) {
          setKoreanMovies([]);
          setKoreanError(err?.response?.data || err?.message || 'Không thể tải phim Hàn Quốc');
        }
      } finally {
        if (mounted) setKoreanLoading(false);
      }
    };

    fetchKorean();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchChina = async () => {
      try {
        setChinaLoading(true);
        setChinaError(null);
        const res = await axiosInstance.get('/movies/country/trung-quoc', {
          params: {
            page: 1,
            limit: 24,
            sort_field: 'modified.time',
            sort_type: 'desc',
          },
        });
        const items = res.data?.items || [];
        if (mounted) setChinaMovies(Array.isArray(items) ? items : []);
      } catch (err) {
        if (mounted) {
          setChinaMovies([]);
          setChinaError(err?.response?.data || err?.message || 'Không thể tải phim Trung Quốc');
        }
      } finally {
        if (mounted) setChinaLoading(false);
      }
    };

    fetchChina();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchEurope = async () => {
      try {
        setEuropeLoading(true);
        setEuropeError(null);
        // Dùng slug quốc gia tương ứng "Âu Mỹ" (thường là nhóm phim Châu Âu/Âu Mỹ)
        const res = await axiosInstance.get('/movies/country/au-my', {
          params: {
            page: 1,
            limit: 24,
            sort_field: 'modified.time',
            sort_type: 'desc',
          },
        });
        const items = res.data?.items || [];
        if (mounted) setEuropeMovies(Array.isArray(items) ? items : []);
      } catch (err) {
        if (mounted) {
          setEuropeMovies([]);
          setEuropeError(err?.response?.data || err?.message || 'Không thể tải phim Châu Âu');
        }
      } finally {
        if (mounted) setEuropeLoading(false);
      }
    };

    fetchEurope();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchAnimation = async () => {
      try {
        setAnimationLoading(true);
        setAnimationError(null);
        // Dùng API danh sách theo bộ lọc (slug: hoat-hinh)
        const res = await axiosInstance.get('/movies/list/hoat-hinh', {
          params: {
            page: 1,
            limit: 24,
            sort_field: 'modified.time',
            sort_type: 'desc',
          },
        });
        const items = res.data?.items || [];
        if (mounted) setAnimationMovies(Array.isArray(items) ? items : []);
      } catch (err) {
        if (mounted) {
          setAnimationMovies([]);
          setAnimationError(err?.response?.data || err?.message || 'Không thể tải phim Hoạt Hình');
        }
      } finally {
        if (mounted) setAnimationLoading(false);
      }
    };

    fetchAnimation();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {/* Hero Slider Section */}
      <HeroSlider />

      {/* Movie List Section */}
      <div className="bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MovieList layout="row" />
        </div>
      </div>

      {/* Korean Movies Section */}
      <div className="bg-black pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {koreanLoading ? (
            <div className="flex justify-center items-center min-h-[140px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
            </div>
          ) : koreanError ? (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
              <p className="font-semibold">Không thể tải phim Hàn Quốc</p>
              <p className="text-sm mt-1">
                {typeof koreanError === 'string'
                  ? koreanError
                  : koreanError?.message || koreanError?.error || 'Đã xảy ra lỗi'}
              </p>
            </div>
          ) : (
            <MovieList
              movies={koreanMovies}
              title="Drama xứ Kim Chi"
              layout="row"
              titleRight={
                <Link
                  to="/danh-sach/phim-moi?country=han-quoc"
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
                  className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Thêm
                </Link>
              }
            />
          )}
        </div>
      </div>

      {/* China Movies Section */}
      <div className="bg-black pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {chinaLoading ? (
            <div className="flex justify-center items-center min-h-[140px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
            </div>
          ) : chinaError ? (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
              <p className="font-semibold">Không thể tải phim Trung Quốc</p>
              <p className="text-sm mt-1">
                {typeof chinaError === 'string'
                  ? chinaError
                  : chinaError?.message || chinaError?.error || 'Đã xảy ra lỗi'}
              </p>
            </div>
          ) : (
            <MovieList
              movies={chinaMovies}
              title="Made in China"
              layout="row"
              titleRight={
                <Link
                  to="/danh-sach/phim-moi?country=trung-quoc"
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
                  className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Thêm
                </Link>
              }
            />
          )}
        </div>
      </div>

      {/* Europe Movies Section */}
      <div className="bg-black pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {europeLoading ? (
            <div className="flex justify-center items-center min-h-[140px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
            </div>
          ) : europeError ? (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
              <p className="font-semibold">Không thể tải phim Châu Âu</p>
              <p className="text-sm mt-1">
                {typeof europeError === 'string'
                  ? europeError
                  : europeError?.message || europeError?.error || 'Đã xảy ra lỗi'}
              </p>
            </div>
          ) : (
            <MovieList
              movies={europeMovies}
              title="Phim Châu Âu"
              layout="row"
              titleRight={
                <Link
                  to="/danh-sach/phim-moi?country=au-my"
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
                  className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Thêm
                </Link>
              }
            />
          )}
        </div>
      </div>

      {/* Animation Movies Section */}
      <div className="bg-black pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {animationLoading ? (
            <div className="flex justify-center items-center min-h-[140px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
            </div>
          ) : animationError ? (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
              <p className="font-semibold">Không thể tải phim Hoạt Hình</p>
              <p className="text-sm mt-1">
                {typeof animationError === 'string'
                  ? animationError
                  : animationError?.message || animationError?.error || 'Đã xảy ra lỗi'}
              </p>
            </div>
          ) : (
            <MovieList
              movies={animationMovies}
              title="Phim Hoạt Hình"
              layout="row"
              titleRight={
                <Link
                  to="/danh-sach/hoat-hinh"
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
                  className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Thêm
                </Link>
              }
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
