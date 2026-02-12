import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';

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
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-black border-t border-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              © 2026 QTCinema. React + Vite + Tailwind CSS + Redux + Axios
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
