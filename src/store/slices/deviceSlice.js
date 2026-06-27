import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import deviceService from '../../services/deviceService';

// ════════════════════════════════════════
//  THUNKS
// ════════════════════════════════════════
export const fetchDevices = createAsyncThunk(
  'devices/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await deviceService.getAll();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDeviceById = createAsyncThunk(
  'devices/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await deviceService.getById(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addDevice = createAsyncThunk(
  'devices/add',
  async (deviceData, { rejectWithValue }) => {
    try {
      return await deviceService.add(deviceData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateDevice = createAsyncThunk(
  'devices/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await deviceService.update(id, data);
    } catch (error) {
      console.warn('Update failed, updating locally');
      return { ...data, id };
    }
  }
);

export const deleteDevice = createAsyncThunk(
  'devices/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deviceService.delete(id);
      return id;
    } catch (error) {
      console.warn('Server delete failed, removing locally:', error.message);
      return id;
    }
  }
);

export const fetchHistory = createAsyncThunk(
  'devices/fetchHistory',
  async (deviceId, { rejectWithValue }) => {
    try {
      return await deviceService.getHistory(deviceId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ════════════════════════════════════════
//  SLICE
// ════════════════════════════════════════
const deviceSlice = createSlice({
  name: 'devices',

  initialState: {
    list:           [],
    filteredList:   [],
    history:        [],
    selectedDevice: null,
    filter: {
      status: 'all',
      type:   'all',
      search: ''
    },
    stats: {
      total:   0,
      online:  0,
      idle:    0,
      offline: 0
    },
    loading:        false,
    historyLoading: false,
    error:          null
  },

  reducers: {
    setSelectedDevice: (state, action) => {
      state.selectedDevice = action.payload;
    },

    clearSelectedDevice: (state) => {
      state.selectedDevice = null;
    },

    setFilterStatus: (state, action) => {
      state.filter.status = action.payload;
      state.filteredList  = applyFilters(state.list, state.filter);
    },

    setFilterType: (state, action) => {
      state.filter.type  = action.payload;
      state.filteredList = applyFilters(state.list, state.filter);
    },

    setSearch: (state, action) => {
      state.filter.search = action.payload;
      state.filteredList  = applyFilters(state.list, state.filter);
    },

    updatePosition: (state, action) => {
      const { id, position, speed } = action.payload;
      const device = state.list.find(d => d.id === id);
      if (device) {
        device.position   = position;
        device.speed      = speed;
        device.lastUpdate = new Date().toISOString();
      }
    },

    // Suppression locale forcée
    removeDeviceLocal: (state, action) => {
      state.list = state.list.filter(d => d.id !== action.payload);
      state.filteredList = applyFilters(state.list, state.filter);
      state.stats = calcStats(state.list);
    },

    // Mise à jour locale forcée
    updateDeviceLocal: (state, action) => {
      const index = state.list.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = { ...state.list[index], ...action.payload };
      }
      state.filteredList = applyFilters(state.list, state.filter);
      state.stats = calcStats(state.list);
    },

    clearError: (state) => {
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder
      // FETCH ALL
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading      = false;
        state.list         = action.payload;
        state.filteredList = applyFilters(action.payload, state.filter);
        state.stats        = calcStats(action.payload);
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })

      // FETCH BY ID
      .addCase(fetchDeviceById.fulfilled, (state, action) => {
        state.selectedDevice = action.payload;
      })

      // ADD
      .addCase(addDevice.pending, (state) => {
        state.loading = true;
      })
      .addCase(addDevice.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
        state.filteredList = applyFilters(state.list, state.filter);
        state.stats = calcStats(state.list);
      })
      .addCase(addDevice.rejected, (state) => {
        state.loading = false;
      })

      // UPDATE
      .addCase(updateDevice.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDevice.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = { ...state.list[index], ...action.payload };
        }
        state.filteredList = applyFilters(state.list, state.filter);
        state.stats = calcStats(state.list);
      })
      .addCase(updateDevice.rejected, (state, action) => {
        state.loading = false;
        // Mise à jour locale en cas d'échec serveur
        const { id, data } = action.meta.arg;
        const index = state.list.findIndex(d => d.id === id);
        if (index !== -1) {
          state.list[index] = { ...state.list[index], ...data };
        }
        state.filteredList = applyFilters(state.list, state.filter);
        state.stats = calcStats(state.list);
      })

      // DELETE
      .addCase(deleteDevice.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(d => d.id !== action.payload);
        state.filteredList = applyFilters(state.list, state.filter);
        state.stats = calcStats(state.list);
      })
      .addCase(deleteDevice.rejected, (state, action) => {
        state.loading = false;
        // Suppression locale même en cas d'erreur
        const id = action.meta.arg;
        state.list = state.list.filter(d => d.id !== id);
        state.filteredList = applyFilters(state.list, state.filter);
        state.stats = calcStats(state.list);
      })

      // HISTORY
      .addCase(fetchHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history        = action.payload;
      })
      .addCase(fetchHistory.rejected, (state) => {
        state.historyLoading = false;
      });
  }
});

// ════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════
const applyFilters = (list, filter) => {
  return list.filter(device => {
    if (filter.status !== 'all' && device.status !== filter.status) return false;
    if (filter.type !== 'all' && device.type !== filter.type) return false;

    if (filter.search) {
      const query = filter.search.toLowerCase();
      return (
        device.name?.toLowerCase().includes(query) ||
        device.imei?.toLowerCase().includes(query) ||
        device.driver?.name?.toLowerCase().includes(query) ||
        (device.plateNumber && device.plateNumber.toLowerCase().includes(query))
      );
    }
    return true;
  });
};

const calcStats = (list) => ({
  total:   list.length,
  online:  list.filter(d => d.status === 'online').length,
  idle:    list.filter(d => d.status === 'idle').length,
  offline: list.filter(d => d.status === 'offline').length
});

// EXPORTS
export const {
  setSelectedDevice,
  clearSelectedDevice,
  setFilterStatus,
  setFilterType,
  setSearch,
  updatePosition,
  removeDeviceLocal,
  updateDeviceLocal,
  clearError
} = deviceSlice.actions;

export default deviceSlice.reducer;