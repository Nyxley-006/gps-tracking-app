import api from './api';

// ════════════════════════════════════════
//  GEOFENCE SERVICE
// ════════════════════════════════════════
const geofenceService = {

   // ── GET ALL ──────────────────────────
   getAll: async () => {
      const response = await api.get('/geofences');
      return response.data;
   },

   // ── GET BY ID ────────────────────────
   getById: async (id) => {
      const response = await api.get(`/geofences/${id}`);
      return response.data;
   },

   // ── GET ACTIVE ───────────────────────
   getActive: async () => {
      const response = await api.get('/geofences?active=true');
      return response.data;
   },

   // ── ADD ──────────────────────────────
   add: async (geofenceData) => {
      const newGeofence = {
         ...geofenceData,
         active: true,
         createdAt: new Date().toISOString()
      };
      const response = await api.post('/geofences', newGeofence);
      return response.data;
   },

   // ── UPDATE ───────────────────────────
   update: async (id, geofenceData) => {
      const response = await api.put(
         `/geofences/${id}`,
         geofenceData
      );
      return response.data;
   },

   // ── DELETE ───────────────────────────
   delete: async (id) => {
      const response = await api.delete(`/geofences/${id}`);
      return response.data;
   },

   // ── TOGGLE ACTIVE ────────────────────
   toggleActive: async (id, currentState) => {
      const response = await api.patch(
         `/geofences/${id}`,
         { active: !currentState }
      );
      return response.data;
   },

   // ── CHECK DEVICE IN ZONE ─────────────
   isDeviceInZone: (devicePosition, geofence) => {
      if (geofence.type === 'circle') {
         const R = 6371000; // rayon terre en metres
         const lat1 = devicePosition.lat * Math.PI / 180;
         const lat2 = geofence.center.lat * Math.PI / 180;
         const dLat = (geofence.center.lat - devicePosition.lat)
            * Math.PI / 180;
         const dLng = (geofence.center.lng - devicePosition.lng)
            * Math.PI / 180;

         const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

         const distance = R * 2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
         );

         return distance <= geofence.radius;
      }
      return false;
   },

   // ── GET STATS ────────────────────────
   getStats: async () => {
      const response = await api.get('/geofences');
      const geofences = response.data;

      return {
         total: geofences.length,
         active: geofences.filter(g => g.active).length,
         inactive: geofences.filter(g => !g.active).length
      };
   }

};

export default geofenceService;