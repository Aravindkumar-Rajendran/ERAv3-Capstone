import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loading: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setUser, setLoading } = appSlice.actions;
export default appSlice.reducer; 