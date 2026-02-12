import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import SearchPage from './pages/SearchPage';
import WatchPage from './pages/WatchPage';
import MovieListPage from './pages/MovieListPage';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
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
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
