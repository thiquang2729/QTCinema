import { useEffect, useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import MovieList from '../components/MovieList';
import axiosInstance from '../services/axiosInstance';
import { Link } from 'react-router-dom';

function Home() {
  const [koreanMovies, setKoreanMovies] = useState([]);
  const [koreanLoading, setKoreanLoading] = useState(false);
  const [koreanError, setKoreanError] = useState(null);

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
              title="Phim Hàn Quốc"
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
    </>
  );
}

export default Home;
