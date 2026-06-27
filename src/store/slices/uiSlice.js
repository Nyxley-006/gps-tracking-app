import { createSlice } from '@reduxjs/toolkit';

// ════════════════════════════════════════
//  SLICE
// ════════════════════════════════════════
const uiSlice = createSlice({
   name: 'ui',

   initialState: {

      // Sidebar
      sidebarOpen: true,
      sidebarCollapsed: false,

      // Active Page
      activePage: 'dashboard',

      // Map
      map: {
         center: [36.7538, 3.0588],
         zoom: 12,
         showTraffic: false,
         showGeofence: true,
         showLabels: true
      },

      // Selected
      selectedDeviceId: null,
      selectedGeofenceId: null,

      // Modals
      modals: {
         addDevice: false,
         editDevice: false,
         deleteDevice: false,
         addGeofence: false,
         deviceDetails: false
      },

      // Notifications
      notifications: [],

      // Theme
      theme: 'hacker',

      // Loading
      globalLoading: false
   },

   reducers: {

      // ── SIDEBAR ─────────────────────
      toggleSidebar: (state) => {
         state.sidebarOpen = !state.sidebarOpen;
      },

      toggleCollapse: (state) => {
         state.sidebarCollapsed = !state.sidebarCollapsed;
      },

      // ── ACTIVE PAGE ─────────────────
      setActivePage: (state, action) => {
         state.activePage = action.payload;
      },

      // ── MAP ─────────────────────────
      setMapCenter: (state, action) => {
         state.map.center = action.payload;
      },

      setMapZoom: (state, action) => {
         state.map.zoom = action.payload;
      },

      toggleTraffic: (state) => {
         state.map.showTraffic = !state.map.showTraffic;
      },

      toggleGeofenceLayer: (state) => {
         state.map.showGeofence = !state.map.showGeofence;
      },

      toggleLabels: (state) => {
         state.map.showLabels = !state.map.showLabels;
      },

      // ── SELECTED ────────────────────
      setSelectedDeviceId: (state, action) => {
         state.selectedDeviceId = action.payload;
      },

      clearSelectedDeviceId: (state) => {
         state.selectedDeviceId = null;
      },

      setSelectedGeofenceId: (state, action) => {
         state.selectedGeofenceId = action.payload;
      },

      clearSelectedGeofenceId: (state) => {
         state.selectedGeofenceId = null;
      },

      // ── MODALS ──────────────────────
      openModal: (state, action) => {
         state.modals[action.payload] = true;
      },

      closeModal: (state, action) => {
         state.modals[action.payload] = false;
      },

      closeAllModals: (state) => {
         Object.keys(state.modals).forEach(
            key => (state.modals[key] = false)
         );
      },

      // ── NOTIFICATIONS ───────────────
      addNotification: (state, action) => {
         state.notifications.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...action.payload
         });
         // Max 10 notifications
         if (state.notifications.length > 10) {
            state.notifications.pop();
         }
      },

      removeNotification: (state, action) => {
         state.notifications = state.notifications.filter(
            n => n.id !== action.payload
         );
      },

      clearNotifications: (state) => {
         state.notifications = [];
      },

      // ── GLOBAL LOADING ───────────────
      setGlobalLoading: (state, action) => {
         state.globalLoading = action.payload;
      }
   }
});

// ════════════════════════════════════════
//  EXPORTS
// ════════════════════════════════════════
export const {
   toggleSidebar,
   toggleCollapse,
   setActivePage,
   setMapCenter,
   setMapZoom,
   toggleTraffic,
   toggleGeofenceLayer,
   toggleLabels,
   setSelectedDeviceId,
   clearSelectedDeviceId,
   setSelectedGeofenceId,
   clearSelectedGeofenceId,
   openModal,
   closeModal,
   closeAllModals,
   addNotification,
   removeNotification,
   clearNotifications,
   setGlobalLoading
} = uiSlice.actions;

export default uiSlice.reducer;