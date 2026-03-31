import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeRequests: 0,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    startRequest: (state) => {
      state.activeRequests += 1;
    },
    endRequest: (state) => {
      state.activeRequests = Math.max(0, state.activeRequests - 1);
    },
  },
});

export const { startRequest, endRequest } = uiSlice.actions;
export default uiSlice.reducer;
