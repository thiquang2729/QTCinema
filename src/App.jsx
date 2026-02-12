import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import MovieList from './components/MovieList'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center gap-8 mb-8">
            <a href="https://vite.dev" target="_blank" className="transition-transform hover:scale-110">
              <img src={viteLogo} className="h-24 w-24" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank" className="transition-transform hover:scale-110">
              <img src={reactLogo} className="h-24 w-24 animate-spin-slow" alt="React logo" />
            </a>
          </div>
          
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            QTCinema
          </h1>
          
          <p className="text-center text-gray-600 mb-6">
            React + Vite + Tailwind CSS + Redux + Axios
          </p>
          
          <div className="text-center space-y-4">
            <button 
              onClick={() => setCount((count) => count + 1)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Count is {count}
            </button>
          </div>
        </div>

        {/* Movie List Section - Demo Redux + Axios */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <MovieList />
        </div>
      </div>
    </div>
  )
}

export default App


