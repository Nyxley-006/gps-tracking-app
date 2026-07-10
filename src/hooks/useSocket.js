import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePosition } from '../store/slices/deviceSlice';
import { addAlertLocal } from '../store/slices/alertSlice';
import { addNotification } from '../store/slices/uiSlice';

// ════════════════════════════════════════
//  CONFIGURATION MOUVEMENT
// ════════════════════════════════════════
const MOVEMENT_CONFIG = {
  truck:      { maxSpeed: 50, speedStep: 1, stopChance: 0.10, range: 0.00010, jamChance: 0.30 },
  van:        { maxSpeed: 60, speedStep: 1, stopChance: 0.12, range: 0.00012, jamChance: 0.30 },
  car:        { maxSpeed: 70, speedStep: 1, stopChance: 0.15, range: 0.00015, jamChance: 0.35 },
  motorcycle: { maxSpeed: 60, speedStep: 2, stopChance: 0.10, range: 0.00018, jamChance: 0.20 },
  bus:        { maxSpeed: 40, speedStep: 1, stopChance: 0.20, range: 0.00008, jamChance: 0.40 },
  phone:      { maxSpeed: 5,  speedStep: 1, stopChance: 0.20, range: 0.00003, jamChance: 0    },
  tablet:     { maxSpeed: 4,  speedStep: 1, stopChance: 0.30, range: 0.00002, jamChance: 0    },
  drone:      { maxSpeed: 50, speedStep: 2, stopChance: 0.05, range: 0.00035, jamChance: 0    },
  boat:       { maxSpeed: 30, speedStep: 1, stopChance: 0.05, range: 0.00020, jamChance: 0    },
  bicycle:    { maxSpeed: 20, speedStep: 1, stopChance: 0.10, range: 0.00008, jamChance: 0.10 },
  person:     { maxSpeed: 5,  speedStep: 1, stopChance: 0.15, range: 0.00003, jamChance: 0    },
  pet:        { maxSpeed: 8,  speedStep: 1, stopChance: 0.15, range: 0.00005, jamChance: 0    },
  asset:      { maxSpeed: 0,  speedStep: 0, stopChance: 1.00, range: 0,       jamChance: 0    },
  other:      { maxSpeed: 40, speedStep: 1, stopChance: 0.10, range: 0.00012, jamChance: 0.20 }
};

// ════════════════════════════════════════
//  ROUTES MADAGASCAR
// ════════════════════════════════════════
const ROUTES = [
  {
    name: 'RN7',
    waypoints: [
      { lat: -18.8792, lng: 47.5079, city: 'Antananarivo' },
      { lat: -19.3500, lng: 47.2500, city: 'Ambatolampy'  },
      { lat: -19.8659, lng: 47.0333, city: 'Antsirabe'    },
      { lat: -20.5333, lng: 47.2500, city: 'Ambositra'    },
      { lat: -21.4545, lng: 47.0833, city: 'Fianarantsoa' },
      { lat: -22.4042, lng: 46.1250, city: 'Ihosy'        },
      { lat: -23.3500, lng: 43.6667, city: 'Toliara'      }
    ]
  },
  {
    name: 'RN2',
    waypoints: [
      { lat: -18.8792, lng: 47.5079, city: 'Antananarivo' },
      { lat: -18.7500, lng: 47.8500, city: 'Manjakandriana' },
      { lat: -18.5500, lng: 48.4000, city: 'Moramanga'    },
      { lat: -18.3500, lng: 48.8500, city: 'Brickaville'  },
      { lat: -18.1492, lng: 49.4023, city: 'Toamasina'    }
    ]
  },
  {
    name: 'RN4',
    waypoints: [
      { lat: -18.8792, lng: 47.5079, city: 'Antananarivo' },
      { lat: -18.0000, lng: 47.0000, city: 'Ankazobe'     },
      { lat: -17.0000, lng: 46.8000, city: 'Maevatanana'  },
      { lat: -16.4000, lng: 46.6000, city: 'Marovoay'     },
      { lat: -15.7167, lng: 46.3167, city: 'Mahajanga'    }
    ]
  },
  {
    name: 'RN6',
    waypoints: [
      { lat: -15.7167, lng: 46.3167, city: 'Mahajanga'    },
      { lat: -14.9000, lng: 47.5000, city: 'Antsohihy'    },
      { lat: -13.8000, lng: 48.1500, city: 'Ambanja'      },
      { lat: -12.2787, lng: 49.2917, city: 'Antsiranana'  }
    ]
  }
];

// ════════════════════════════════════════
//  ÉTATS INTERNES
// ════════════════════════════════════════
const deviceStates    = {};
const alertHistory    = {};
const previousStatus  = {};
let lastSOSTime       = 0;  // cooldown global SOS

const findNearestRoute = (lat, lng) => {
  let minDist = Infinity;
  let nearest = { route: ROUTES[0], waypointIdx: 0 };

  ROUTES.forEach((route) => {
    route.waypoints.forEach((wp, idx) => {
      const dist = Math.sqrt(
        Math.pow(wp.lat - lat, 2) +
        Math.pow(wp.lng - lng, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = { route, waypointIdx: idx };
      }
    });
  });

  return nearest;
};

const initDeviceState = (device) => {
  const { route, waypointIdx } = findNearestRoute(
    device.position.lat,
    device.position.lng
  );

  const nextIdx = Math.min(waypointIdx + 1, route.waypoints.length - 1);

  deviceStates[device.id] = {
    route:           route,
    currentWaypoint: waypointIdx,
    targetWaypoint:  nextIdx,
    direction:       1,
    targetSpeed:     0,
    currentSpeed:    device.speed || 0,
    phase:           'accelerate',
    phaseTimer:      3,
    isInJam:         false,
    jamTimer:        0,
    batteryLevel:    device.battery || 100,
    fuelLevel:       device.fuel || 100,
    batteryTimer:    0,
    fuelTimer:       0
  };
};

const calcDistance = (lat1, lng1, lat2, lng2) => {
  return Math.sqrt(
    Math.pow(lat2 - lat1, 2) +
    Math.pow(lng2 - lng1, 2)
  );
};

const calcBearing = (lat1, lng1, lat2, lng2) => {
  return Math.atan2(lng2 - lng1, lat2 - lat1);
};


// ════════════════════════════════════════
//  TRACKING ZONES (état précédent)
// ════════════════════════════════════════
const deviceZonesState = {};  // { deviceId: [zoneIds] }

// Calcul si device est dans zone
const isInZone = (devicePos, zone) => {
  if (!devicePos || !zone.center) return false;
  const R = 6371000;
  const lat1 = devicePos.lat * Math.PI / 180;
  const lat2 = zone.center.lat * Math.PI / 180;
  const dLat = (zone.center.lat - devicePos.lat) * Math.PI / 180;
  const dLng = (zone.center.lng - devicePos.lng) * Math.PI / 180;

  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLng / 2) ** 2;

  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return distance <= zone.radius;
};

// Détecter entrée/sortie de zone
const detectZoneChanges = (device, geofences, dispatch) => {
  if (!device.position) return;

  // ✅ Filtrer : seulement les zones où ce device est ASSIGNÉ
  const relevantZones = geofences.filter(g =>
    g.active &&
    Array.isArray(g.assignedDevices) &&
    g.assignedDevices.includes(device.id)
  );

  if (relevantZones.length === 0) {
    // Device pas assigné à aucune zone → pas d'alertes
    return;
  }

  const currentZones = relevantZones.filter(z => isInZone(device.position, z));
  const currentZoneIds = currentZones.map(z => z.id);
  const previousZoneIds = deviceZonesState[device.id] || [];

  // ZONES ENTRÉES
  const entered = currentZoneIds.filter(id => !previousZoneIds.includes(id));
  entered.forEach(zoneId => {
    const zone = relevantZones.find(z => z.id === zoneId);
    if (!zone || zone.alertOnEntry === false) return;

    const lat = device.position.lat.toFixed(5);
    const lng = device.position.lng.toFixed(5);

    const alert = {
      id:         Date.now() + Math.random(),
      type:       'geofence',
      message:    `✓ ${device.name} ENTRÉ dans sa zone "${zone.name}" [${lat}, ${lng}]`,
      severity:   'info',
      deviceId:   device.id,
      deviceName: device.name,
      position: {
        lat: device.position.lat,
        lng: device.position.lng,
        address: device.position.address
      },
      zoneId:    zone.id,
      zoneName:  zone.name,
      eventType: 'entry',
      read:      false,
      timestamp: new Date().toISOString()
    };

    dispatch(addAlertLocal(alert));
    dispatch(addNotification({
      type: 'info',
      message: `${device.name} entré dans "${zone.name}"`,
      device: device.name
    }));
  });

  // ZONES SORTIES (CRITIQUE car device assigné)
  const exited = previousZoneIds.filter(id => !currentZoneIds.includes(id));
  exited.forEach(zoneId => {
    const zone = relevantZones.find(z => z.id === zoneId);
    if (!zone || zone.alertOnExit === false) return;

    const lat = device.position.lat.toFixed(5);
    const lng = device.position.lng.toFixed(5);

    const alert = {
      id:         Date.now() + Math.random(),
      type:       'geofence',
      message:    `⚠ ALERTE: ${device.name} a QUITTÉ sa zone "${zone.name}" [${lat}, ${lng}]`,
      severity:   'danger',
      deviceId:   device.id,
      deviceName: device.name,
      position: {
        lat: device.position.lat,
        lng: device.position.lng,
        address: device.position.address
      },
      zoneId:    zone.id,
      zoneName:  zone.name,
      eventType: 'exit',
      read:      false,
      timestamp: new Date().toISOString()
    };

    dispatch(addAlertLocal(alert));
    dispatch(addNotification({
      type: 'danger',
      message: `${device.name} a quitté "${zone.name}"`,
      device: device.name
    }));
  });

  deviceZonesState[device.id] = currentZoneIds;
};

// ════════════════════════════════════════
//  GÉNÉRATEUR D'ALERTES
// ════════════════════════════════════════
const generateSmartAlerts = (device, state) => {
  const now = Date.now();

  if (!alertHistory[device.id]) {
    alertHistory[device.id] = {};
  }

  const history = alertHistory[device.id];
  const alerts  = [];

  // Coords GPS sécurisées
  const lat = device.position?.lat;
  const lng = device.position?.lng;
  const gpsCoords = (lat && lng)
    ? `[${lat.toFixed(5)}, ${lng.toFixed(5)}]`
    : '';
  const address = device.position?.address || '';

  // ── 1. CHANGEMENT STATUS ──
  const prevStatus = previousStatus[device.id];
  if (prevStatus && prevStatus !== device.status) {
    if (device.status === 'offline') {
      alerts.push({
        type:     'disconnect',
        message:  `${device.name} déconnecté ${gpsCoords} - ${address}`,
        severity: 'danger'
      });
    } else if (device.status === 'online' && prevStatus === 'offline') {
      alerts.push({
        type:     'ignition',
        message:  `${device.name} reconnecté ${gpsCoords}`,
        severity: 'success'
      });
    } else if (device.status === 'idle' && prevStatus === 'online') {
      alerts.push({
        type:     'ignition',
        message:  `${device.name} en arrêt ${gpsCoords} - ${address}`,
        severity: 'info'
      });
    }
  }
  previousStatus[device.id] = device.status;

  // Si pas online ou pas de state, retour
  if (device.status !== 'online' || !state) {
    return alerts;
  }

  // ── 2. EXCÈS DE VITESSE ──
  if (state.currentSpeed > 60) {
    if (!history.speeding || now - history.speeding > 30000) {
      alerts.push({
        type:     'speeding',
        message:  `Excès vitesse - ${Math.round(state.currentSpeed)} km/h sur ${state.route.name} ${gpsCoords}`,
        severity: 'danger'
      });
      history.speeding = now;
    }
  }

  // ── 3. EMBOUTEILLAGE ──
  if (state.isInJam && state.jamTimer > 15) {
    if (!history.jam || now - history.jam > 60000) {
      alerts.push({
        type:     'geofence',
        message:  `Embouteillage long sur ${state.route.name} ${gpsCoords}`,
        severity: 'warning'
      });
      history.jam = now;
    }
  }

  // ── 4. BATTERIE ──
  if (state.batteryLevel < 20 && state.batteryLevel > 10) {
    if (!history.lowBattery || now - history.lowBattery > 120000) {
      alerts.push({
        type:     'lowBattery',
        message:  `Batterie faible - ${Math.round(state.batteryLevel)}% ${gpsCoords}`,
        severity: 'warning'
      });
      history.lowBattery = now;
    }
  } else if (state.batteryLevel <= 10) {
    if (!history.criticalBattery || now - history.criticalBattery > 60000) {
      alerts.push({
        type:     'lowBattery',
        message:  `Batterie critique - ${Math.round(state.batteryLevel)}% ${gpsCoords}`,
        severity: 'danger'
      });
      history.criticalBattery = now;
    }
  }

  // ── 5. CARBURANT ──
  if (state.fuelLevel !== null && state.fuelLevel < 25) {
    if (!history.lowFuel || now - history.lowFuel > 120000) {
      alerts.push({
        type:     'lowFuel',
        message:  `Carburant faible - ${Math.round(state.fuelLevel)}% ${gpsCoords}`,
        severity: 'warning'
      });
      history.lowFuel = now;
    }
  }

  // ── 6. ARRIVÉE DESTINATION ──
  const wp = state.route.waypoints[state.targetWaypoint];
  const dist = calcDistance(device.position.lat, device.position.lng, wp.lat, wp.lng);
  if (dist < 0.04) {
    const arrivalKey = `arrival_${wp.city}`;
    if (!history[arrivalKey] || now - history[arrivalKey] > 120000) {
      alerts.push({
        type:     'geofence',
        message:  `${device.name} arrivé à ${wp.city} ${gpsCoords}`,
        severity: 'info'
      });
      history[arrivalKey] = now;
    }
  }

  // ── 7. SOS (TRÈS RARE - cooldown global 5 min) ──
  // 0.05% chance par tick + cooldown 5 minutes minimum
  if (Math.random() > 0.9995 && now - lastSOSTime > 300000) {
    alerts.push({
      type:     'sos',
      message:  `⚠ SIGNAL SOS - ${device.name} ${gpsCoords} - ${address}`,
      severity: 'danger'
    });
    lastSOSTime = now;
  }

  // ── 8. MAINTENANCE ──
  if (device.totalDistance > 800 && Math.random() > 0.997) {
    if (!history.maintenance || now - history.maintenance > 300000) {
      alerts.push({
        type:     'maintenance',
        message:  `Maintenance recommandée - ${device.totalDistance} km ${gpsCoords}`,
        severity: 'info'
      });
      history.maintenance = now;
    }
  }

  return alerts;
};

// ════════════════════════════════════════
//  HELPER : Envoyer alertes
// ════════════════════════════════════════
const sendAlerts = (alerts, device, dispatch) => {
  alerts.forEach(a => {
    const fullAlert = {
      ...a,
      id:         Date.now() + Math.random(),
      deviceId:   device.id,
      deviceName: device.name,
      position: {
        lat:     device.position?.lat,
        lng:     device.position?.lng,
        address: device.position?.address
      },
      read:       false,
      timestamp:  new Date().toISOString()
    };

    dispatch(addAlertLocal(fullAlert));
    dispatch(addNotification({
      type:    a.severity,
      message: a.message,
      device:  device.name
    }));
  });
};

// ════════════════════════════════════════
//  HOOK PRINCIPAL
// ════════════════════════════════════════
const useSocket = () => {
  const dispatch       = useDispatch();
  const devicesList    = useSelector((state) => state.devices.list);
  const intervalRef = useRef(null);
  const devicesRef  = useRef(devicesList);

  useEffect(() => {
    devicesRef.current = devicesList;
  }, [devicesList]);

    // ════════════════════════════════════════
  //  GÉNÉRER ALERTES INITIALES AU DÉMARRAGE
  // ════════════════════════════════════════
  const initialAlertsGenerated = useRef(false);

  useEffect(() => {
    // Attendre que les devices soient chargés
    if (devicesList.length === 0 || initialAlertsGenerated.current) return;

    initialAlertsGenerated.current = true;

    console.log('🚨 Génération alertes initiales...');

    // Templates d'alertes initiales
    const initialAlerts = [
      {
        type: 'speeding',
        message: 'Excès de vitesse détecté',
        severity: 'danger'
      },
      {
        type: 'lowBattery',
        message: 'Batterie faible',
        severity: 'warning'
      },
      {
        type: 'geofence',
        message: 'Sortie de zone autorisée',
        severity: 'danger'
      },
      {
        type: 'ignition',
        message: 'Moteur démarré',
        severity: 'info'
      },
      {
        type: 'disconnect',
        message: 'Appareil déconnecté du réseau',
        severity: 'warning'
      },
      {
        type: 'lowFuel',
        message: 'Niveau de carburant faible',
        severity: 'warning'
      },
      {
        type: 'maintenance',
        message: 'Maintenance recommandée',
        severity: 'info'
      },
      {
        type: 'sos',
        message: '⚠ SIGNAL SOS URGENT',
        severity: 'danger'
      }
    ];

    // Générer 5-8 alertes aléatoires sur différents devices
    const numAlerts = Math.min(
      Math.floor(Math.random() * 4) + 5,
      devicesList.length
    );

    const usedDevices = new Set();

    for (let i = 0; i < numAlerts; i++) {
      // Choisir un device aléatoire pas encore utilisé
      let device;
      let attempts = 0;

      do {
        device = devicesList[Math.floor(Math.random() * devicesList.length)];
        attempts++;
      } while (usedDevices.has(device.id) && attempts < 20);

      usedDevices.add(device.id);

      // Choisir un template aléatoire
      const template = initialAlerts[
        Math.floor(Math.random() * initialAlerts.length)
      ];

      // Coordonnées GPS
      const lat = device.position?.lat?.toFixed(5) || '?';
      const lng = device.position?.lng?.toFixed(5) || '?';
      const gpsCoords = `[${lat}, ${lng}]`;
      const address = device.position?.address || '';

      // Construire le message avec données réelles
      let fullMessage = template.message;
      if (template.type === 'speeding') {
        fullMessage = `Excès vitesse - ${Math.floor(Math.random() * 40) + 70} km/h ${gpsCoords}`;
      } else if (template.type === 'lowBattery') {
        const battery = Math.floor(Math.random() * 15) + 5;
        fullMessage = `Batterie ${battery < 10 ? 'critique' : 'faible'} - ${battery}% ${gpsCoords}`;
      } else if (template.type === 'lowFuel') {
        fullMessage = `Carburant faible - ${Math.floor(Math.random() * 15) + 10}% ${gpsCoords}`;
      } else if (template.type === 'sos') {
        fullMessage = `⚠ SIGNAL SOS - ${device.name} ${gpsCoords} - ${address}`;
      } else if (template.type === 'disconnect') {
        fullMessage = `${device.name} déconnecté ${gpsCoords} - ${address}`;
      } else if (template.type === 'geofence') {
        fullMessage = `Sortie de zone - ${device.name} ${gpsCoords}`;
      } else if (template.type === 'ignition') {
        fullMessage = `${device.name} ${template.message} ${gpsCoords}`;
      } else if (template.type === 'maintenance') {
        fullMessage = `Maintenance recommandée - ${device.name} ${gpsCoords}`;
      }

      // Créer l'alerte avec timestamp décalé (plus ancienne = plus tôt)
      const minutesAgo = i * (Math.floor(Math.random() * 20) + 5);
      const timestamp = new Date(Date.now() - minutesAgo * 60000).toISOString();

      const newAlert = {
        id:         Date.now() + Math.random() + i,
        type:       template.type,
        message:    fullMessage,
        severity:   template.severity,
        deviceId:   device.id,
        deviceName: device.name,
        position: {
          lat:     device.position?.lat,
          lng:     device.position?.lng,
          address: device.position?.address
        },
        read:       false,
        timestamp:  timestamp
      };

      // Délai progressif pour effet visuel
      setTimeout(() => {
        dispatch(addAlertLocal(newAlert));
      }, i * 200);
    }

    console.log(`✅ ${numAlerts} alertes initiales générées`);
  }, [devicesList, dispatch]);

  const simulate = useCallback(() => {
    const devices = devicesRef.current;

    devices.forEach((device) => {

      // ── OFFLINE ──
      if (device.status === 'offline') {
        const alerts = generateSmartAlerts(device, null);
        sendAlerts(alerts, device, dispatch);
        return;
      }

      // ── IDLE ──
      if (device.status === 'idle') {
        if (device.speed !== 0) {
          dispatch(updatePosition({
            id: device.id,
            position: device.position,
            speed: 0
          }));
        }
        const alerts = generateSmartAlerts(device, null);
        sendAlerts(alerts, device, dispatch);
        return;
      }

      // ── ONLINE ──
      if (!deviceStates[device.id]) {
        initDeviceState(device);
      }

      const state  = deviceStates[device.id];
      const config = MOVEMENT_CONFIG[device.type] || MOVEMENT_CONFIG.other;

      if (config.maxSpeed === 0) return;

      const targetWp = state.route.waypoints[state.targetWaypoint];

      // EMBOUTEILLAGE
      if (state.isInJam) {
        state.jamTimer--;
        state.targetSpeed = Math.random() * 15;
        if (state.jamTimer <= 0) state.isInJam = false;
      } else {
        if (Math.random() < config.jamChance / 100) {
          state.isInJam = true;
          state.jamTimer = 10 + Math.floor(Math.random() * 20);
        }
      }

      // WAYPOINT ATTEINT
      const distToWp = calcDistance(
        device.position.lat, device.position.lng,
        targetWp.lat, targetWp.lng
      );

      if (distToWp < 0.03) {
        state.currentWaypoint = state.targetWaypoint;
        if (state.targetWaypoint === state.route.waypoints.length - 1) {
          state.direction = -1;
        } else if (state.targetWaypoint === 0) {
          state.direction = 1;
        }
        state.targetWaypoint = state.currentWaypoint + state.direction;
        if (state.targetWaypoint < 0) state.targetWaypoint = 1;
        if (state.targetWaypoint >= state.route.waypoints.length) {
          state.targetWaypoint = state.route.waypoints.length - 2;
        }
      }

      // PHASES
      if (!state.isInJam) {
        state.phaseTimer--;
        if (state.phaseTimer <= 0) {
          const rand = Math.random();
          if (state.phase === 'stopped') {
            state.phase       = 'accelerate';
            state.targetSpeed = config.maxSpeed * (0.5 + Math.random() * 0.4);
            state.phaseTimer  = 6 + Math.floor(Math.random() * 8);
          } else if (rand < config.stopChance) {
            state.phase       = 'decelerate';
            state.targetSpeed = 0;
            state.phaseTimer  = 3 + Math.floor(Math.random() * 4);
          } else {
            state.phase       = 'cruise';
            state.targetSpeed = config.maxSpeed * (0.4 + Math.random() * 0.5);
            state.phaseTimer  = 8 + Math.floor(Math.random() * 12);
          }
        }
      }

      // VITESSE PROGRESSIVE
      const diff = state.targetSpeed - state.currentSpeed;
      if (Math.abs(diff) > 0.5) {
        const step = Math.min(config.speedStep, Math.abs(diff));
        state.currentSpeed += diff > 0 ? step : -step;
      } else {
        state.currentSpeed = state.targetSpeed;
      }
      state.currentSpeed = Math.max(0, Math.min(config.maxSpeed, state.currentSpeed));

      // DRAIN BATTERIE
      state.batteryTimer++;
      if (state.batteryTimer > 8) {
        const drain = state.currentSpeed > 0 ? 0.2 : 0.05;
        state.batteryLevel = Math.max(0, state.batteryLevel - drain);
        state.batteryTimer = 0;
      }

      // DRAIN CARBURANT
      if (state.fuelLevel !== null) {
        state.fuelTimer++;
        if (state.fuelTimer > 10 && state.currentSpeed > 0) {
          state.fuelLevel = Math.max(0, state.fuelLevel - 0.3);
          state.fuelTimer = 0;
        }
      }

      // POSITION
      const bearing = calcBearing(
        device.position.lat, device.position.lng,
        targetWp.lat, targetWp.lng
      );
      const speedFactor = state.currentSpeed / config.maxSpeed;
      const distance    = config.range * speedFactor;
      const newLat = device.position.lat + Math.cos(bearing) * distance;
      const newLng = device.position.lng + Math.sin(bearing) * distance;
      const safeLat = Math.max(-25.5, Math.min(-11.9, newLat));
      const safeLng = Math.max(43.0, Math.min(50.5, newLng));

      // ADRESSE
      let address;
      if (state.isInJam) {
        address = `🚦 Bouchon - ${state.route.name}`;
      } else if (state.currentSpeed === 0) {
        address = `Arrêt - ${state.route.name}`;
      } else {
        address = `${state.route.name} → ${targetWp.city}`;
      }

      // UPDATE POSITION
      const updatedDevice = {
        ...device,
        position: { lat: safeLat, lng: safeLng, address: address },
        speed: Math.round(state.currentSpeed),
        battery: Math.round(state.batteryLevel),
        fuel: state.fuelLevel !== null ? Math.round(state.fuelLevel) : null
      };

      dispatch(updatePosition({
        id: device.id,
        position: updatedDevice.position,
        speed: updatedDevice.speed
      }));

      // GÉNÉRER ALERTES avec position à jour
      const alerts = generateSmartAlerts(updatedDevice, state);
      sendAlerts(alerts, updatedDevice, dispatch);

    });
  }, [dispatch]);

  useEffect(() => {
    console.log('🟢 GPS + Alerts Simulation Started');

    intervalRef.current = setInterval(() => {
      simulate();
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('🔴 Simulation Stopped');
      }
    };
  }, [simulate]);

  return null;
};

export default useSocket;