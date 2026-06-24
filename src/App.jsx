import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import SearchPage from './pages/SearchPage';
import WatchPage from './pages/WatchPage';
import MovieListPage from './pages/MovieListPage';
import WatchlistPage from './pages/WatchlistPage';
import YoutubeDownloader from './pages/YoutubeDownloader';
import Footer from './components/Footer';
import GlobalLoading from './components/GlobalLoading';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      {/* Tự động cuộn lên đầu trang khi chuyển trang hoặc đổi bộ lọc */}
      <ScrollToTop />
      
      <div className="min-h-screen bg-black">
        {/* Hỗ trợ loading global cực xịn sò */}
        <GlobalLoading />
        
        {/* Navbar */}
        <Navbar />

        {/* Main Content - với padding-top để không bị navbar che */}
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/phim/:slug" element={<MovieDetail />} />
            <Route path="/xem/:slug" element={<WatchPage />} />
            <Route path="/danh-sach/:slug" element={<MovieListPage />} />
            <Route path="/search/:keyword" element={<SearchPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/youtube-downloader" element={<YoutubeDownloader />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
