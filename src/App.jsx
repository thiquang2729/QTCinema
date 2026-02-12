import { useState } from 'react'
import Navbar from './components/Navbar'
import MovieList from './components/MovieList'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <Navbar />

      {/* Main Content - với padding-top để không bị navbar che */}
      <main className="pt-16">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-black via-gray-900 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-600 via-red-500 to-red-700 bg-clip-text text-transparent">
                QTCinema
              </h1>
              
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
                Khám phá hàng ngàn bộ phim và chương trình truyền hình yêu thích của bạn
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => setCount((count) => count + 1)}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  Xem ngay • Click: {count}
                </button>
                <button className="px-8 py-3 bg-gray-700/50 hover:bg-gray-700 text-white font-semibold rounded transition-all border border-gray-600">
                  Thông tin thêm
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Movie List Section */}
        <div className="bg-black py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MovieList />
          </div>
        </div>
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
  )
}

export default App



