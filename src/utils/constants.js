// ════════════════════════════════════════
//  API
// ════════════════════════════════════════
export const API_URL = 'http://localhost:3001';

// ════════════════════════════════════════
//  MAP
// ════════════════════════════════════════
export const MAP_CONFIG = {
  center: [-18.8792, 47.5079],  // ✅ Antananarivo, Madagascar
  zoom: 12,
  tile: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
};
// ════════════════════════════════════════
//  DEVICE STATUS
// ════════════════════════════════════════
export const STATUS = {
  ONLINE:  'online',
  OFFLINE: 'offline',
  IDLE:    'idle'
};

export const STATUS_COLORS = {
  online:  '#00ff41',
  idle:    '#ff6600',
  offline: '#ff003c'
};

export const STATUS_LABELS = {
  online:  'En ligne',
  idle:    'En arrêt',
  offline: 'Hors ligne'
};

// ════════════════════════════════════════
//  DEVICE TYPES
// ════════════════════════════════════════
export const DEVICE_TYPES = {
  truck:      { label: 'Camion',      icon: '🚛' },
  van:        { label: 'Fourgon',     icon: '🚐' },
  car:        { label: 'Voiture',     icon: '🚗' },
  motorcycle: { label: 'Moto',        icon: '🏍️' },
  bus:        { label: 'Bus',         icon: '🚌' },
  phone:      { label: 'Téléphone',   icon: '📱' },
  tablet:     { label: 'Tablette',    icon: '📟' },
  drone:      { label: 'Drone',       icon: '🛸' },
  boat:       { label: 'Bateau',      icon: '🚤' },
  bicycle:    { label: 'Vélo',        icon: '🚲' },
  person:     { label: 'Personne',    icon: '🧑' },
  pet:        { label: 'Animal',      icon: '🐕' },
  asset:      { label: 'Objet/Colis', icon: '📦' },
  other:      { label: 'Autre',       icon: '📍' }
};

export const DEVICE_TYPE_OPTIONS = [
  { value: 'truck',      icon: '🚛', label: '🚛 Camion'      },
  { value: 'van',        icon: '🚐', label: '🚐 Fourgon'     },
  { value: 'car',        icon: '🚗', label: '🚗 Voiture'     },
  { value: 'motorcycle', icon: '🏍️', label: '🏍️ Moto'       },
  { value: 'bus',        icon: '🚌', label: '🚌 Bus'         },
  { value: 'phone',      icon: '📱', label: '📱 Téléphone'   },
  { value: 'tablet',     icon: '📟', label: '📟 Tablette'    },
  { value: 'drone',      icon: '🛸', label: '🛸 Drone'       },
  { value: 'boat',       icon: '🚤', label: '🚤 Bateau'      },
  { value: 'bicycle',    icon: '🚲', label: '🚲 Vélo'        },
  { value: 'person',     icon: '🧑', label: '🧑 Personne'    },
  { value: 'pet',        icon: '🐕', label: '🐕 Animal'      },
  { value: 'asset',      icon: '📦', label: '📦 Objet/Colis' },
  { value: 'other',      icon: '📍', label: '📍 Autre'       }
];

// ════════════════════════════════════════
//  ALERTS
// ════════════════════════════════════════
export const ALERT_TYPES = {
  speeding:    { label: 'Excès de vitesse', color: '#ff003c' },
  lowBattery:  { label: 'Batterie faible',  color: '#ff6600' },
  geofence:    { label: 'Zone',             color: '#00ffff' },
  ignition:    { label: 'Moteur',           color: '#00ff41' },
  sos:         { label: 'SOS Urgence',      color: '#ff003c' },
  disconnect:  { label: 'Déconnexion',      color: '#ff003c' },
  lowFuel:     { label: 'Carburant faible', color: '#ff6600' },
  maintenance: { label: 'Maintenance',      color: '#00ffff' }
};

export const SEVERITY_COLORS = {
  danger:  '#ff003c',
  warning: '#ff6600',
  info:    '#00ffff',
  success: '#00ff41'
};

// ════════════════════════════════════════
//  NEW DEVICE DEFAULT
// ════════════════════════════════════════
export const DEFAULT_DEVICE = {
  name:          '',
  imei:          '',
  type:          'car',
  status:        'offline',
  speed:         0,
  battery:       100,
  fuel:          100,
  position:      { lat: 36.7538, lng: 3.0588, address: '' },
  driver:        { name: '', phone: '' },
  plateNumber:   '',
  totalDistance: 0,
  lastUpdate:    null
};

// ════════════════════════════════════════
//  APP
// ════════════════════════════════════════
export const REFRESH_INTERVAL = 5000;

