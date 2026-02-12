const express = require('express');
const axios = require('axios');
const router = express.Router();

// Base URL cho API bên ngoài (ví dụ: TMDB)
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.themoviedb.org/3';
const API_KEY = process.env.API_KEY;

// GET - Lấy danh sách phim phổ biến
router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movie/popular`, {
      params: {
        api_key: API_KEY,
        language: 'vi-VN',
        page: 1
      }
    });
    
    // Transform data để phù hợp với frontend
    const movies = response.data.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      description: movie.overview,
      rating: movie.vote_average,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A',
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path
    }));
    
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error.message);
    res.status(500).json({ 
      error: 'Không thể lấy danh sách phim',
      message: error.message 
    });
  }
});

// GET - Lấy chi tiết phim theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${API_BASE_URL}/movie/${id}`, {
      params: {
        api_key: API_KEY,
        language: 'vi-VN'
      }
    });
    
    const movie = {
      id: response.data.id,
      title: response.data.title,
      description: response.data.overview,
      rating: response.data.vote_average,
      year: response.data.release_date ? new Date(response.data.release_date).getFullYear() : 'N/A',
      posterPath: response.data.poster_path,
      backdropPath: response.data.backdrop_path,
      genres: response.data.genres,
      runtime: response.data.runtime
    };
    
    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    res.status(500).json({ 
      error: 'Không thể lấy chi tiết phim',
      message: error.message 
    });
  }
});

// GET - Tìm kiếm phim
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const response = await axios.get(`${API_BASE_URL}/search/movie`, {
      params: {
        api_key: API_KEY,
        language: 'vi-VN',
        query: query,
        page: 1
      }
    });
    
    const movies = response.data.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      description: movie.overview,
      rating: movie.vote_average,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A',
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path
    }));
    
    res.json(movies);
  } catch (error) {
    console.error('Error searching movies:', error.message);
    res.status(500).json({ 
      error: 'Không thể tìm kiếm phim',
      message: error.message 
    });
  }
});

module.exports = router;
