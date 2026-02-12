import { useState } from 'react'
import Navbar from './components/Navbar'
import HeroSlider from './components/HeroSlider'
import MovieList from './components/MovieList'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <Navbar />

      {/* Main Content - với padding-top để không bị navbar che */}
      <main className="pt-16">
        {/* Hero Slider Section */}
        <HeroSlider />

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



