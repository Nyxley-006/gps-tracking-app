import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import deviceReducer from './slices/deviceSlice';
import alertReducer from './slices/alertSlice';
import geofenceReducer from './slices/geofenceSlice';
import uiReducer from './slices/uiSlice';

// ════════════════════════════════════════
//  STORE
// ════════════════════════════════════════
export const store = configureStore({
   reducer: {
      auth: authReducer,
      devices: deviceReducer,
      alerts: alertReducer,
      geofences: geofenceReducer,
      ui: uiReducer
   },

   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         serializableCheck: false
      }),

   devTools: process.env.NODE_ENV !== 'production'
});

export default store;