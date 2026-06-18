import { configureStore } from '@reduxjs/toolkit';
import { movieApi } from './services/movieApi';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    [movieApi.reducerPath]: movieApi.reducer,
    ui: uiReducer,
    // Thêm các reducers khác tại đây
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(movieApi.middleware),
});

export default store;
