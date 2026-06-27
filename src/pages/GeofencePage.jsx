import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, Circle, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import {
  fetchGeofences,
  addGeofence,
  deleteGeofence,
  toggleGeofence
} from '../store/slices/geofenceSlice';
import useDevices from '../hooks/useDevices';
import { MAP_CONFIG } from '../utils/constants';
import { getDeviceIcon } from '../utils/helpers';
import geofenceService from '../services/geofenceService';
import { updateGeofence } from '../store/slices/geofenceSlice';

// ════════════════════════════════════════
//  ZONES TEMPLATES
// ════════════════════════════════════════
const ZONE_TEMPLATES = [
  { name: 'Antananarivo Centre', lat: -18.8792, lng: 47.5079, radius: 2000 },
  { name: 'Antsirabe Centre',    lat: -19.8659, lng: 47.0333, radius: 1500 },
  { name: 'Fianarantsoa Centre', lat: -21.4545, lng: 47.0833, radius: 1500 },
  { name: 'Ambositra',           lat: -20.5333, lng: 47.2500, radius: 1000 },
  { name: 'Moramanga',           lat: -18.9500, lng: 48.2333, radius: 1000 }
];

const ZONE_COLORS = [
  { name: 'Vert',    value: '#00ff41' },
  { name: 'Cyan',    value: '#00ffff' },
  { name: 'Orange',  value: '#ff6600' },
  { name: 'Rouge',   value: '#ff003c' },
  { name: 'Violet',  value: '#9900ff' },
  { name: 'Jaune',   value: '#ffff00' }
];

const GeofencePage = () => {
  const dispatch = useDispatch();
  const { list: geofences, stats, loading } = useSelector(state => state.geofences);
  const { allDevices } = useDevices();

  const [showModal, setShowModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [editingZone, setEditingZone] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showOnlyDevicesInZones, setShowOnlyDevicesInZones] = useState(false);

  const [formData, setFormData] = useState({
  name: '',
  lat: -18.8792,
  lng: 47.5079,
  radius: 1000,
  color: '#00ff41',
  type: 'circle',
  description: '',
  alertOnEntry: true,
  alertOnExit: true,
  assignedDevices: []  // ✅ IDs des devices assignés
});

  useEffect(() => {
    dispatch(fetchGeofences());
  }, [dispatch]);

  // ── Filtres ──
  let filteredZones = [...geofences];
  if (filterStatus === 'active') {
    filteredZones = filteredZones.filter(z => z.active);
  } else if (filterStatus === 'inactive') {
    filteredZones = filteredZones.filter(z => !z.active);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredZones = filteredZones.filter(z =>
      z.name.toLowerCase().includes(q)
    );
  }

  // ── Handlers ──
  const handleAdd = () => {
  setFormData({
    name: '',
    lat: -18.8792,
    lng: 47.5079,
    radius: 1000,
    color: '#00ff41',
    type: 'circle',
    description: '',
    alertOnEntry: true,
    alertOnExit: true,
    assignedDevices: []
  });
  setEditingZone(null);
  setShowModal(true);
};

  const handleEdit = (zone) => {
  setFormData({
    name: zone.name,
    lat: zone.center.lat,
    lng: zone.center.lng,
    radius: zone.radius,
    color: zone.color,
    type: zone.type || 'circle',
    description: zone.description || '',
    alertOnEntry: zone.alertOnEntry !== false,
    alertOnExit: zone.alertOnExit !== false,
    assignedDevices: zone.assignedDevices || []
  });
  setEditingZone(zone);
  setShowModal(true);
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name.trim()) {
    alert('⚠ Veuillez donner un nom à la zone');
    return;
  }

  if (formData.assignedDevices.length === 0) {
    if (!window.confirm('⚠ Aucun appareil assigné à cette zone. Aucune alerte ne sera générée. Continuer ?')) {
      return;
    }
  }

  try {
    const zoneData = {
      name: formData.name,
      type: 'circle',
      color: formData.color,
      center: { lat: formData.lat, lng: formData.lng },
      radius: parseInt(formData.radius),
      description: formData.description,
      alertOnEntry: formData.alertOnEntry,
      alertOnExit: formData.alertOnExit,
      assignedDevices: formData.assignedDevices
    };

    if (editingZone) {
      await dispatch(updateGeofence({
        id: editingZone.id,
        data: { ...editingZone, ...zoneData }
      })).unwrap();
    } else {
      await dispatch(addGeofence(zoneData)).unwrap();
    }

    await dispatch(fetchGeofences()).unwrap();
    setShowModal(false);
    setEditingZone(null);
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors de l\'opération');
  }
};  

  const handleDelete = async (id) => {
    if (!window.confirm('⚠ Supprimer cette zone ?')) return;
    try {
      await dispatch(deleteGeofence(id)).unwrap();
      await dispatch(fetchGeofences()).unwrap();
      if (selectedZone?.id === id) setSelectedZone(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleToggle = async (zone) => {
    try {
      await dispatch(toggleGeofence({ id: zone.id, active: zone.active })).unwrap();
      await dispatch(fetchGeofences()).unwrap();
    } catch (error) {
      console.error('Erreur toggle:', error);
    }
  };

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      name: template.name,
      lat: template.lat,
      lng: template.lng,
      radius: template.radius
    });
  };

  const getDevicesInZone = (zone) => {
    return allDevices.filter(device => {
      if (!device.position) return false;
      return geofenceService.isDeviceInZone(device.position, zone);
    });
  };

  // Devices à afficher sur la carte
  const devicesToShow = showOnlyDevicesInZones
    ? allDevices.filter(d => geofences.some(z => z.active && geofenceService.isDeviceInZone(d.position, z)))
    : allDevices;

  // Total devices dans toutes zones actives
  const totalInZones = geofences.reduce((sum, z) =>
    z.active ? sum + getDevicesInZone(z).length : sum, 0
  );
  const toggleDeviceAssignment = (deviceId) => {
  const isAssigned = formData.assignedDevices.includes(deviceId);
  setFormData({
    ...formData,
    assignedDevices: isAssigned
      ? formData.assignedDevices.filter(id => id !== deviceId)
      : [...formData.assignedDevices, deviceId]
  });
};

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            <span style={styles.titleIcon}>◆</span> GEOFENCE ZONES
          </h2>
          <span style={styles.subtitle}>
            {stats.active} actives sur {stats.total} zones • {totalInZones} devices surveillés
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              ...styles.addBtn,
              borderColor: showOnlyDevicesInZones ? '#00ffff' : 'rgba(0,255,65,0.3)',
              color: showOnlyDevicesInZones ? '#00ffff' : '#888',
              background: showOnlyDevicesInZones ? 'rgba(0,255,255,0.1)' : 'transparent'
            }}
            onClick={() => setShowOnlyDevicesInZones(!showOnlyDevicesInZones)}
          >
            {showOnlyDevicesInZones ? '◉ FILTRE ACTIF' : '○ DEVICES DANS ZONES'}
          </button>

          <button style={styles.addBtn} onClick={handleAdd}>
            + AJOUTER ZONE
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={{ ...styles.statIcon, color: '#00ff41' }}>⬡</span>
          <div>
            <div style={{ ...styles.statValue, color: '#00ff41' }}>{stats.total}</div>
            <div style={styles.statLabel}>TOTAL ZONES</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={{ ...styles.statIcon, color: '#00ff41' }}>◉</span>
          <div>
            <div style={{ ...styles.statValue, color: '#00ff41' }}>{stats.active}</div>
            <div style={styles.statLabel}>ACTIVES</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={{ ...styles.statIcon, color: '#666' }}>○</span>
          <div>
            <div style={{ ...styles.statValue, color: '#666' }}>{stats.inactive}</div>
            <div style={styles.statLabel}>INACTIVES</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <span style={{ ...styles.statIcon, color: '#00ffff' }}>📡</span>
          <div>
            <div style={{ ...styles.statValue, color: '#00ffff' }}>{totalInZones}</div>
            <div style={styles.statLabel}>DEVICES SURVEILLÉS</div>
          </div>
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={styles.mainArea}>

        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h3 style={styles.sidebarTitle}>
              <span style={{ color: '#00ff41' }}>◆</span> ZONES
            </h3>
            <span style={styles.zoneCount}>[{filteredZones.length}]</span>
          </div>

          {/* Recherche */}
          <div style={styles.searchBox}>
            <span style={{ color: '#444', fontSize: '14px' }}>⌕</span>
            <input
              type="text"
              placeholder="Rechercher zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button style={styles.clearBtn} onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          {/* Filtres */}
          <div style={styles.filterTabs}>
            {[
              { key: 'all', label: 'TOUTES' },
              { key: 'active', label: 'ACTIVES' },
              { key: 'inactive', label: 'INACTIVES' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                style={{
                  ...styles.filterBtn,
                  ...(filterStatus === f.key ? styles.filterBtnActive : {})
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Liste zones */}
          <div style={styles.zonesList}>
            {filteredZones.length === 0 ? (
              <div style={styles.empty}>
                <span style={styles.emptyIcon}>⬡</span>
                <span style={styles.emptyText}>Aucune zone trouvée</span>
              </div>
            ) : (
              filteredZones.map(zone => {
                const devicesInZone = getDevicesInZone(zone);
                return (
                  <div
                    key={zone.id}
                    style={{
                      ...styles.zoneCard,
                      borderColor: selectedZone?.id === zone.id ? zone.color : '#1a1a1a',
                      background: selectedZone?.id === zone.id ? `${zone.color}10` : '#0a0a0a'
                    }}
                    onClick={() => setSelectedZone(zone)}
                  >
                    <div style={{
                      ...styles.zoneIndicator,
                      background: zone.color,
                      boxShadow: zone.active ? `0 0 8px ${zone.color}` : 'none',
                      opacity: zone.active ? 1 : 0.3
                    }}></div>

                    <div style={styles.zoneInfo}>
                      <div style={styles.zoneHeader}>
                        <span style={{
                          ...styles.zoneName,
                          color: zone.active ? '#e0e0e0' : '#666'
                        }}>
                          {zone.name}
                        </span>
                        <span style={{
                          ...styles.zoneStatus,
                          color: zone.active ? '#00ff41' : '#666'
                        }}>
                          {zone.active ? '● ON' : '○ OFF'}
                        </span>
                      </div>

                      <div style={styles.zoneMeta}>
  <span>📏 {zone.radius >= 1000 ? `${(zone.radius/1000).toFixed(1)}km` : `${zone.radius}m`}</span>
  <span>📡 {(zone.assignedDevices || []).length} assignés</span>
</div>
<div style={{ fontSize: '9px', color: '#888', marginBottom: '6px' }}>
  📍 {devicesInZone.filter(d => (zone.assignedDevices || []).includes(d.id)).length} dans la zone
</div>

                      {/* Alertes config */}
                      <div style={styles.alertConfig}>
                        {zone.alertOnEntry !== false && (
                          <span style={styles.alertBadge}>→ ENTRÉE</span>
                        )}
                        {zone.alertOnExit !== false && (
                          <span style={{...styles.alertBadge, color: '#ff003c', borderColor: 'rgba(255,0,60,0.3)'}}>
                            ← SORTIE
                          </span>
                        )}
                      </div>

                      <div style={styles.zoneActions}>
                        <button
                          style={styles.actionBtn}
                          onClick={(e) => { e.stopPropagation(); handleToggle(zone); }}
                          title={zone.active ? 'Désactiver' : 'Activer'}
                        >
                          {zone.active ? '⏸' : '▶'}
                        </button>
                        <button
                          style={{...styles.actionBtn, color: '#00ffff', borderColor: 'rgba(0,255,255,0.3)'}}
                          onClick={(e) => { e.stopPropagation(); handleEdit(zone); }}
                          title="Modifier"
                        >
                          ✎
                        </button>
                        <button
                          style={{...styles.actionBtn, borderColor: 'rgba(255,0,60,0.3)', color: '#ff003c'}}
                          onClick={(e) => { e.stopPropagation(); handleDelete(zone.id); }}
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* MAP */}
        <div style={styles.mapSection}>
          {/* Map overlay info */}
          {selectedZone && (
            <div style={styles.mapOverlay}>
              <div style={{
                fontSize: '9px',
                color: selectedZone.color,
                fontWeight: 700,
                letterSpacing: '2px',
                marginBottom: '6px'
              }}>
                ⬡ ZONE SÉLECTIONNÉE
              </div>
              <div style={{
                fontSize: '13px',
                color: '#e0e0e0',
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                {selectedZone.name}
              </div>
              <div style={{ fontSize: '10px', color: '#888', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div>📍 {selectedZone.center.lat.toFixed(5)}, {selectedZone.center.lng.toFixed(5)}</div>
                <div>📏 Rayon: {selectedZone.radius}m</div>
                <div>📡 {getDevicesInZone(selectedZone).length} devices dedans</div>
                <div>● {selectedZone.active ? 'ACTIVE' : 'INACTIVE'}</div>
              </div>
            </div>
          )}

          <MapContainer
            center={selectedZone
              ? [selectedZone.center.lat, selectedZone.center.lng]
              : MAP_CONFIG.center}
            zoom={selectedZone ? 13 : MAP_CONFIG.zoom}
            style={{ width: '100%', height: '100%' }}
            key={selectedZone?.id || 'default'}
          >
            <TileLayer url={MAP_CONFIG.tile} attribution="© CartoDB" />

            {geofences.map(zone => (
              <Circle
                key={zone.id}
                center={[zone.center.lat, zone.center.lng]}
                radius={zone.radius}
                pathOptions={{
                  color:       zone.color,
                  fillColor:   zone.color,
                  fillOpacity: zone.active ? 0.15 : 0.05,
                  weight:      zone.active ? 2 : 1,
                  opacity:     zone.active ? 1 : 0.4,
                  dashArray:   zone.active ? null : '5, 5'
                }}
                eventHandlers={{ click: () => setSelectedZone(zone) }}
              >
                <Popup>
                  <div style={{ fontFamily: 'monospace', minWidth: '180px' }}>
                    <div style={{
                      color: zone.color,
                      fontWeight: 700,
                      fontSize: '13px',
                      marginBottom: '8px',
                      letterSpacing: '1px'
                    }}>
                      ⬡ {zone.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', lineHeight: 1.6 }}>
                      📏 Rayon: {zone.radius}m<br/>
                      ● Status: {zone.active ? 'ACTIVE' : 'INACTIVE'}<br/>
                      📡 Devices: {getDevicesInZone(zone).length}
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}

            {devicesToShow.map(device => {
              if (!device.position) return null;
              const inZone = geofences.some(z => z.active && geofenceService.isDeviceInZone(device.position, z));

              const icon = L.divIcon({
                className: 'custom-marker',
                html: `
                  <div style="
                    background: #0d0d0d;
                    border: 2px solid ${inZone ? '#00ff41' : '#ff6600'};
                    border-radius: 50%;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    box-shadow: 0 0 8px ${inZone ? '#00ff41' : '#ff6600'};
                  ">
                    ${getDeviceIcon(device.type)}
                  </div>
                `,
                iconSize: [28, 28],
                iconAnchor: [14, 14]
              });

              return (
                <Marker key={device.id} position={[device.position.lat, device.position.lng]} icon={icon}>
                  <Popup>
                    <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                      <strong style={{ color: '#00ff41' }}>{device.name}</strong><br/>
                      <span style={{ color: inZone ? '#00ff41' : '#ff6600' }}>
                        {inZone ? '✓ DANS UNE ZONE' : '⚠ HORS ZONES'}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <span style={{...styles.modalCorner, top: 0, left: 0, borderWidth: '2px 0 0 2px'}}></span>
            <span style={{...styles.modalCorner, top: 0, right: 0, borderWidth: '2px 2px 0 0'}}></span>
            <span style={{...styles.modalCorner, bottom: 0, left: 0, borderWidth: '0 0 2px 2px'}}></span>
            <span style={{...styles.modalCorner, bottom: 0, right: 0, borderWidth: '0 2px 2px 0'}}></span>

            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingZone ? '✎ MODIFIER ZONE' : '⬡ NOUVELLE ZONE GEOFENCE'}
              </h3>
              <button style={styles.modalClose} onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>

              {!editingZone && (
                <div style={styles.field}>
                  <label style={styles.label}>TEMPLATES RAPIDES</label>
                  <div style={styles.templates}>
                    {ZONE_TEMPLATES.map(t => (
                      <button
                        key={t.name}
                        type="button"
                        style={styles.templateBtn}
                        onClick={() => applyTemplate(t)}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.field}>
                <label style={styles.label}>NOM DE LA ZONE *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.input}
                  placeholder="ex: Zone Centre-Ville"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>DESCRIPTION</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  style={{...styles.input, minHeight: '60px', resize: 'vertical', fontFamily: 'monospace'}}
                  placeholder="Description optionnelle..."
                />
              </div>

              <div style={styles.formGrid}>
                <div style={styles.field}>
                  <label style={styles.label}>LATITUDE *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.lat}
                    onChange={(e) => setFormData({...formData, lat: parseFloat(e.target.value)})}
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>LONGITUDE *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.lng}
                    onChange={(e) => setFormData({...formData, lng: parseFloat(e.target.value)})}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  RAYON (mètres) * <span style={{color: '#00ff41', fontSize: '10px'}}>
                    {formData.radius >= 1000 ? `${(formData.radius/1000).toFixed(2)}km` : `${formData.radius}m`}
                  </span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={formData.radius}
                  onChange={(e) => setFormData({...formData, radius: e.target.value})}
                  style={{...styles.input, padding: '0', accentColor: '#00ff41'}}
                />
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'9px', color:'#444', marginTop:'4px'}}>
                  <span>100m</span><span>5km</span><span>10km</span>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>COULEUR DE LA ZONE</label>
                <div style={styles.colorPicker}>
                  {ZONE_COLORS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      style={{
                        ...styles.colorBtn,
                        background: c.value,
                        border: formData.color === c.value ? `2px solid #fff` : '2px solid transparent',
                        boxShadow: formData.color === c.value ? `0 0 10px ${c.value}` : 'none'
                      }}
                      onClick={() => setFormData({...formData, color: c.value})}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Alertes config */}
              <div style={styles.field}>
                <label style={styles.label}>ALERTES AUTOMATIQUES</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.alertOnEntry}
                      onChange={(e) => setFormData({...formData, alertOnEntry: e.target.checked})}
                      style={styles.checkbox}
                    />
                    <span>→ Alerter à l'ENTRÉE dans la zone</span>
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.alertOnExit}
                      onChange={(e) => setFormData({...formData, alertOnExit: e.target.checked})}
                      style={styles.checkbox}
                    />
                    <span>← Alerter à la SORTIE de la zone</span>
                  </label>
                </div>
              </div>

              {/* Sélection devices à surveiller */}
<div style={styles.field}>
  <label style={styles.label}>
    APPAREILS À SURVEILLER * <span style={{color: '#00ff41', fontSize: '9px'}}>
      ({formData.assignedDevices.length}/{allDevices.length})
    </span>
  </label>

  <div style={styles.devicesSelector}>
    {allDevices.length === 0 ? (
      <div style={{ textAlign: 'center', color: '#444', padding: '20px', fontSize: '11px' }}>
        Aucun appareil disponible
      </div>
    ) : (
      <>
        {/* Boutons rapides */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          <button
            type="button"
            style={styles.quickBtn}
            onClick={() => setFormData({
              ...formData,
              assignedDevices: allDevices.map(d => d.id)
            })}
          >
            ✓ TOUS
          </button>
          <button
            type="button"
            style={styles.quickBtn}
            onClick={() => setFormData({...formData, assignedDevices: []})}
          >
            ✕ AUCUN
          </button>
          <button
            type="button"
            style={styles.quickBtn}
            onClick={() => setFormData({
              ...formData,
              assignedDevices: allDevices.filter(d => d.status === 'online').map(d => d.id)
            })}
          >
            ◉ ONLINE
          </button>
        </div>

        {/* Liste devices */}
        <div style={styles.devicesList}>
          {allDevices.map(device => {
            const isAssigned = formData.assignedDevices.includes(device.id);
            return (
              <div
                key={device.id}
                onClick={() => toggleDeviceAssignment(device.id)}
                style={{
                  ...styles.deviceItem,
                  background: isAssigned ? 'rgba(0,255,65,0.08)' : 'transparent',
                  borderColor: isAssigned ? 'rgba(0,255,65,0.4)' : '#1a1a1a'
                }}
              >
                <div style={{
                  ...styles.checkIcon,
                  background: isAssigned ? '#00ff41' : 'transparent',
                  borderColor: isAssigned ? '#00ff41' : '#444',
                  color: isAssigned ? '#000' : 'transparent'
                }}>
                  ✓
                </div>

                <span style={{ fontSize: '14px' }}>
                  {getDeviceIcon(device.type)}
                </span>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '12px',
                    color: isAssigned ? '#e0e0e0' : '#888',
                    fontWeight: 600
                  }}>
                    {device.name}
                  </div>
                  <div style={{ fontSize: '9px', color: '#555' }}>
                    {device.type} • {device.imei}
                  </div>
                </div>

                <span style={{
                  fontSize: '8px',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  color: device.status === 'online' ? '#00ff41' :
                         device.status === 'idle'   ? '#ff6600' : '#ff003c',
                  background: device.status === 'online' ? 'rgba(0,255,65,0.1)' :
                              device.status === 'idle'   ? 'rgba(255,102,0,0.1)' : 'rgba(255,0,60,0.1)'
                }}>
                  {device.status}
                </span>
              </div>
            );
          })}
        </div>
      </>
    )}
  </div>
</div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  ANNULER
                </button>
                <button type="submit" style={styles.submitBtn}>
                  {editingZone ? '✓ METTRE À JOUR' : '✓ CRÉER ZONE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeofencePage;

// ════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    fontFamily: 'monospace',
    height: 'calc(100vh - 56px - 40px)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '5px'
  },
  title: {
    fontSize: '14px',
    color: '#00ff41',
    letterSpacing: '2px',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textShadow: '0 0 6px rgba(0,255,65,0.4)'
  },
  titleIcon: {
    color: '#00ff41',
    fontSize: '12px',
    textShadow: '0 0 6px #00ff41'
  },
  subtitle: {
    fontSize: '11px',
    color: '#666',
    letterSpacing: '1px',
    marginTop: '4px',
    display: 'block'
  },
  addBtn: {
    padding: '8px 16px',
    background: 'rgba(0,255,65,0.1)',
    border: '1px solid #00ff41',
    color: '#00ff41',
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    borderRadius: '3px',
    cursor: 'pointer',
    boxShadow: '0 0 10px rgba(0,255,65,0.2)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '5px'
  },
  statIcon: {
    fontSize: '24px',
    filter: 'drop-shadow(0 0 6px currentColor)'
  },
  statValue: {
    fontSize: '22px',
    fontWeight: 700,
    fontFamily: 'monospace',
    lineHeight: 1
  },
  statLabel: {
    fontSize: '9px',
    color: '#555',
    letterSpacing: '1.5px',
    marginTop: '4px'
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    gap: '12px',
    minHeight: 0
  },
  sidebar: {
    width: '320px',
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flexShrink: 0
  },
  sidebarHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #1a1a1a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0,255,65,0.02)'
  },
  sidebarTitle: {
    fontSize: '12px',
    color: '#00ff41',
    letterSpacing: '2px',
    margin: 0
  },
  zoneCount: {
    fontSize: '11px',
    color: '#00ff41',
    padding: '2px 8px',
    background: 'rgba(0,255,65,0.1)',
    border: '1px solid rgba(0,255,65,0.3)',
    borderRadius: '3px',
    fontWeight: 700
  },
  zonesList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px'
  },
  empty: {
    padding: '60px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  emptyIcon: {
    fontSize: '32px',
    color: '#333'
  },
  emptyText: {
    color: '#444',
    fontSize: '11px',
    letterSpacing: '2px'
  },
  zoneCard: {
    display: 'flex',
    gap: '10px',
    padding: '12px',
    border: '1px solid',
    borderRadius: '4px',
    marginBottom: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  zoneIndicator: {
    width: '4px',
    borderRadius: '2px',
    flexShrink: 0
  },
  zoneInfo: {
    flex: 1,
    overflow: 'hidden'
  },
  zoneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  zoneName: {
    fontSize: '12px',
    fontWeight: 600
  },
  zoneStatus: {
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '1px'
  },
  zoneMeta: {
    display: 'flex',
    gap: '12px',
    marginBottom: '8px',
    fontSize: '10px',
    color: '#666'
  },
  zoneMetaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  zoneActions: {
    display: 'flex',
    gap: '6px'
  },
  actionBtn: {
    flex: 1,
    padding: '5px 8px',
    background: 'transparent',
    border: '1px solid rgba(0,255,65,0.3)',
    color: '#00ff41',
    fontFamily: 'monospace',
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '1px',
    borderRadius: '3px',
    cursor: 'pointer'
  },
  mapSection: {
    flex: 1,
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  modal: {
    position: 'relative',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'rgba(13,13,13,0.98)',
    border: '1px solid rgba(0,255,65,0.5)',
    borderRadius: '6px',
    boxShadow: '0 0 40px rgba(0,255,65,0.2)'
  },
  modalCorner: {
    position: 'absolute',
    width: '20px',
    height: '20px',
    borderColor: '#00ff41',
    borderStyle: 'solid',
    boxShadow: '0 0 10px #00ff41',
    zIndex: 10
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #1a1a1a',
    background: 'rgba(0,255,65,0.05)'
  },
  modalTitle: {
    fontSize: '13px',
    color: '#00ff41',
    letterSpacing: '2px',
    margin: 0
  },
  modalClose: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '16px'
  },
  form: {
    padding: '20px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '12px'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '14px'
  },
  label: {
    fontSize: '10px',
    color: '#666',
    letterSpacing: '1.5px',
    fontWeight: 700
  },
  input: {
    padding: '8px 12px',
    background: '#000',
    border: '1px solid #1a1a1a',
    borderRadius: '3px',
    color: '#e0e0e0',
    fontSize: '12px',
    fontFamily: 'monospace',
    outline: 'none'
  },
  templates: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  templateBtn: {
    padding: '6px 10px',
    background: 'rgba(0,255,255,0.05)',
    border: '1px dashed rgba(0,255,255,0.3)',
    color: '#00ffff',
    fontSize: '10px',
    fontFamily: 'monospace',
    borderRadius: '3px',
    cursor: 'pointer'
  },
  colorPicker: {
    display: 'flex',
    gap: '10px'
  },
  colorBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    paddingTop: '16px',
    borderTop: '1px solid #1a1a1a'
  },
  cancelBtn: {
    padding: '10px 18px',
    background: 'transparent',
    border: '1px solid #1a1a1a',
    color: '#666',
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    borderRadius: '3px',
    cursor: 'pointer'
  },
  submitBtn: {
    padding: '10px 20px',
    background: 'rgba(0,255,65,0.1)',
    border: '1px solid #00ff41',
    color: '#00ff41',
    fontFamily: 'monospace',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    borderRadius: '3px',
    cursor: 'pointer',
    boxShadow: '0 0 10px rgba(0,255,65,0.2)'
  },

  searchBox: {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '0 10px',
  background: '#000',
  border: '1px solid #1a1a1a',
  borderRadius: '3px',
  margin: '8px 12px',
  height: '32px'
},

searchInput: {
  flex: 1,
  background: 'none',
  border: 'none',
  outline: 'none',
  color: '#e0e0e0',
  fontSize: '11px',
  fontFamily: 'monospace'
},

clearBtn: {
  background: 'none',
  border: 'none',
  color: '#666',
  cursor: 'pointer',
  fontSize: '12px',
  fontFamily: 'monospace'
},

filterTabs: {
  display: 'flex',
  gap: '4px',
  padding: '0 12px 8px'
},

filterBtn: {
  flex: 1,
  padding: '5px 4px',
  background: 'transparent',
  border: '1px solid #1a1a1a',
  borderRadius: '3px',
  color: '#666',
  fontSize: '9px',
  fontFamily: 'monospace',
  fontWeight: 700,
  letterSpacing: '1px',
  cursor: 'pointer',
  transition: 'all 0.2s'
},

filterBtnActive: {
  background: 'rgba(0,255,65,0.1)',
  borderColor: 'rgba(0,255,65,0.4)',
  color: '#00ff41'
},

alertConfig: {
  display: 'flex',
  gap: '4px',
  marginBottom: '8px'
},

alertBadge: {
  fontSize: '8px',
  fontWeight: 700,
  letterSpacing: '1px',
  padding: '2px 6px',
  background: 'rgba(0,255,65,0.05)',
  border: '1px solid rgba(0,255,65,0.3)',
  color: '#00ff41',
  borderRadius: '2px',
  fontFamily: 'monospace'
},

mapOverlay: {
  position: 'absolute',
  top: '14px',
  left: '14px',
  background: 'rgba(13,13,13,0.95)',
  border: '1px solid rgba(0,255,65,0.4)',
  borderRadius: '4px',
  padding: '12px 14px',
  minWidth: '220px',
  boxShadow: '0 0 15px rgba(0,255,65,0.2)',
  backdropFilter: 'blur(8px)',
  zIndex: 1000,
  fontFamily: 'monospace'
},

checkboxLabel: {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '11px',
  color: '#888',
  cursor: 'pointer',
  fontFamily: 'monospace'
},

checkbox: {
  width: '14px',
  height: '14px',
  accentColor: '#00ff41',
  cursor: 'pointer'
},

devicesSelector: {
  background: '#000',
  border: '1px solid #1a1a1a',
  borderRadius: '3px',
  padding: '10px'
},

quickBtn: {
  flex: 1,
  padding: '6px 8px',
  background: 'transparent',
  border: '1px solid rgba(0,255,65,0.2)',
  color: '#00ff41',
  fontFamily: 'monospace',
  fontSize: '9px',
  fontWeight: 700,
  letterSpacing: '1px',
  borderRadius: '3px',
  cursor: 'pointer'
},

devicesList: {
  maxHeight: '180px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
},

deviceItem: {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 10px',
  border: '1px solid',
  borderRadius: '3px',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
},

checkIcon: {
  width: '18px',
  height: '18px',
  border: '1px solid',
  borderRadius: '3px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: 700,
  flexShrink: 0,
  transition: 'all 0.2s ease'
},

};
