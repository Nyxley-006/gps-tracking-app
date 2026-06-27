import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MAP_CONFIG } from '../../utils/constants';
import { getDeviceIcon, getStatusColor, getStatusLabel } from '../../utils/helpers';
import './Map.css';

// ════════════════════════════════════════
//  FIX LEAFLET ICONS
// ════════════════════════════════════════
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// ════════════════════════════════════════
//  CUSTOM MARKER ICON
// ════════════════════════════════════════
const createCustomIcon = (device) => {
  const color = getStatusColor(device.status);
  const emoji = getDeviceIcon(device.type);

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-wrapper" style="--marker-color: ${color}">
        <div class="marker-pulse"></div>
        <div class="marker-body">
          <span class="marker-emoji">${emoji}</span>
        </div>
        <div class="marker-arrow"></div>
      </div>
    `,
    iconSize:    [40, 50],
    iconAnchor:  [20, 50],
    popupAnchor: [0, -50]
  });
};

// ════════════════════════════════════════
//  CENTER MAP ON SELECTED DEVICE
// ════════════════════════════════════════
const CenterMap = ({ device }) => {
  const map = useMap();

  useEffect(() => {
    if (device?.position) {
      map.flyTo(
        [device.position.lat, device.position.lng],
        16,
        { duration: 1.5 }
      );
    }
  }, [device, map]);

  return null;
};

// ════════════════════════════════════════
//  MAP VIEW
// ════════════════════════════════════════
const MapView = ({ devices = [], selectedDevice, onDeviceClick }) => {
  return (
    <MapContainer
      center={MAP_CONFIG.center}
      zoom={MAP_CONFIG.zoom}
      className="map-container"
      zoomControl={true}
    >
      <TileLayer
        url={MAP_CONFIG.tile}
        attribution="© CartoDB"
      />

      <CenterMap device={selectedDevice} />

      {devices.map((device) => (
        <Marker
          key={device.id}
          position={[device.position.lat, device.position.lng]}
          icon={createCustomIcon(device)}
          eventHandlers={{
            click: () => onDeviceClick && onDeviceClick(device)
          }}
        >
          <Popup className="hacker-popup">
            <div className="popup-content">

              {/* Header */}
              <div className="popup-header">
                <span className="popup-emoji">
                  {getDeviceIcon(device.type)}
                </span>
                <span className="popup-name">{device.name}</span>
              </div>

              {/* Status */}
              <div className="popup-status">
                <span
                  className="popup-status-dot"
                  style={{ background: getStatusColor(device.status) }}
                ></span>
                <span style={{ color: getStatusColor(device.status) }}>
                  {getStatusLabel(device.status)}
                </span>
              </div>

              {/* Info Grid */}
              <div className="popup-info-grid">
                <div className="popup-info-item">
                  <span className="popup-label">SPEED</span>
                  <span className="popup-value">{device.speed} km/h</span>
                </div>
                <div className="popup-info-item">
                  <span className="popup-label">BATTERY</span>
                  <span className="popup-value">{device.battery}%</span>
                </div>
                <div className="popup-info-item">
                  <span className="popup-label">DRIVER</span>
                  <span className="popup-value">
                    {device.driver?.name || '--'}
                  </span>
                </div>
                <div className="popup-info-item">
                  <span className="popup-label">IMEI</span>
                  <span className="popup-value">{device.imei}</span>
                </div>
              </div>

              {/* Address */}
              <div className="popup-address">
                <span className="popup-label">LOCATION</span>
                <span className="popup-address-text">
                  {device.position.address || 'Unknown'}
                </span>
              </div>

            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;