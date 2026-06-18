import HeroSlider from '../components/HeroSlider';
import MovieList from '../components/MovieList';
import { Link } from 'react-router-dom';
import {
  useGetHomeMoviesQuery,
  useGetMoviesByCountryQuery,
  useGetMoviesByListQuery,
} from '../redux/services/movieApi';

function Home() {
  // 1. Phim mới cập nhật (Home)
  const {
    data: homeData,
    isLoading: homeLoading,
    error: homeError,
  } = useGetHomeMoviesQuery();
  const homeMovies = homeData?.items || [];

  // 2. Phim Hàn Quốc
  const {
    data: koreanData,
    isLoading: koreanLoading,
    error: koreanError,
  } = useGetMoviesByCountryQuery({
    slug: 'han-quoc',
    params: {
      page: 1,
      limit: 24,
      sort_field: 'modified.time',
      sort_type: 'desc',
    },
  });
  const koreanMovies = koreanData?.items || [];

  // 3. Phim Trung Quốc
  const {
    data: chinaData,
    isLoading: chinaLoading,
    error: chinaError,
  } = useGetMoviesByCountryQuery({
    slug: 'trung-quoc',
    params: {
      page: 1,
      limit: 24,
      sort_field: 'modified.time',
      sort_type: 'desc',
    },
  });
  const chinaMovies = chinaData?.items || [];

  // 4. Phim Âu Mỹ
  const {
    data: europeData,
    isLoading: europeLoading,
    error: europeError,
  } = useGetMoviesByCountryQuery({
    slug: 'au-my',
    params: {
      page: 1,
      limit: 24,
      sort_field: 'modified.time',
      sort_type: 'desc',
    },
  });
  const europeMovies = europeData?.items || [];

  // 5. Phim Hoạt Hình
  const {
    data: animationData,
    isLoading: animationLoading,
    error: animationError,
  } = useGetMoviesByListQuery({
    slug: 'hoat-hinh',
    params: {
      page: 1,
      limit: 24,
      sort_field: 'modified.time',
      sort_type: 'desc',
    },
  });
  const animationMovies = animationData?.items || [];

  return (
    <>
      {/* Hero Slider Section */}
      <HeroSlider movies={homeMovies} loading={homeLoading} />

      {/* Movie List Section */}
      <div className="bg-black py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MovieList
            movies={homeMovies}
            loading={homeLoading}
            error={homeError}
            layout="row"
          />
        </div>
      </div>

      {/* Korean Movies Section */}
      <div className="bg-black pb-6">
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
      <div className="bg-black pb-6">
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
      <div className="bg-black pb-6">
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
      <div className="bg-black pb-6">
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
