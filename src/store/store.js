import { configureStore } from '@reduxjs/toolkit';
import authReducer     from './slices/authSlice';
import deviceReducer   from './slices/deviceSlice';
import alertReducer    from './slices/alertSlice';
import uiReducer       from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth:      authReducer,
    devices:   deviceReducer,
    alerts:    alertReducer,
    ui:        uiReducer
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }),

  devTools: process.env.NODE_ENV !== 'production'
});

export default store;