import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';

// Async thunk để lấy danh sách movies (trang chủ)
export const fetchMovies = createAsyncThunk(
  'movies/fetchMovies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/movies');
      // Backend trả về { status, items, pagination, cdnImageUrl }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk để lấy danh sách phim theo slug danh sách + bộ lọc
// Ví dụ: phim mới, phim lẻ, phim sắp chiếu...
export const fetchMoviesByList = createAsyncThunk(
  'movies/fetchMoviesByList',
  async ({ slug, params = {} }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/movies/list/${slug}`, {
        params,
      });
      // Backend trả về { status, items, pagination }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk để lấy danh sách quốc gia
export const fetchCountries = createAsyncThunk(
  'movies/fetchCountries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/movies/countries');
      // Backend trả về { status, items }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk để lấy chi tiết movie
export const fetchMovieById = createAsyncThunk(
  'movies/fetchMovieById',
  async (movieSlug, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/movies/${movieSlug}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk để lấy hình ảnh phim
export const fetchMovieImages = createAsyncThunk(
  'movies/fetchMovieImages',
  async (movieSlug, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/movies/${movieSlug}/images`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk để lấy thông tin diễn viên
export const fetchMoviePeoples = createAsyncThunk(
  'movies/fetchMoviePeoples',
  async (movieSlug, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/movies/${movieSlug}/peoples`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk để lấy từ khóa phim
export const fetchMovieKeywords = createAsyncThunk(
  'movies/fetchMovieKeywords',
  async (movieSlug, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/movies/${movieSlug}/keywords`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk để tìm kiếm phim
export const searchMovies = createAsyncThunk(
  'movies/searchMovies',
  async ({ keyword, page = 1, limit = 24 }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/movies/search/${keyword}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    movies: [],
    countries: [],
    countriesLoading: false,
    selectedMovie: null,
    movieImages: null,
    moviePeoples: null,
    movieKeywords: null,
    searchResults: [],
    searchPagination: {},
    loading: false,
    imagesLoading: false,
    peoplesLoading: false,
    keywordsLoading: false,
    searchLoading: false,
    error: null,
    pagination: {},
    cdnImageUrl: ''
  },
  reducers: {
    // Synchronous actions
    clearSelectedMovie: (state) => {
      state.selectedMovie = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMovieImages: (state) => {
      state.movieImages = null;
    },
    clearMoviePeoples: (state) => {
      state.moviePeoples = null;
    },
    clearMovieKeywords: (state) => {
      state.movieKeywords = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchPagination = {};
    },
  },
  extraReducers: (builder) => {
    // Fetch movies (trang chủ)
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload.items || [];
        state.pagination = action.payload.pagination || {};
        state.cdnImageUrl = action.payload.cdnImageUrl || '';
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch movies by list slug + filters
    builder
      .addCase(fetchMoviesByList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMoviesByList.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload.items || [];
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchMoviesByList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.movies = [];
      });

    // Fetch countries
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.countriesLoading = true;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.countriesLoading = false;
        state.countries = Array.isArray(action.payload.items) ? action.payload.items : [];
      })
      .addCase(fetchCountries.rejected, (state) => {
        state.countriesLoading = false;
        state.countries = [];
      });

    // Fetch movie by ID
    builder
      .addCase(fetchMovieById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovieById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMovie = action.payload.data || action.payload;
      })
      .addCase(fetchMovieById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch movie images
    builder
      .addCase(fetchMovieImages.pending, (state) => {
        state.imagesLoading = true;
        state.error = null;
      })
      .addCase(fetchMovieImages.fulfilled, (state, action) => {
        state.imagesLoading = false;
        state.movieImages = action.payload.data || action.payload;
      })
      .addCase(fetchMovieImages.rejected, (state, action) => {
        state.imagesLoading = false;
        state.error = action.payload;
      });

    // Fetch movie peoples
    builder
      .addCase(fetchMoviePeoples.pending, (state) => {
        state.peoplesLoading = true;
        state.error = null;
      })
      .addCase(fetchMoviePeoples.fulfilled, (state, action) => {
        state.peoplesLoading = false;
        state.moviePeoples = action.payload.data || action.payload;
      })
      .addCase(fetchMoviePeoples.rejected, (state, action) => {
        state.peoplesLoading = false;
        state.error = action.payload;
      });

    // Fetch movie keywords
    builder
      .addCase(fetchMovieKeywords.pending, (state) => {
        state.keywordsLoading = true;
        state.error = null;
      })
      .addCase(fetchMovieKeywords.fulfilled, (state, action) => {
        state.keywordsLoading = false;
        state.movieKeywords = action.payload.data || action.payload;
      })
      .addCase(fetchMovieKeywords.rejected, (state, action) => {
        state.keywordsLoading = false;
        state.error = action.payload;
      });

    // Search movies
    builder
      .addCase(searchMovies.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.items || [];
        state.searchPagination = action.payload.pagination || {};
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
        state.searchResults = [];
      });
  },
});

export const { clearSelectedMovie, clearError, clearMovieImages, clearMoviePeoples, clearMovieKeywords, clearSearchResults } = movieSlice.actions;
export default movieSlice.reducer;
