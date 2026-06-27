import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import alertService from '../../services/alertService';

// THUNKS
export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await alertService.getAll();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUnread = createAsyncThunk(
  'alerts/fetchUnread',
  async (_, { rejectWithValue }) => {
    try {
      return await alertService.getUnread();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'alerts/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      return await alertService.markAsRead(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'alerts/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await alertService.markAllAsRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addAlert = createAsyncThunk(
  'alerts/add',
  async (alertData, { rejectWithValue }) => {
    try {
      return await alertService.add(alertData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAlert = createAsyncThunk(
  'alerts/delete',
  async (id, { rejectWithValue }) => {
    try {
      await alertService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAllRead = createAsyncThunk(
  'alerts/deleteAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await alertService.deleteAllRead();
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// SLICE
const alertSlice = createSlice({
  name: 'alerts',

  initialState: {
    list:         [],
    filteredList: [],
    filter: {
      severity: 'all',
      read:     'all'
    },
    stats: {
      total:   0,
      unread:  0,
      danger:  0,
      warning: 0,
      info:    0
    },
    loading: false,
    error:   null
  },

  reducers: {

    setFilterSeverity: (state, action) => {
      state.filter.severity = action.payload;
      state.filteredList    = applyFilters(state.list, state.filter);
    },

    setFilterRead: (state, action) => {
      state.filter.read  = action.payload;
      state.filteredList = applyFilters(state.list, state.filter);
    },

    addAlertLocal: (state, action) => {
      state.list.unshift(action.payload);
      state.filteredList = applyFilters(state.list, state.filter);
      state.stats = calcStats(state.list);
    },

    // ✅ MARQUE LOCALEMENT - Pour alertes générées par socket
    markAsReadLocal: (state, action) => {
      const alert = state.list.find(a => a.id === action.payload);
      if (alert) {
        alert.read = true;
      }
      state.filteredList = applyFilters(state.list, state.filter);
      state.stats = calcStats(state.list);
    },

    // ✅ SUPPRIMER LOCALEMENT
    deleteAlertLocal: (state, action) => {
      state.list = state.list.filter(a => a.id !== action.payload);
      state.filteredList = applyFilters(state.list, state.filter);
      state.stats = calcStats(state.list);
    },

    clearError: (state) => {
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        // ✅ Garder les alertes locales (ajoutées par socket)
        const serverAlerts = action.payload;
        const localAlerts  = state.list.filter(a =>
          !serverAlerts.find(sa => sa.id === a.id)
        );
        state.loading      = false;
        state.list         = [...localAlerts, ...serverAlerts];
        state.filteredList = applyFilters(state.list, state.filter);
        state.stats        = calcStats(state.list);
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      .addCase(markAsRead.fulfilled, (state, action) => {
        const alert = state.list.find(a => a.id === action.payload.id);
        if (alert) alert.read = true;
        state.filteredList = applyFilters(state.list, state.filter);
        state.stats = calcStats(state.list);
      })
      .addCase(markAsRead.rejected, () => {
        // Ignore - alerte locale probablement
      })

      .addCase(markAllAsRead.fulfilled, (state) => {
        state.list.forEach(a => (a.read = true));
        state.filteredList = applyFilters(state.list, state.filter);
        state.stats = calcStats(state.list);
      })

      .addCase(addAlert.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.filteredList = applyFilters(state.list, state.filter);
        state.stats = calcStats(state.list);
      })

      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.list = state.list.filter(a => a.id !== action.payload);
        state.filteredList = applyFilters(state.list, state.filter);
        state.stats = calcStats(state.list);
      })
      .addCase(deleteAlert.rejected, (state, action) => {
        // Si le delete serveur échoue, on supprime quand même en local
        const id = action.meta.arg;
        state.list = state.list.filter(a => a.id !== id);
        state.filteredList = applyFilters(state.list, state.filter);
        state.stats = calcStats(state.list);
      })

      .addCase(deleteAllRead.fulfilled, (state) => {
        state.list = state.list.filter(a => !a.read);
        state.filteredList = applyFilters(state.list, state.filter);
        state.stats = calcStats(state.list);
      });
  }
});

// HELPERS
const applyFilters = (list, filter) => {
  return list.filter(alert => {
    if (filter.severity !== 'all' && alert.severity !== filter.severity) return false;
    if (filter.read === 'read'   &&  alert.read) return true;
    if (filter.read === 'unread' && !alert.read) return true;
    if (filter.read === 'all') return true;
    if (filter.read !== 'all') return false;
    return true;
  });
};

const calcStats = (list) => ({
  total:   list.length,
  unread:  list.filter(a => !a.read).length,
  danger:  list.filter(a => a.severity === 'danger').length,
  warning: list.filter(a => a.severity === 'warning').length,
  info:    list.filter(a => a.severity === 'info').length
});

// EXPORTS
export const {
  setFilterSeverity,
  setFilterRead,
  addAlertLocal,
  markAsReadLocal,
  deleteAlertLocal,
  clearError
} = alertSlice.actions;

export default alertSlice.reducer;