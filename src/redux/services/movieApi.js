import { createApi } from '@reduxjs/toolkit/query/react';
import axiosInstance from '../../services/axiosInstance';

// Custom baseQuery sử dụng axiosInstance hiện tại của hệ thống để tận dụng interceptors
const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method, data, params, headers, hideLoader = true }) => {
    try {
      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
        hideLoader, // Mặc định ẩn GlobalLoading để tránh gián đoạn UX khi chuyển trang
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export const movieApi = createApi({
  reducerPath: 'movieApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Movie', 'List'],
  endpoints: (builder) => ({
    // Lấy danh sách phim trang chủ (Phim mới cập nhật)
    getHomeMovies: builder.query({
      query: () => ({ url: '/movies', method: 'GET' }),
    }),
    
    // Lấy danh sách phim theo slug danh sách (phim-bo, phim-le, hoat-hinh, ...)
    getMoviesByList: builder.query({
      query: ({ slug, params = {} }) => ({
        url: `/movies/list/${slug}`,
        method: 'GET',
        params,
      }),
    }),
    
    // Lấy danh sách phim theo quốc gia
    getMoviesByCountry: builder.query({
      query: ({ slug, params = {} }) => ({
        url: `/movies/country/${slug}`,
        method: 'GET',
        params,
      }),
    }),
    
    // Lấy thông tin chi tiết phim
    getMovieById: builder.query({
      query: (slug) => ({ url: `/movies/${slug}`, method: 'GET' }),
    }),
    
    // Lấy hình ảnh phim
    getMovieImages: builder.query({
      query: (slug) => ({ url: `/movies/${slug}/images`, method: 'GET' }),
    }),
    
    // Lấy thông tin diễn viên/đạo diễn
    getMoviePeoples: builder.query({
      query: (slug) => ({ url: `/movies/${slug}/peoples`, method: 'GET' }),
    }),
    
    // Lấy từ khóa phim
    getMovieKeywords: builder.query({
      query: (slug) => ({ url: `/movies/${slug}/keywords`, method: 'GET' }),
    }),
    
    // Tìm kiếm phim
    searchMovies: builder.query({
      query: ({ keyword, params = {} }) => ({
        url: `/movies/search/${encodeURIComponent(keyword)}`,
        method: 'GET',
        params,
      }),
    }),
    
    // Lấy danh sách quốc gia
    getCountries: builder.query({
      query: () => ({ url: '/movies/countries', method: 'GET' }),
    }),
  }),
});

export const {
  useGetHomeMoviesQuery,
  useGetMoviesByListQuery,
  useGetMoviesByCountryQuery,
  useGetMovieByIdQuery,
  useGetMovieImagesQuery,
  useGetMoviePeoplesQuery,
  useGetMovieKeywordsQuery,
  useSearchMoviesQuery,
  useGetCountriesQuery,
} = movieApi;
