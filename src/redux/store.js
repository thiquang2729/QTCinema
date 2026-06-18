import { configureStore } from '@reduxjs/toolkit';
import { movieApi } from './services/movieApi';
import { userApi } from './services/userApi';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    [movieApi.reducerPath]: movieApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    ui: uiReducer,
    // Thêm các reducers khác tại đây
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(movieApi.middleware, userApi.middleware),
});

export default store;
