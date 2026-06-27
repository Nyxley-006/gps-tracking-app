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
  //  PROVINCES MADAGASCAR (zones intérieures)
  //  Lat/Lng au centre + rayon de la zone
  // ════════════════════════════════════════
  const madagascarProvinces = [
    {
      name: 'Antananarivo',
      lat: -18.8792,
      lng: 47.5079,
      radius: 0.15  // ~15 km autour
    },
    {
      name: 'Antsirabe',
      lat: -19.8659,
      lng: 47.0333,
      radius: 0.10
    },
    {
      name: 'Fianarantsoa',
      lat: -21.4545,
      lng: 47.0833,
      radius: 0.10
    },
    {
      name: 'Ambositra',
      lat: -20.5333,
      lng: 47.2500,
      radius: 0.08
    },
    {
      name: 'Ambatolampy',
      lat: -19.3833,
      lng: 47.4333,
      radius: 0.08
    },
    {
      name: 'Moramanga',
      lat: -18.9500,
      lng: 48.2333,
      radius: 0.10
    },
    {
      name: 'Ankazobe',
      lat: -18.3167,
      lng: 47.1167,
      radius: 0.08
    },
    {
      name: 'Manjakandriana',
      lat: -18.9167,
      lng: 47.8000,
      radius: 0.08
    },
    {
      name: 'Arivonimamo',
      lat: -19.0167,
      lng: 47.1833,
      radius: 0.08
    },
    {
      name: 'Anjozorobe',
      lat: -18.4000,
      lng: 47.8667,
      radius: 0.08
    },
    {
      name: 'Tsiroanomandidy',
      lat: -18.7667,
      lng: 46.0500,
      radius: 0.10
    },
    {
      name: 'Ihosy',
      lat: -22.4042,
      lng: 46.1250,
      radius: 0.10
    }
  ];

  // ════════════════════════════════════════
  //  GENERATEUR DE POSITION UNIQUE
  //  Dans une province (pas en bord de mer)
  // ════════════════════════════════════════
  const generateUniquePosition = async () => {
    const existingDevices = await api.get('/devices');
    const existingPositions = existingDevices.data.map(d => ({
      lat: d.position.lat,
      lng: d.position.lng
    }));

    let attempts = 0;
    let position;

    while (attempts < 50) {
      // Choisir une province aléatoire
      const province = madagascarProvinces[
        Math.floor(Math.random() * madagascarProvinces.length)
      ];

      // Position aléatoire DANS la province (cercle autour du centre)
      const angle    = Math.random() * 2 * Math.PI;
      const distance = Math.random() * province.radius;

      const candidateLat = province.lat + Math.cos(angle) * distance;
      const candidateLng = province.lng + Math.sin(angle) * distance;

      // Vérifier qu'aucun device n'est trop proche
      const tooClose = existingPositions.some(pos => {
        const dist = Math.sqrt(
          Math.pow(pos.lat - candidateLat, 2) +
          Math.pow(pos.lng - candidateLng, 2)
        );
        return dist < 0.01;
      });

      if (!tooClose) {
        position = {
          lat:     candidateLat,
          lng:     candidateLng,
          address: province.name,
          city:    province.name
        };
        break;
      }

      attempts++;
    }

    // Fallback
    if (!position) {
      const province = madagascarProvinces[
        Math.floor(Math.random() * madagascarProvinces.length)
      ];
      const angle    = Math.random() * 2 * Math.PI;
      const distance = Math.random() * province.radius;

      position = {
        lat:     province.lat + Math.cos(angle) * distance,
        lng:     province.lng + Math.sin(angle) * distance,
        address: province.name,
        city:    province.name
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
  const randomStatus   = generateRandomStatus();
  const randomSpeed    = generateSpeed(randomStatus);
  const randomBattery  = generateBattery(randomStatus);
  const randomFuel     = generateFuel(deviceData.type);
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
  
   update: async (id, deviceData) => {
  const response = await api.put(`/devices/${id}`, deviceData);
  return response.data;
},

   delete: async (id) => {
      const response = await api.delete(`/devices/${id}`);
      return response.data;
   },

};

export default deviceService;