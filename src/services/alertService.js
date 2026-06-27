import api from './api';

// ════════════════════════════════════════
//  ALERT SERVICE
// ════════════════════════════════════════
const alertService = {

   // ── GET ALL ──────────────────────────
   getAll: async () => {
      const response = await api.get('/alerts');
      return response.data;
   },

   // ── GET BY ID ────────────────────────
   getById: async (id) => {
      const response = await api.get(`/alerts/${id}`);
      return response.data;
   },

   // ── GET UNREAD ───────────────────────
   getUnread: async () => {
      const response = await api.get('/alerts?read=false');
      return response.data;
   },

   // ── GET BY DEVICE ────────────────────
   getByDevice: async (deviceId) => {
      const response = await api.get(
         `/alerts?deviceId=${deviceId}`
      );
      return response.data;
   },

   // ── GET BY SEVERITY ──────────────────
   getBySeverity: async (severity) => {
      const response = await api.get(
         `/alerts?severity=${severity}`
      );
      return response.data;
   },

   // ── MARK AS READ ─────────────────────
   markAsRead: async (id) => {
      const response = await api.patch(
         `/alerts/${id}`,
         { read: true }
      );
      return response.data;
   },

   // ── MARK ALL AS READ ─────────────────
   markAllAsRead: async () => {
      const unread = await alertService.getUnread();
      const promises = unread.map((alert) =>
         api.patch(`/alerts/${alert.id}`, { read: true })
      );
      await Promise.all(promises);
      return true;
   },

   // ── ADD ALERT ────────────────────────
   add: async (alertData) => {
      const newAlert = {
         ...alertData,
         read: false,
         timestamp: new Date().toISOString()
      };
      const response = await api.post('/alerts', newAlert);
      return response.data;
   },

   // ── DELETE ───────────────────────────
   delete: async (id) => {
      const response = await api.delete(`/alerts/${id}`);
      return response.data;
   },

   // ── DELETE ALL READ ──────────────────
   deleteAllRead: async () => {
      const response = await api.get('/alerts?read=true');
      const read = response.data;
      const promises = read.map((alert) =>
         api.delete(`/alerts/${alert.id}`)
      );
      await Promise.all(promises);
      return true;
   },

   // ── GET STATS ────────────────────────
   getStats: async () => {
      const response = await api.get('/alerts');
      const alerts = response.data;

      return {
         total: alerts.length,
         unread: alerts.filter(a => !a.read).length,
         danger: alerts.filter(a => a.severity === 'danger').length,
         warning: alerts.filter(a => a.severity === 'warning').length,
         info: alerts.filter(a => a.severity === 'info').length
      };
   }

};

export default alertService;