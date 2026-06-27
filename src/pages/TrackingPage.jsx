import React, { useState } from 'react';
import useDevices from '../hooks/useDevices';
import MapView from '../components/Map/MapView';
import { getDeviceIcon, getStatusColor, getStatusLabel } from '../utils/helpers';
import { useSelector } from 'react-redux';

const TrackingPage = () => {
   const { allDevices, devices, loading } = useDevices();
   const searchFromHeader = useSelector((state) => state.devices.filter.search);
   const [selectedDevice, setSelectedDevice] = useState(null);
   const [filter, setFilter] = useState('all');
   const [searchQuery, setSearchQuery] = useState('');
  // Filter devices
   // Filter par status
   // Filter par status
let filteredDevices = filter === 'all'
  ? allDevices
  : allDevices.filter(d => d.status === filter);

// Combiner les recherches (header + sidebar)
const combinedSearch = (searchQuery || searchFromHeader || '').toLowerCase().trim();

// Filter par recherche
if (combinedSearch) {
  filteredDevices = filteredDevices.filter(d =>
    d.name?.toLowerCase().includes(combinedSearch) ||
    d.imei?.toLowerCase().includes(combinedSearch) ||
    d.type?.toLowerCase().includes(combinedSearch) ||
    d.driver?.name?.toLowerCase().includes(combinedSearch) ||
    d.position?.address?.toLowerCase().includes(combinedSearch) ||
    d.plateNumber?.toLowerCase().includes(combinedSearch)
  );
}
  const filters = [
    { key: 'all',     label: 'ALL',     count: allDevices.length },
    { key: 'online',  label: 'ONLINE',  count: allDevices.filter(d => d.status === 'online').length  },
    { key: 'idle',    label: 'IDLE',    count: allDevices.filter(d => d.status === 'idle').length    },
    { key: 'offline', label: 'OFFLINE', count: allDevices.filter(d => d.status === 'offline').length }
  ];

  if (loading && allDevices.length === 0) {
    return (
      <div style={styles.loading}>
        <span style={{ color: '#00ff41', fontFamily: 'monospace' }}>
          Loading Map...
        </span>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* ── SIDEBAR LIST ── */}
      <div style={styles.sidebar}>

        {/* Header */}
        <div style={styles.sidebarHeader}>
          <h3 style={styles.sidebarTitle}>
            <span style={{ color: '#00ff41', textShadow: '0 0 6px #00ff41', marginRight: '6px' }}>◆</span> TRACKED DEVICES
          </h3>
          <span style={styles.deviceCount}>
            [{filteredDevices.length}]
          </span>
        </div>
         {/* Search Bar */}
<div style={styles.searchSection}>
  <div style={styles.searchWrapper}>
    <span style={styles.searchIcon}>⌕</span>
    <input
      type="text"
      placeholder="Rechercher..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={styles.searchInput}
    />
    {searchQuery && (
      <button
        style={styles.searchClear}
        onClick={() => setSearchQuery('')}
      >
        ✕
      </button>
    )}
  </div>
</div>

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                ...styles.filterBtn,
                ...(filter === f.key ? styles.filterBtnActive : {})
              }}
            >
              {f.label}
              <span style={styles.filterCount}>{f.count}</span>
            </button>
          ))}
        </div>

        {/* Device List */}
        <div style={styles.deviceList}>
          {filteredDevices.length === 0 ? (
            <div style={styles.empty}>
              <span style={{ color: '#444' }}>No devices found</span>
            </div>
          ) : (
            filteredDevices.map(device => (
              <div
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                style={{
                  ...styles.deviceCard,
                  ...(selectedDevice?.id === device.id ? styles.deviceCardActive : {})
                }}
              >
                {/* Status indicator */}
                <div
                  style={{
                    ...styles.statusIndicator,
                    background: getStatusColor(device.status),
                    boxShadow: `0 0 8px ${getStatusColor(device.status)}`
                  }}
                ></div>

                {/* Device info */}
                <div style={styles.deviceInfo}>
                  <div style={styles.deviceHeader}>
                    <span style={styles.deviceEmoji}>
                      {getDeviceIcon(device.type)}
                    </span>
                    <span style={styles.deviceName}>{device.name}</span>
                  </div>

                  <div style={styles.deviceMeta}>
                    <span style={{
                      ...styles.deviceStatus,
                      color: getStatusColor(device.status)
                    }}>
                      {getStatusLabel(device.status)}
                    </span>
                    <span style={styles.deviceSpeed}>
                      {device.speed} km/h
                    </span>
                  </div>

                  <div style={styles.deviceFooter}>
                    <span style={styles.deviceBattery}>
                      🔋 {device.battery}%
                    </span>
                    <span style={styles.deviceAddress}>
                      📍 {device.position?.address || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── MAP ── */}
      <div style={styles.mapSection}>
        <MapView
          devices={filteredDevices}
          selectedDevice={selectedDevice}
          onDeviceClick={setSelectedDevice}
        />

        {/* Map overlay info */}
        {selectedDevice && (
          <div style={styles.mapOverlay}>
            <div style={styles.overlayHeader}>
              <span style={{ color: '#00ff41' }}>● TRACKING</span>
              <button
                onClick={() => setSelectedDevice(null)}
                style={styles.overlayClose}
              >
                ✕
              </button>
            </div>
            <div style={styles.overlayName}>
              {getDeviceIcon(selectedDevice.type)} {selectedDevice.name}
            </div>
            <div style={styles.overlayCoords}>
              {selectedDevice.position.lat.toFixed(6)}, {selectedDevice.position.lng.toFixed(6)}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default TrackingPage;

// ════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════
const styles = {

  container: {
    display: 'flex',
    height: 'calc(100vh - 56px - 40px)',
    gap: '12px',
    margin: '-20px',
    padding: '20px',
    background: '#0a0a0a'
  },

  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    fontFamily: 'monospace'
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
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(0, 255, 65, 0.02)'
  },

  sidebarTitle: {
    fontSize: '12px',
    color: '#00ff41',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontWeight: 600,
    margin: 0,
    fontFamily: 'monospace',
    textShadow: '0 0 6px rgba(0, 255, 65, 0.4)'
  },

  deviceCount: {
    fontSize: '11px',
    color: '#00ff41',
    padding: '2px 8px',
    background: 'rgba(0, 255, 65, 0.1)',
    border: '1px solid rgba(0, 255, 65, 0.3)',
    borderRadius: '3px',
    fontFamily: 'monospace',
    fontWeight: 700
  },

  filterTabs: {
    display: 'flex',
    padding: '8px',
    gap: '4px',
    borderBottom: '1px solid #1a1a1a'
  },

  filterBtn: {
    flex: 1,
    padding: '6px 4px',
    background: 'transparent',
    border: '1px solid #1a1a1a',
    borderRadius: '3px',
    color: '#666',
    fontSize: '9px',
    fontFamily: 'monospace',
    fontWeight: 700,
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px'
  },

  filterBtnActive: {
    background: 'rgba(0, 255, 65, 0.1)',
    borderColor: 'rgba(0, 255, 65, 0.4)',
    color: '#00ff41',
    boxShadow: '0 0 8px rgba(0, 255, 65, 0.15)'
  },

  filterCount: {
    fontSize: '11px',
    fontWeight: 700
  },

  deviceList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px'
  },

  empty: {
    padding: '40px 20px',
    textAlign: 'center',
    fontFamily: 'monospace',
    fontSize: '11px'
  },

  deviceCard: {
    display: 'flex',
    gap: '10px',
    padding: '12px',
    background: '#0a0a0a',
    border: '1px solid #1a1a1a',
    borderRadius: '4px',
    marginBottom: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative'
  },

  deviceCardActive: {
    background: 'rgba(0, 255, 65, 0.05)',
    borderColor: 'rgba(0, 255, 65, 0.4)',
    boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)'
  },

  statusIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    marginTop: '6px',
    flexShrink: 0
  },

  deviceInfo: {
    flex: 1,
    overflow: 'hidden'
  },

  deviceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px'
  },

  deviceEmoji: {
    fontSize: '14px'
  },

  deviceName: {
    fontSize: '12px',
    color: '#e0e0e0',
    fontFamily: 'monospace',
    fontWeight: 600,
    letterSpacing: '0.5px'
  },

  deviceMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },

  deviceStatus: {
    fontSize: '9px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    fontWeight: 700,
    fontFamily: 'monospace'
  },

  deviceSpeed: {
    fontSize: '10px',
    color: '#00ffff',
    fontFamily: 'monospace',
    fontWeight: 600
  },

  deviceFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px'
  },

  deviceBattery: {
    fontSize: '10px',
    color: '#888',
    fontFamily: 'monospace'
  },

  deviceAddress: {
    fontSize: '10px',
    color: '#666',
    fontFamily: 'monospace',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '140px'
  },

  mapSection: {
    flex: 1,
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '5px',
    overflow: 'hidden',
    position: 'relative'
  },

  mapOverlay: {
    position: 'absolute',
    top: '14px',
    left: '14px',
    background: 'rgba(13, 13, 13, 0.95)',
    border: '1px solid rgba(0, 255, 65, 0.4)',
    borderRadius: '4px',
    padding: '12px 14px',
    minWidth: '220px',
    boxShadow: '0 0 15px rgba(0, 255, 65, 0.2)',
    fontFamily: 'monospace',
    backdropFilter: 'blur(8px)',
    zIndex: 1000
  },

  overlayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    fontSize: '9px',
    letterSpacing: '2px',
    fontWeight: 700
  },

  overlayClose: {
    background: 'transparent',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
    transition: 'color 0.2s ease',
    fontFamily: 'monospace'
  },

  overlayName: {
    fontSize: '13px',
    color: '#e0e0e0',
    fontWeight: 600,
    marginBottom: '4px',
    letterSpacing: '0.5px'
  },

  overlayCoords: {
    fontSize: '10px',
    color: '#00ffff',
    letterSpacing: '1px',
    textShadow: '0 0 4px rgba(0, 255, 255, 0.4)'
  },

   searchSection: {
  padding: '10px 12px',
  borderBottom: '1px solid #1a1a1a'
},

searchWrapper: {
  display: 'flex',
  alignItems: 'center',
  background: '#000',
  border: '1px solid #1a1a1a',
  borderRadius: '3px',
  padding: '0 10px',
  height: '32px',
  transition: 'all 0.2s ease'
},

searchIcon: {
  color: '#444',
  fontSize: '14px',
  marginRight: '8px',
  flexShrink: 0
},

searchInput: {
  flex: 1,
  background: 'none',
  border: 'none',
  outline: 'none',
  color: '#e0e0e0',
  fontSize: '11px',
  fontFamily: 'monospace',
  letterSpacing: '0.5px',
  minWidth: 0
},

searchClear: {
  background: 'none',
  border: 'none',
  color: '#666',
  cursor: 'pointer',
  fontSize: '12px',
  padding: '0 4px',
  fontFamily: 'monospace',
  flexShrink: 0
},
}
