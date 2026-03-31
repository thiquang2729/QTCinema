import { configureStore } from '@reduxjs/toolkit';
import movieReducer from './slices/movieSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    movies: movieReducer,
    ui: uiReducer,
    // Thêm các reducers khác tại đây
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
