import {
   STATUS_COLORS,
   STATUS_LABELS,
   DEVICE_TYPES,
   SEVERITY_COLORS
} from './constants';

// ════════════════════════════════════════
//  STATUS
// ════════════════════════════════════════
export const getStatusColor = (status) =>
   STATUS_COLORS[status] || '#666666';

export const getStatusLabel = (status) =>
   STATUS_LABELS[status] || 'Inconnu';

// ════════════════════════════════════════
//  DEVICE
// ════════════════════════════════════════
export const getDeviceIcon = (type) =>
   DEVICE_TYPES[type]?.icon || '📍';

export const getDeviceLabel = (type) =>
   DEVICE_TYPES[type]?.label || 'Autre';

// ════════════════════════════════════════
//  COLORS
// ════════════════════════════════════════
export const getSeverityColor = (severity) =>
   SEVERITY_COLORS[severity] || '#666666';

export const getBatteryColor = (level) => {
   if (level > 60) return '#00ff41';
   if (level > 30) return '#ff6600';
   return '#ff003c';
};

export const getFuelColor = (level) => {
   if (level > 50) return '#00ff41';
   if (level > 25) return '#ff6600';
   return '#ff003c';
};

export const getSpeedColor = (speed) => {
   if (speed === 0) return '#666666';
   if (speed < 60) return '#00ff41';
   if (speed < 100) return '#ff6600';
   return '#ff003c';
};

// ════════════════════════════════════════
//  DATE & TIME
// ════════════════════════════════════════
export const formatDate = (dateStr) => {
   if (!dateStr) return '--';
   return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
   });
};

export const formatTime = (dateStr) => {
   if (!dateStr) return '--';
   return new Date(dateStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
   });
};

export const timeAgo = (dateStr) => {
   if (!dateStr) return '--';
   const diff = Date.now() - new Date(dateStr).getTime();
   const secs = Math.floor(diff / 1000);
   const mins = Math.floor(diff / 60000);
   const hours = Math.floor(mins / 60);
   const days = Math.floor(hours / 24);

   if (secs < 60) return `Il y a ${secs}s`;
   if (mins < 60) return `Il y a ${mins}min`;
   if (hours < 24) return `Il y a ${hours}h`;
   return `Il y a ${days}j`;
};

// ════════════════════════════════════════
//  NUMBERS & UNITS
// ════════════════════════════════════════
export const formatSpeed = (speed) =>
   `${speed || 0} km/h`;

export const formatDistance = (km) => {
   if (!km) return '0 km';
   if (km >= 1000) return `${(km / 1000).toFixed(1)} Mm`;
   return `${km} km`;
};

export const formatDuration = (minutes) => {
   if (!minutes) return '0 min';
   const h = Math.floor(minutes / 60);
   const m = minutes % 60;
   return h > 0 ? `${h}h ${m}min` : `${m}min`;
};

export const formatBattery = (level) =>
   `${level || 0}%`;

export const formatFuel = (level) =>
   `${level || 0}%`;

// ════════════════════════════════════════
//  COORDINATES
// ════════════════════════════════════════
export const formatCoords = (lat, lng) => {
   if (!lat || !lng) return '--';
   return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
   const R = 6371;
   const dLat = ((lat2 - lat1) * Math.PI) / 180;
   const dLon = ((lon2 - lon1) * Math.PI) / 180;
   const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ════════════════════════════════════════
//  VALIDATION
// ════════════════════════════════════════
export const isValidIMEI = (imei) =>
   /^\d{15}$/.test(imei);

export const isValidPhone = (phone) =>
   /^(05|06|07)\d{8}$/.test(phone);