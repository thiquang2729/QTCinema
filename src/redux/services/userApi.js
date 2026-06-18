import { createApi } from '@reduxjs/toolkit/query/react';
import axiosInstance from '../../services/axiosInstance';

// Custom baseQuery sử dụng axiosInstance của hệ thống để đồng bộ Authorization Header & Global Loading
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
        hideLoader,
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

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery({ baseUrl: '/users' }),
  tagTypes: ['WatchHistory', 'Watchlist'],
  endpoints: (builder) => ({
    // Lấy toàn bộ lịch sử xem phim
    getWatchHistory: builder.query({
      query: () => ({ url: '/history', method: 'GET' }),
      providesTags: ['WatchHistory'],
    }),

    // Lấy lịch sử xem của một bộ phim cụ thể
    getWatchHistoryForMovie: builder.query({
      query: (movieSlug) => ({ url: `/history/${movieSlug}`, method: 'GET' }),
      providesTags: (result, error, movieSlug) => [{ type: 'WatchHistory', id: movieSlug }],
    }),

    // Lưu hoặc cập nhật lịch sử xem
    saveWatchHistory: builder.mutation({
      query: (data) => ({
        url: '/history',
        method: 'POST',
        data,
      }),
      invalidatesTags: (result, error, arg) => [
        'WatchHistory',
        { type: 'WatchHistory', id: arg.movieSlug },
      ],
    }),

    // Xóa lịch sử xem phim
    deleteWatchHistory: builder.mutation({
      query: (movieSlug) => ({
        url: `/history/${movieSlug}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, movieSlug) => [
        'WatchHistory',
        { type: 'WatchHistory', id: movieSlug },
      ],
    }),

    // Lấy toàn bộ danh sách Watchlist
    getWatchlist: builder.query({
      query: () => ({ url: '/watchlist', method: 'GET' }),
      providesTags: ['Watchlist'],
    }),

    // Kiểm tra xem phim đã yêu thích chưa
    checkWatchlist: builder.query({
      query: (movieSlug) => ({ url: `/watchlist/${movieSlug}`, method: 'GET' }),
      providesTags: (result, error, movieSlug) => [{ type: 'Watchlist', id: movieSlug }],
    }),

    // Thêm phim vào danh sách yêu thích
    addToWatchlist: builder.mutation({
      query: (data) => ({
        url: '/watchlist',
        method: 'POST',
        data,
      }),
      invalidatesTags: (result, error, arg) => [
        'Watchlist',
        { type: 'Watchlist', id: arg.movieSlug },
      ],
    }),

    // Xóa phim khỏi danh sách yêu thích
    removeFromWatchlist: builder.mutation({
      query: (movieSlug) => ({
        url: `/watchlist/${movieSlug}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, movieSlug) => [
        'Watchlist',
        { type: 'Watchlist', id: movieSlug },
      ],
    }),
  }),
});

export const {
  useGetWatchHistoryQuery,
  useGetWatchHistoryForMovieQuery,
  useSaveWatchHistoryMutation,
  useDeleteWatchHistoryMutation,
  useGetWatchlistQuery,
  useCheckWatchlistQuery,
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
} = userApi;
