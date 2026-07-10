import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import useAlerts from '../hooks/useAlerts';
import { ALERT_TYPES, SEVERITY_COLORS } from '../utils/constants';
import { formatDate, timeAgo } from '../utils/helpers';

// ════════════════════════════════════════
//  AGENCES SPÉCIALISÉES
// ════════════════════════════════════════
const AGENTS = [
  // ── URGENCE ──
  { name: 'Unité Alpha-1 Rescue',     specialty: 'urgence',     phone: '0341253478' },
  { name: 'Brigade Sigma Tactical',   specialty: 'urgence',     phone: '0342689134' },
  { name: 'Squad Delta Emergency',    specialty: 'urgence',     phone: '0343547892' },

  // ── TRACKING ──
  { name: 'Cyber Track Division',     specialty: 'tracking',    phone: '0344196325' },
  { name: 'GPS Hunter Squad',         specialty: 'tracking',    phone: '0345732618' },
  { name: 'Recon Falcon Unit',        specialty: 'tracking',    phone: '0346285947' },

  // ── MAINTENANCE ──
  { name: 'Tech Repair Center',       specialty: 'maintenance', phone: '0347461259' },
  { name: 'Hardware Fix Brigade',     specialty: 'maintenance', phone: '0348923574' },
  { name: 'System Diagnostic Team',   specialty: 'maintenance', phone: '0349358742' },

  // ── CONTACT ──
  { name: 'Communication Center',     specialty: 'contact',     phone: '0340517896' },
  { name: 'Field Operations Desk',    specialty: 'contact',     phone: '0340892354' },
  { name: 'Driver Support Hub',       specialty: 'contact',     phone: '0340674128' }
];

// ════════════════════════════════════════
//  ATTRIBUER UN AGENT SELON TYPE D'ALERTE
// ════════════════════════════════════════
const getAgentForAlert = (alertType, severity) => {
  let preferredSpecialty;

  // Mapping type → spécialité
  switch (alertType) {
    case 'sos':
    case 'speeding':
      preferredSpecialty = 'urgence';
      break;
    case 'lowBattery':
    case 'lowFuel':
    case 'maintenance':
      preferredSpecialty = 'maintenance';
      break;
    case 'geofence':
    case 'disconnect':
      preferredSpecialty = 'tracking';
      break;
    case 'ignition':
    default:
      preferredSpecialty = 'contact';
      break;
  }

  // Si danger → forcer urgence
  if (severity === 'danger') {
    preferredSpecialty = 'urgence';
  }

  // Filtrer les agents de la spécialité
  const matchingAgents = AGENTS.filter(a => a.specialty === preferredSpecialty);

  // Choisir un agent aléatoire
  const agent = matchingAgents.length > 0
    ? matchingAgents[Math.floor(Math.random() * matchingAgents.length)]
    : AGENTS[Math.floor(Math.random() * AGENTS.length)];

  return agent;
};
// ════════════════════════════════════════
//  ALERT ICONS
// ════════════════════════════════════════
const ALERT_ICONS = {
  speeding:    '⚡',
  lowBattery:  '🔋',
  geofence:    '⬡',
  ignition:    '◉',
  sos:         '⚠',
  disconnect:  '✖',
  lowFuel:     '⛽',
  maintenance: '⚙'
};

const AlertsPage = () => {
  const {
    alerts: allAlerts,
    allAlerts: list,
    stats,
    markOneAsRead,
    markAll,
    removeAlert,
    removeAllRead,
    refresh
  } = useAlerts();

  const [filter, setFilter] = useState('all');
  const [interventions, setInterventions] = useState(
  JSON.parse(localStorage.getItem('interventions') || '[]')
);
  const [showInterventionModal, setShowInterventionModal] = useState(false);
const [currentAlert, setCurrentAlert] = useState(null);
const [interventionData, setInterventionData] = useState({
  message: '',
  action: 'contact',
  priority: 'normal',
  agent: '',
  agentPhone: '',
  agentSpecialty: ''
});
const [interventionHistory, setInterventionHistory] = useState([]);
  const searchFromHeader = useSelector((state) => state.devices.filter.search);

  // ── Filter alerts ──
  let filteredAlerts = [...list];

  if (filter === 'unread') {
    filteredAlerts = filteredAlerts.filter(a => !a.read);
  } else if (filter === 'danger') {
    filteredAlerts = filteredAlerts.filter(a => a.severity === 'danger');
  } else if (filter === 'warning') {
    filteredAlerts = filteredAlerts.filter(a => a.severity === 'warning');
  } else if (filter === 'info') {
    filteredAlerts = filteredAlerts.filter(a => a.severity === 'info');
  }

  // ── Search filter ──
  const search = (searchFromHeader || '').toLowerCase().trim();
  if (search) {
    filteredAlerts = filteredAlerts.filter(a =>
      a.message?.toLowerCase().includes(search) ||
      a.deviceName?.toLowerCase().includes(search) ||
      a.type?.toLowerCase().includes(search)
    );
  }

  // Tri par timestamp décroissant
  filteredAlerts.sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const filters = [
    { key: 'all',     label: 'TOUTES',  count: stats.total,   color: '#00ff41' },
    { key: 'unread',  label: 'NON LUES', count: stats.unread,  color: '#00ffff' },
    { key: 'danger',  label: 'CRITIQUES', count: stats.danger,  color: '#ff003c' },
    { key: 'warning', label: 'WARNINGS', count: stats.warning, color: '#ff6600' },
    { key: 'info',    label: 'INFO',    count: stats.info,    color: '#00ffff' }
  ];

   // ════════════════════════════════════════
//  INTERVENTION
// ════════════════════════════════════════
const openIntervention = (alert) => {
  setCurrentAlert(alert);

  // Coordonnées GPS
  let gpsInfo = '';
  if (alert.position?.lat) {
    gpsInfo = `\n📍 Position: ${alert.position.lat.toFixed(5)}, ${alert.position.lng.toFixed(5)}`;
    if (alert.position.address) {
      gpsInfo += `\n📌 Adresse: ${alert.position.address}`;
    }
  }

  // ✅ Agent automatique selon type d'alerte
  const autoAgent = getAgentForAlert(alert.type, alert.severity);

  setInterventionData({
    message: `Intervention pour: ${alert.message}${gpsInfo}`,
    action: 'contact',
    priority: alert.severity === 'danger' ? 'urgent' : 'normal',
    agent: autoAgent.name,
    agentPhone: autoAgent.phone,
    agentSpecialty: autoAgent.specialty
  });

  setShowInterventionModal(true);
};

const handleInterventionSubmit = (e) => {
  e.preventDefault();

  if (!interventionData.message.trim() || !interventionData.agent.trim()) {
    window.alert('⚠ Veuillez remplir tous les champs');
    return;
  }

  const intervention = {
  id: Date.now(),
  alertId: currentAlert.id,
  deviceName: currentAlert.deviceName,
  deviceId: currentAlert.deviceId,
  alertType: currentAlert.type,
  alertMessage: currentAlert.message,
  severity: currentAlert.severity,
  position: currentAlert.position,
  // ✅ Infos complètes agent
  agentName: interventionData.agent,
  agentPhone: interventionData.agentPhone,
  agentSpecialty: interventionData.agentSpecialty,
  message: interventionData.message,
  action: interventionData.action,
  priority: interventionData.priority,
  timestamp: new Date().toISOString(),
  status: 'sent'
};  

  const existing = JSON.parse(localStorage.getItem('interventions') || '[]');
  existing.unshift(intervention);
  localStorage.setItem('interventions', JSON.stringify(existing));

  setInterventions(existing);
  markOneAsRead(currentAlert.id);

  window.alert(
  `✓ INTERVENTION ENVOYÉE\n\n` +
  `👤 Agent: ${interventionData.agent}\n` +
  `🎯 Spécialité: ${interventionData.agentSpecialty?.toUpperCase()}\n` +
  `📞 Téléphone: ${interventionData.agentPhone}\n` +
  `⚡ Action: ${interventionData.action.toUpperCase()}\n` +
  `🚨 Priorité: ${interventionData.priority.toUpperCase()}\n` +
  `📱 Device: ${currentAlert.deviceName}`
);

  setShowInterventionModal(false);
  setCurrentAlert(null);
  setInterventionData({
  message: '',
  action: 'contact',
  priority: 'normal',
  agent: '',
  agentPhone: '',
  agentSpecialty: ''
});

  // ✅ Force re-render
  setTimeout(() => {
    setInterventions(JSON.parse(localStorage.getItem('interventions') || '[]'));
  }, 100);
};

const handleInterventionChange = (field, value) => {
  setInterventionData({ ...interventionData, [field]: value });
};

// Templates rapides
const quickTemplates = {
  sos: 'Équipe de secours envoyée. Tentative de contact en cours avec le conducteur.',
  speeding: 'Avertissement envoyé au conducteur. Surveillance renforcée activée.',
  lowBattery: 'Notification envoyée au conducteur pour recharger l\'appareil.',
  lowFuel: 'Alerte envoyée au conducteur. Station-service la plus proche recommandée.',
  disconnect: 'Tentative de reconnexion en cours. Contact prévu avec le conducteur.',
  geofence: 'Vérification de la zone en cours. Contact établi avec le conducteur.',
  ignition: 'Information enregistrée. Aucune action requise.',
  maintenance: 'Rendez-vous garage planifié. Notification envoyée au gestionnaire.'
};

const applyTemplate = (type) => {
  if (quickTemplates[type]) {
    setInterventionData({
      ...interventionData,
      message: quickTemplates[type]
    });
  }
};

// Vérifier si une alerte a déjà eu une intervention
const isAlertHandled = (alertId) => {
  return interventions.some(i => i.alertId === alertId);
};

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            <span style={styles.titleIcon}>◆</span> ALERTS CENTER
          </h2>
          <span style={styles.subtitle}>
            {stats.unread} non lues sur {stats.total} alertes
          </span>
        </div>

        <div style={styles.headerActions}>
      
          {stats.unread > 0 && (
            <button
              style={{...styles.actionBtn, borderColor: '#00ffff', color: '#00ffff'}}
              onClick={markAll}
            >
              ✓ TOUT LIRE
            </button>
          )}
          {stats.total - stats.unread > 0 && (
            <button
              style={{...styles.actionBtn, borderColor: '#ff003c', color: '#ff003c'}}
              onClick={() => {
                if (window.confirm('Supprimer toutes les alertes lues ?')) {
                  removeAllRead();
                }
              }}
            >
              ✕ NETTOYER LUES
            </button>
          )}
        </div>
      </div>

      {/* FILTER TABS */}
      <div style={styles.filterTabs}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              ...styles.filterBtn,
              ...(filter === f.key ? {
                ...styles.filterBtnActive,
                borderColor: f.color,
                color: f.color,
                boxShadow: `0 0 10px ${f.color}30`
              } : {})
            }}
          >
            <span style={styles.filterLabel}>{f.label}</span>
            <span style={{
              ...styles.filterCount,
              color: filter === f.key ? f.color : '#666'
            }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* ALERTS LIST */}
      <div style={styles.alertsList}>
        {filteredAlerts.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyIcon}>◯</span>
            <span style={styles.emptyText}>Aucune alerte</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const color = SEVERITY_COLORS[alert.severity] || '#666';
            const icon  = ALERT_ICONS[alert.type] || '⚠';
            const typeInfo = ALERT_TYPES[alert.type] || { label: alert.type };

            return (
              <div
                key={alert.id}
                style={{
                  ...styles.alertCard,
                  borderColor: alert.read ? '#1a1a1a' : `${color}50`,
                  background: alert.read ? '#0d0d0d' : `${color}08`
                }}
                onClick={() => !alert.read && markOneAsRead(alert.id)}
              >
                {/* Side indicator */}
                <div
                  style={{
                    ...styles.alertIndicator,
                    background: color,
                    boxShadow: !alert.read ? `0 0 8px ${color}` : 'none',
                    opacity: alert.read ? 0.3 : 1
                  }}
                ></div>

                {/* Icon */}
                <div
                  style={{
                    ...styles.alertIcon,
                    color: color,
                    borderColor: `${color}40`,
                    background: `${color}10`,
                    textShadow: !alert.read ? `0 0 8px ${color}` : 'none'
                  }}
                >
                  {icon}
                </div>

                {/* Content */}
                <div style={styles.alertContent}>
                  <div style={styles.alertHeader}>
  <span style={{
    ...styles.alertType,
    color: color
  }}>
    {typeInfo.label}
  </span>

  {/* ✅ Badge selon état */}
  {isAlertHandled(alert.id) ? (
    <span style={styles.handledBadge}>
      ✓ INTERVENTION OK
    </span>
  ) : !alert.read ? (
    <span style={styles.unreadDot}>● NOUVEAU</span>
  ) : (
    <span style={styles.readBadge}>○ LUE</span>
  )}
</div>
                  <div style={styles.alertMessage}>
                    {alert.message}
                  </div>

                  
                  
                </div>

                {/* Delete button */}
               {/* Actions */}
<div style={styles.alertActions}>
  
  {isAlertHandled(alert.id) ? (
  <button
    style={{
      ...styles.interventionBtn,
      borderColor: 'rgba(0, 255, 65, 0.4)',
      color: '#00ff41',
      background: 'rgba(0, 255, 65, 0.05)',
      cursor: 'not-allowed'
    }}
    disabled
    title="Déjà traitée"
  >
    ✓ TRAITÉE
  </button>
) : (
  <button
    style={{
      ...styles.interventionBtn,
      borderColor: `${color}50`,
      color: color
    }}
    onClick={(e) => {
      e.stopPropagation();
      openIntervention(alert);
    }}
    title="Intervenir"
  >
    ⚡ INTERVENIR
  </button>
)}
  
  <button
    style={styles.deleteBtn}
    onClick={(e) => {
      e.stopPropagation();
      if (window.confirm('Supprimer cette alerte ?')) {
        removeAlert(alert.id);
      }
    }}
    title="Supprimer"
  >
    ✕
  </button>
</div>
              </div>
            );
          })
        )}
      </div>

      {/* ════════════════════════════════════════
    MODAL INTERVENTION
════════════════════════════════════════ */}
{showInterventionModal && currentAlert && (
  <div
    style={styles.overlay}
    onClick={() => setShowInterventionModal(false)}
  >
    <div
      style={styles.modal}
      onClick={(e) => e.stopPropagation()}
    >

      {/* Corners */}
      <span style={{...styles.modalCorner, top: 0, left: 0, borderWidth: '2px 0 0 2px'}}></span>
      <span style={{...styles.modalCorner, top: 0, right: 0, borderWidth: '2px 2px 0 0'}}></span>
      <span style={{...styles.modalCorner, bottom: 0, left: 0, borderWidth: '0 0 2px 2px'}}></span>
      <span style={{...styles.modalCorner, bottom: 0, right: 0, borderWidth: '0 2px 2px 0'}}></span>

      {/* Header */}
      <div style={styles.modalHeader}>
        <h3 style={styles.modalTitle}>
          ⚡ PROTOCOLE D'INTERVENTION
        </h3>
        <button
          style={styles.modalClose}
          onClick={() => setShowInterventionModal(false)}
        >
          ✕
        </button>
      </div>

      {/* Alert Info Card */}
      <div style={{
        ...styles.alertInfoCard,
        borderColor: SEVERITY_COLORS[currentAlert.severity] || '#666',
        background: `${SEVERITY_COLORS[currentAlert.severity]}10`
      }}>
        <div style={styles.alertInfoHeader}>
          <span style={{
            color: SEVERITY_COLORS[currentAlert.severity],
            fontSize: '20px'
          }}>
            {ALERT_ICONS[currentAlert.type] || '⚠'}
          </span>
          <div style={styles.alertInfoText}>
            <span style={{
              color: SEVERITY_COLORS[currentAlert.severity],
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '2px'
            }}>
              {(ALERT_TYPES[currentAlert.type]?.label || currentAlert.type).toUpperCase()}
            </span>
            <span style={{
              color: '#e0e0e0',
              fontSize: '13px',
              marginTop: '4px'
            }}>
              {currentAlert.message}
            </span>
            
            <span style={{
  color: '#00ff41',
  fontSize: '10px',
  marginTop: '4px',
  letterSpacing: '1px'
}}>
  ◉ {currentAlert.deviceName}
</span>

{currentAlert.position?.lat && (
  <div style={{
    marginTop: '8px',
    padding: '6px 10px',
    background: 'rgba(0,255,255,0.05)',
    border: '1px solid rgba(0,255,255,0.2)',
    borderRadius: '3px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  }}>
    <span style={{
      color: '#00ffff',
      fontSize: '9px',
      letterSpacing: '1.5px',
      fontWeight: 700
    }}>
      📍 COORDONNÉES GPS
    </span>
    <span style={{
      color: '#e0e0e0',
      fontSize: '11px',
      fontFamily: 'monospace'
    }}>
      LAT: {currentAlert.position.lat.toFixed(6)}
    </span>
    <span style={{
      color: '#e0e0e0',
      fontSize: '11px',
      fontFamily: 'monospace'
    }}>
      LNG: {currentAlert.position.lng.toFixed(6)}
    </span>
    {currentAlert.position.address && (
      <span style={{
        color: '#00ffff',
        fontSize: '10px',
        marginTop: '2px'
      }}>
        📌 {currentAlert.position.address}
      </span>
    )}
  </div>
)}

          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleInterventionSubmit} style={styles.form}>

        {/* Agent */}
        <div style={styles.field}>
  <label style={styles.label}>
    UNITÉ D'INTERVENTION * <span style={{ color: '#00ff41', fontSize: '9px' }}>
      (auto-assigné)
    </span>
  </label>

  <select
  required
  value={interventionData.agent}
  onChange={(e) => {
    const selected = AGENTS.find(a => a.name === e.target.value);
    setInterventionData({
      ...interventionData,
      agent: e.target.value,
      agentPhone: selected?.phone || '',
      agentSpecialty: selected?.specialty || ''
    });
  }}
  style={styles.input}
>
  <option value="">-- Sélectionner une unité --</option>

  <optgroup label="🚨 URGENCE">
    {AGENTS.filter(a => a.specialty === 'urgence').map(a => (
      <option key={a.name} value={a.name}>{a.name}</option>
    ))}
  </optgroup>

  <optgroup label="🎯 TRACKING">
    {AGENTS.filter(a => a.specialty === 'tracking').map(a => (
      <option key={a.name} value={a.name}>{a.name}</option>
    ))}
  </optgroup>

  <optgroup label="🔧 MAINTENANCE">
    {AGENTS.filter(a => a.specialty === 'maintenance').map(a => (
      <option key={a.name} value={a.name}>{a.name}</option>
    ))}
  </optgroup>

  <optgroup label="📞 CONTACT">
    {AGENTS.filter(a => a.specialty === 'contact').map(a => (
      <option key={a.name} value={a.name}>{a.name}</option>
    ))}
  </optgroup>
</select>

  {/* Info agent sélectionné */}
  {interventionData.agent && (
    <div style={{
      marginTop: '8px',
      padding: '8px 10px',
      background: 'rgba(0, 255, 65, 0.05)',
      border: '1px solid rgba(0, 255, 65, 0.2)',
      borderRadius: '3px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      fontSize: '10px',
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#666' }}>👤 Agent :</span>
        <span style={{ color: '#00ff41', fontWeight: 700 }}>
          {interventionData.agent}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#666' }}>🎯 Spécialité :</span>
        <span style={{ color: '#00ffff' }}>
          {interventionData.agentSpecialty?.toUpperCase()}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#666' }}>📞 Téléphone :</span>
        <span style={{ color: '#e0e0e0' }}>
          {interventionData.agentPhone}
        </span>
      </div>
    </div>
  )}
</div>

        {/* Action + Priority */}
        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>TYPE D'ACTION *</label>
            <select
              value={interventionData.action}
              onChange={(e) => handleInterventionChange('action', e.target.value)}
              style={styles.input}
            >
              <option value="contact">📞 Contacter conducteur</option>
              <option value="dispatch">🚓 Envoyer équipe</option>
              <option value="track">🎯 Tracking renforcé</option>
              <option value="notify">📧 Notification</option>
              <option value="emergency">🚨 Urgence absolue</option>
              <option value="maintenance">🔧 Maintenance</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>PRIORITÉ *</label>
            <select
              value={interventionData.priority}
              onChange={(e) => handleInterventionChange('priority', e.target.value)}
              style={styles.input}
            >
              <option value="low">🟢 Basse</option>
              <option value="normal">🔵 Normale</option>
              <option value="high">🟠 Élevée</option>
              <option value="urgent">🔴 URGENT</option>
            </select>
          </div>
        </div>

        {/* Templates */}
        <div style={styles.field}>
          <label style={styles.label}>TEMPLATE RAPIDE</label>
          <button
            type="button"
            onClick={() => applyTemplate(currentAlert.type)}
            style={styles.templateBtn}
          >
            ⚡ Utiliser template pour "{ALERT_TYPES[currentAlert.type]?.label || currentAlert.type}"
          </button>
        </div>

        {/* Message */}
        <div style={styles.field}>
          <label style={styles.label}>
            MESSAGE D'INTERVENTION *
            <span style={{ color: '#444', fontSize: '9px', marginLeft: '6px' }}>
              ({interventionData.message.length} caractères)
            </span>
          </label>
          <textarea
            required
            value={interventionData.message}
            onChange={(e) => handleInterventionChange('message', e.target.value)}
            style={{...styles.input, minHeight: '100px', resize: 'vertical', fontFamily: 'monospace'}}
            placeholder="Décrivez l'intervention à effectuer..."
          />
        </div>

        {/* Info */}
        <div style={styles.infoBox}>
          <span style={{ color: '#00ffff' }}>ℹ</span>
          <span>
            Cette intervention sera envoyée à l'agent et tracée dans le système.
            L'alerte sera automatiquement marquée comme traitée.
          </span>
        </div>

        {/* Actions */}
        <div style={styles.modalActions}>
          <button
            type="button"
            style={styles.cancelBtn}
            onClick={() => setShowInterventionModal(false)}
          >
            ANNULER
          </button>
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              borderColor: interventionData.priority === 'urgent' ? '#ff003c' : '#00ff41',
              color: interventionData.priority === 'urgent' ? '#ff003c' : '#00ff41',
              boxShadow: `0 0 10px ${interventionData.priority === 'urgent' ? 'rgba(255,0,60,0.3)' : 'rgba(0,255,65,0.3)'}`
            }}
          >
            {interventionData.priority === 'urgent' ? '🚨 ENVOYER URGENT' : '✓ ENVOYER INTERVENTION'}
          </button>
        </div>

      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default AlertsPage;

// ════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    fontFamily: 'monospace'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
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

  headerActions: {
    display: 'flex',
    gap: '8px'
  },

  actionBtn: {
    padding: '8px 14px',
    background: 'transparent',
    border: '1px solid rgba(0,255,65,0.3)',
    color: '#00ff41',
    fontFamily: 'monospace',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    borderRadius: '3px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  filterTabs: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '5px'
  },

  filterBtn: {
    flex: 1,
    padding: '10px 8px',
    background: 'transparent',
    border: '1px solid #1a1a1a',
    borderRadius: '3px',
    color: '#666',
    fontFamily: 'monospace',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },

  filterBtnActive: {
    background: 'rgba(0,255,65,0.05)'
  },

  filterLabel: {
    fontSize: '9px',
    letterSpacing: '1.5px'
  },

  filterCount: {
    fontSize: '16px',
    fontWeight: 700
  },

  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  empty: {
    padding: '60px 20px',
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },

  emptyIcon: {
    fontSize: '40px',
    color: '#333'
  },

  emptyText: {
    color: '#444',
    fontSize: '12px',
    letterSpacing: '2px'
  },

  alertCard: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '12px',
    padding: '14px',
    background: '#0d0d0d',
    border: '1px solid #1a1a1a',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden'
  },

  alertIndicator: {
    width: '3px',
    borderRadius: '2px',
    flexShrink: 0,
    transition: 'all 0.2s ease'
  },

  alertIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '4px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
    transition: 'all 0.2s ease'
  },

  alertContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0
  },

  alertHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px'
  },

  alertType: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '2px',
    textTransform: 'uppercase'
  },

  unreadDot: {
    fontSize: '9px',
    color: '#00ffff',
    letterSpacing: '1.5px',
    fontWeight: 700,
    textShadow: '0 0 6px #00ffff',
    animation: 'blink 1.5s infinite'
  },

  handledBadge: {
  fontSize: '9px',
  color: '#00ff41',
  letterSpacing: '1.5px',
  fontWeight: 700,
  padding: '3px 10px',
  background: 'rgba(0, 255, 65, 0.1)',
  border: '1px solid rgba(0, 255, 65, 0.4)',
  borderRadius: '3px',
  textShadow: '0 0 6px #00ff41',
  fontFamily: 'monospace'
},

readBadge: {
  fontSize: '9px',
  color: '#666',
  letterSpacing: '1.5px',
  fontWeight: 600,
  padding: '3px 10px',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid #1a1a1a',
  borderRadius: '3px',
  fontFamily: 'monospace'
},

  alertMessage: {
    fontSize: '13px',
    color: '#e0e0e0',
    fontWeight: 500,
    letterSpacing: '0.5px'
  },

  alertFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    fontSize: '10px',
    color: '#666'
  },

  alertDevice: {
    color: '#00ff41',
    fontWeight: 600,
    letterSpacing: '0.5px'
  },

  alertTime: {
    color: '#888'
  },

  alertDate: {
    color: '#555',
    marginLeft: 'auto'
  },

  deleteBtn: {
    width: '28px',
    height: '28px',
    background: 'transparent',
    border: '1px solid rgba(255,0,60,0.2)',
    color: '#ff003c',
    cursor: 'pointer',
    borderRadius: '3px',
    fontFamily: 'monospace',
    fontSize: '12px',
    fontWeight: 700,
    transition: 'all 0.2s ease',
    flexShrink: 0,
    alignSelf: 'center'
  },

  alertActions: {
  display: 'flex',
  gap: '6px',
  alignSelf: 'center'
},

interventionBtn: {
  padding: '8px 12px',
  background: 'transparent',
  border: '1px solid',
  borderRadius: '3px',
  fontFamily: 'monospace',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '1px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap'
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
  maxWidth: '650px',
  maxHeight: '90vh',
  overflowY: 'auto',
  background: 'rgba(13, 13, 13, 0.98)',
  border: '1px solid rgba(0,255,65,0.5)',
  borderRadius: '6px',
  boxShadow: '0 0 40px rgba(0,255,65,0.2)',
  fontFamily: 'monospace'
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
  margin: 0,
  textShadow: '0 0 6px rgba(0,255,65,0.4)'
},

modalClose: {
  background: 'none',
  border: 'none',
  color: '#666',
  cursor: 'pointer',
  fontSize: '16px',
  fontFamily: 'monospace'
},

alertInfoCard: {
  margin: '16px 20px',
  padding: '14px',
  border: '1px solid',
  borderRadius: '4px'
},

alertInfoHeader: {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start'
},

alertInfoText: {
  display: 'flex',
  flexDirection: 'column',
  flex: 1
},

form: {
  padding: '0 20px 20px'
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
  marginBottom: '12px'
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

templateBtn: {
  padding: '10px',
  background: 'rgba(0,255,255,0.05)',
  border: '1px dashed rgba(0,255,255,0.3)',
  borderRadius: '3px',
  color: '#00ffff',
  fontSize: '11px',
  fontFamily: 'monospace',
  cursor: 'pointer',
  letterSpacing: '0.5px',
  transition: 'all 0.2s ease'
},

infoBox: {
  display: 'flex',
  gap: '10px',
  padding: '10px 12px',
  background: 'rgba(0,255,255,0.05)',
  border: '1px solid rgba(0,255,255,0.2)',
  borderRadius: '3px',
  fontSize: '10px',
  color: '#888',
  lineHeight: 1.5,
  marginBottom: '16px'
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

alertGps: {
  color: '#00ffff',
  fontSize: '10px',
  letterSpacing: '0.5px',
  textShadow: '0 0 4px rgba(0,255,255,0.4)',
  fontFamily: 'monospace'
},

submitBtn: {
  padding: '10px 20px',
  background: 'transparent',
  border: '1px solid',
  fontFamily: 'monospace',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '1.5px',
  borderRadius: '3px',
  cursor: 'pointer'
}
};