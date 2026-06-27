import api from './api';

// ════════════════════════════════════════
//  DEVICE SERVICE
// ════════════════════════════════════════
const deviceService = {

   // ── GET ALL ──────────────────────────
   getAll: async () => {
      const response = await api.get('/devices');
      return response.data;
   },

   // ── GET BY ID ────────────────────────
   getById: async (id) => {
      const response = await api.get(`/devices/${id}`);
      return response.data;
   },

   // ── ADD ──────────────────────────────
   add: async (deviceData) => {
  // ════════════════════════════════════════
  //  VILLES MADAGASCAR
  // ════════════════════════════════════════
  const madagascarCities = [
    { name: 'Antananarivo', lat: -18.8792, lng: 47.5079 },
    { name: 'Toamasina',    lat: -18.1492, lng: 49.4023 },
    { name: 'Antsirabe',    lat: -19.8659, lng: 47.0333 },
    { name: 'Fianarantsoa', lat: -21.4545, lng: 47.0833 },
    { name: 'Mahajanga',    lat: -15.7167, lng: 46.3167 },
    { name: 'Toliara',      lat: -23.3500, lng: 43.6667 },
    { name: 'Antsiranana',  lat: -12.2787, lng: 49.2917 },
    { name: 'Morondava',    lat: -20.2833, lng: 44.2833 },
    { name: 'Manakara',     lat: -22.1500, lng: 48.0167 },
    { name: 'Sambava',      lat: -14.2667, lng: 50.1667 },
    { name: 'Nosy Be',      lat: -13.3333, lng: 48.2667 },
    { name: 'Ambositra',    lat: -20.5333, lng: 47.2500 }
  ];

  // ════════════════════════════════════════
  //  GENERATEUR DE POSITION UNIQUE
  // ════════════════════════════════════════
  const generateUniquePosition = async () => {
    // Récupérer toutes les positions existantes
    const existingDevices = await api.get('/devices');
    const existingPositions = existingDevices.data.map(d => ({
      lat: d.position.lat,
      lng: d.position.lng
    }));

    let attempts = 0;
    let position;

    while (attempts < 50) {
      // Choisir une ville aléatoire
      const city = madagascarCities[
        Math.floor(Math.random() * madagascarCities.length)
      ];

      // Décalage aléatoire autour de la ville
      // Plus grand pour éviter les collisions
      const offsetLat = (Math.random() - 0.5) * 0.15; // ±0.075°
      const offsetLng = (Math.random() - 0.5) * 0.15;

      const candidateLat = city.lat + offsetLat;
      const candidateLng = city.lng + offsetLng;

      // Vérifier qu'aucun device n'est trop proche (min 0.01°)
      const tooClose = existingPositions.some(pos => {
        const distance = Math.sqrt(
          Math.pow(pos.lat - candidateLat, 2) +
          Math.pow(pos.lng - candidateLng, 2)
        );
        return distance < 0.01;
      });

      if (!tooClose) {
        position = {
          lat:     candidateLat,
          lng:     candidateLng,
          address: city.name,
          city:    city.name
        };
        break;
      }

      attempts++;
    }

    // Fallback si toutes les tentatives échouent
    if (!position) {
      const city = madagascarCities[
        Math.floor(Math.random() * madagascarCities.length)
      ];
      position = {
        lat:     city.lat + (Math.random() - 0.5) * 0.3,
        lng:     city.lng + (Math.random() - 0.5) * 0.3,
        address: city.name,
        city:    city.name
      };
    }

    return position;
  };

  // ════════════════════════════════════════
  //  STATUS ALÉATOIRE
  // ════════════════════════════════════════
  const generateRandomStatus = () => {
    const rand = Math.random();
    if (rand < 0.60) return 'online';
    if (rand < 0.85) return 'idle';
    return 'offline';
  };

  // ════════════════════════════════════════
  //  VITESSE SELON STATUS
  // ════════════════════════════════════════
  const generateSpeed = (status) => {
    if (status !== 'online') return 0;
    return Math.floor(Math.random() * 40) + 10;
  };

  // ════════════════════════════════════════
  //  BATTERIE SELON STATUS
  // ════════════════════════════════════════
  const generateBattery = (status) => {
    if (status === 'offline') return Math.floor(Math.random() * 30) + 5;
    if (status === 'idle')    return Math.floor(Math.random() * 40) + 40;
    return Math.floor(Math.random() * 40) + 60;
  };

  // ════════════════════════════════════════
  //  CARBURANT SELON TYPE
  // ════════════════════════════════════════
  const generateFuel = (type) => {
    const noFuelTypes = ['phone', 'tablet', 'drone', 'person', 'pet', 'asset'];
    if (noFuelTypes.includes(type)) return null;
    return Math.floor(Math.random() * 80) + 20;
  };

  // ════════════════════════════════════════
  //  CONSTRUCTION DU DEVICE
  // ════════════════════════════════════════
  const randomStatus  = generateRandomStatus();
  const randomSpeed   = generateSpeed(randomStatus);
  const randomBattery = generateBattery(randomStatus);
  const randomFuel    = generateFuel(deviceData.type);
  const uniquePosition = await generateUniquePosition();

  const newDevice = {
    ...deviceData,
    status:        randomStatus,
    speed:         randomSpeed,
    battery:       randomBattery,
    fuel:          randomFuel,
    lastUpdate:    new Date().toISOString(),
    totalDistance: Math.floor(Math.random() * 1000),
    position:      uniquePosition
  };

  const response = await api.post('/devices', newDevice);
  return response.data;
},

   // ── GET POSITIONS ────────────────────
   getPositions: async (deviceId) => {
      const response = await api.get(
         `/positions?deviceId=${deviceId}`
      );
      return response.data;
   },

   // ── UPDATE POSITION ──────────────────
   updatePosition: async (deviceId, position) => {
      const response = await api.patch(
         `/devices/${deviceId}`,
         {
            position: position,
            lastUpdate: new Date().toISOString()
         }
      );
      return response.data;
   },

   // ── FILTER BY STATUS ─────────────────
   getByStatus: async (status) => {
      const response = await api.get(
         `/devices?status=${status}`
      );
      return response.data;
   },

   // ── FILTER BY TYPE ───────────────────
   getByType: async (type) => {
      const response = await api.get(
         `/devices?type=${type}`
      );
      return response.data;
   },

   // ── SEARCH ───────────────────────────
   search: async (query) => {
      const response = await api.get(
         `/devices?name_like=${query}`
      );
      return response.data;
   },

   // ── GET STATS ────────────────────────
   getStats: async () => {
      const response = await api.get('/devices');
      const devices = response.data;

      return {
         total: devices.length,
         online: devices.filter(d => d.status === 'online').length,
         idle: devices.filter(d => d.status === 'idle').length,
         offline: devices.filter(d => d.status === 'offline').length
      };
   },

   delete: async (id) => {
      const response = await api.delete(`/devices/${id}`);
      return response.data;
   },

};

export default deviceService;