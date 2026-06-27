import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import geofenceService from '../../services/geofenceService';

// ════════════════════════════════════════
//  THUNKS
// ════════════════════════════════════════

// Fetch All
export const fetchGeofences = createAsyncThunk(
   'geofences/fetchAll',
   async (_, { rejectWithValue }) => {
      try {
         return await geofenceService.getAll();
      } catch (error) {
         return rejectWithValue(error.message);
      }
   }
);

// Add Geofence
export const addGeofence = createAsyncThunk(
   'geofences/add',
   async (geofenceData, { rejectWithValue }) => {
      try {
         return await geofenceService.add(geofenceData);
      } catch (error) {
         return rejectWithValue(error.message);
      }
   }
);

// Update Geofence
export const updateGeofence = createAsyncThunk(
   'geofences/update',
   async ({ id, data }, { rejectWithValue }) => {
      try {
         return await geofenceService.update(id, data);
      } catch (error) {
         return rejectWithValue(error.message);
      }
   }
);

// Delete Geofence
export const deleteGeofence = createAsyncThunk(
   'geofences/delete',
   async (id, { rejectWithValue }) => {
      try {
         await geofenceService.delete(id);
         return id;
      } catch (error) {
         return rejectWithValue(error.message);
      }
   }
);

// Toggle Active
export const toggleGeofence = createAsyncThunk(
   'geofences/toggle',
   async ({ id, active }, { rejectWithValue }) => {
      try {
         return await geofenceService.toggleActive(id, active);
      } catch (error) {
         return rejectWithValue(error.message);
      }
   }
);

// ════════════════════════════════════════
//  SLICE
// ════════════════════════════════════════
const geofenceSlice = createSlice({
   name: 'geofences',

   initialState: {
      // List
      list: [],

      // Selected
      selectedGeofence: null,

      // Drawing mode
      isDrawing: false,
      drawingType: 'circle',

      // Stats
      stats: {
         total: 0,
         active: 0,
         inactive: 0
      },

      // State
      loading: false,
      error: null
   },

   reducers: {

      // Set Selected
      setSelectedGeofence: (state, action) => {
         state.selectedGeofence = action.payload;
      },

      // Clear Selected
      clearSelectedGeofence: (state) => {
         state.selectedGeofence = null;
      },

      // Set Drawing Mode
      setDrawing: (state, action) => {
         state.isDrawing = action.payload;
      },

      // Set Drawing Type
      setDrawingType: (state, action) => {
         state.drawingType = action.payload;
      },

      // Clear Error
      clearError: (state) => {
         state.error = null;
      }
   },

   extraReducers: (builder) => {
      builder

         // ── FETCH ALL ───────────────────
         .addCase(fetchGeofences.pending, (state) => {
            state.loading = true;
            state.error = null;
         })
         .addCase(fetchGeofences.fulfilled, (state, action) => {
            state.loading = false;
            state.list = action.payload;
            state.stats = calcStats(action.payload);
         })
         .addCase(fetchGeofences.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
         })

         // ── ADD ─────────────────────────
         .addCase(addGeofence.fulfilled, (state, action) => {
            state.list.push(action.payload);
            state.stats = calcStats(state.list);
         })

         // ── UPDATE ──────────────────────
         .addCase(updateGeofence.fulfilled, (state, action) => {
            const index = state.list.findIndex(
               g => g.id === action.payload.id
            );
            if (index !== -1) {
               state.list[index] = action.payload;
            }
            state.stats = calcStats(state.list);
         })

         // ── DELETE ──────────────────────
         .addCase(deleteGeofence.fulfilled, (state, action) => {
            state.list = state.list.filter(
               g => g.id !== action.payload
            );
            state.stats = calcStats(state.list);
         })

         // ── TOGGLE ──────────────────────
         .addCase(toggleGeofence.fulfilled, (state, action) => {
            const index = state.list.findIndex(
               g => g.id === action.payload.id
            );
            if (index !== -1) {
               state.list[index] = action.payload;
            }
            state.stats = calcStats(state.list);
         });
   }
});

// ════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════

// Calculate Stats
const calcStats = (list) => ({
   total: list.length,
   active: list.filter(g => g.active).length,
   inactive: list.filter(g => !g.active).length
});

// ════════════════════════════════════════
//  EXPORTS
// ════════════════════════════════════════
export const {
   setSelectedGeofence,
   clearSelectedGeofence,
   setDrawing,
   setDrawingType,
   clearError
} = geofenceSlice.actions;

export default geofenceSlice.reducer;