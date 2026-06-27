import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// ════════════════════════════════════════
//  THUNKS
// ════════════════════════════════════════

// Login
export const login = createAsyncThunk(
   'auth/login',
   async ({ username, password }, { rejectWithValue }) => {
      try {
         const user = await authService.login(username, password);
         return user;
      } catch (error) {
         return rejectWithValue(error.message);
      }
   }
);

// ════════════════════════════════════════
//  SLICE
// ════════════════════════════════════════
const authSlice = createSlice({
   name: 'auth',

   initialState: {
      user: authService.getCurrentUser(),
      isAuthenticated: authService.isAuthenticated(),
      loading: false,
      error: null
   },

   reducers: {

      // Logout
      logout: (state) => {
         authService.logout();
         state.user = null;
         state.isAuthenticated = false;
         state.error = null;
      },

      // Clear error
      clearError: (state) => {
         state.error = null;
      }

   },

   extraReducers: (builder) => {
      builder

         // ── LOGIN PENDING ───────────────
         .addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
         })

         // ── LOGIN SUCCESS ───────────────
         .addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.user = action.payload;
            state.isAuthenticated = true;
            state.error = null;
         })

         // ── LOGIN FAILED ────────────────
         .addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.error = action.payload;
         });
   }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;