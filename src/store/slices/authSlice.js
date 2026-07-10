import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// ── LOGIN ──
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

// ── REGISTER ──
export const register = createAsyncThunk(
  'auth/register',
  async ({ username, password, email }, { rejectWithValue }) => {
    try {
      const user = await authService.register({ username, password, email });
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ── SLICE ──
const authSlice = createSlice({
  name: 'auth',

  initialState: {
    user:            authService.getCurrentUser(),
    isAuthenticated: authService.isAuthenticated(),
    loading:         false,
    error:           null,
    successMessage:  null
  },

  reducers: {
    logout: (state) => {
      authService.logout();
      state.user            = null;
      state.isAuthenticated = false;
      state.error           = null;
      state.successMessage  = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.successMessage = null;
    }
  },

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error   = null;
        state.successMessage = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading         = false;
        state.user            = action.payload;
        state.isAuthenticated = true;
        state.error           = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading         = false;
        state.isAuthenticated = false;
        state.error           = action.payload;
      })

      // REGISTER
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error   = null;
        state.successMessage = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading         = false;
        state.user            = action.payload;
        state.isAuthenticated = true;
        state.error           = null;
        state.successMessage  = 'Compte créé avec succès !';
      })
      .addCase(register.rejected, (state, action) => {
        state.loading         = false;
        state.isAuthenticated = false;
        state.error           = action.payload;
      });
  }
});

export const { logout, clearError, clearSuccess } = authSlice.actions;
export default authSlice.reducer;