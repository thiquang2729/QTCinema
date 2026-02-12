import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';

// Async thunk để lấy danh sách movies
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

const movieSlice = createSlice({
  name: 'movies',
  initialState: {
    movies: [],
    selectedMovie: null,
    movieImages: null,
    moviePeoples: null,
    movieKeywords: null,
    loading: false,
    imagesLoading: false,
    peoplesLoading: false,
    keywordsLoading: false,
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
  },
  extraReducers: (builder) => {
    // Fetch movies
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
  },
});

export const { clearSelectedMovie, clearError, clearMovieImages, clearMoviePeoples, clearMovieKeywords } = movieSlice.actions;
export default movieSlice.reducer;
