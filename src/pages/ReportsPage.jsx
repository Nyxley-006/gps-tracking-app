import React, { useState, useEffect } from 'react';
import useDevices from '../hooks/useDevices';
import useAlerts from '../hooks/useAlerts';
import { getDeviceIcon, formatDate } from '../utils/helpers';

const ReportsPage = () => {
  const { allDevices } = useDevices();
  const { allAlerts } = useAlerts();

  const [interventions, setInterventions] = useState([]);
  const [period, setPeriod] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAllInterventions, setShowAllInterventions] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('interventions') || '[]');
    setInterventions(data);
  }, []);

  // ── Refresh interventions ──
  const refreshInterventions = () => {
    const data = JSON.parse(localStorage.getItem('interventions') || '[]');
    setInterventions(data);
  };

  // ── Reset filters ──
  const resetFilters = () => {
    setPeriod('all');
    setSelectedDevice('all');
    setSearchQuery('');
    setSortBy('date');
    setSortOrder('desc');
  };

  // ── Filtres période ──
  const filterByPeriod = (items) => {
    if (period === 'all') return items;
    const now = Date.now();
    const periods = {
      'today':  24 * 60 * 60 * 1000,
      'week':   7 * 24 * 60 * 60 * 1000,
      'month':  30 * 24 * 60 * 60 * 1000
    };
    const cutoff = now - (periods[period] || 0);
    return items.filter(item => new Date(item.timestamp).getTime() >= cutoff);
  };

  // ── Filtres device ──
  const filterByDevice = (items, deviceKey = 'deviceId') => {
    if (selectedDevice === 'all') return items;
    return items.filter(item => item[deviceKey] === parseInt(selectedDevice));
  };

  // ── Filtres recherche ──
  const filterBySearch = (items, fields) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item =>
      fields.some(f => {
        const value = f.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(q);
      })
    );
  };

  // ── Tri ──
  const sortItems = (items, key) => {
    return [...items].sort((a, b) => {
      let valA, valB;

      if (key === 'date') {
        valA = new Date(a.timestamp).getTime();
        valB = new Date(b.timestamp).getTime();
      } else if (key === 'device') {
        valA = (a.deviceName || '').toLowerCase();
        valB = (b.deviceName || '').toLowerCase();
      } else if (key === 'severity') {
        const order = { danger: 3, warning: 2, info: 1 };
        valA = order[a.severity] || 0;
        valB = order[b.severity] || 0;
      } else if (key === 'priority') {
        const order = { urgent: 4, high: 3, normal: 2, low: 1 };
        valA = order[a.priority] || 0;
        valB = order[b.priority] || 0;
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  };

  // ── Application des filtres ──
  const filteredAlerts = sortItems(
    filterBySearch(
      filterByDevice(filterByPeriod(allAlerts)),
      ['message', 'deviceName', 'type', 'severity']
    ),
    sortBy
  );

  const filteredInterventions = sortItems(
    filterBySearch(
      filterByDevice(filterByPeriod(interventions)),
      ['message', 'deviceName', 'agentName', 'agent', 'action']
    ),
    sortBy === 'severity' ? 'priority' : sortBy
  );

  const displayedInterventions = showAllInterventions
    ? filteredInterventions
    : filteredInterventions.slice(0, 20);

  // ── KPIs ──
  const totalDistance = allDevices.reduce((sum, d) => sum + (d.totalDistance || 0), 0);
  const avgSpeed = allDevices.length > 0
    ? Math.round(allDevices.reduce((sum, d) => sum + (d.speed || 0), 0) / allDevices.length)
    : 0;
  const avgBattery = allDevices.length > 0
    ? Math.round(allDevices.reduce((sum, d) => sum + (d.battery || 0), 0) / allDevices.length)
    : 0;

  // ── Distance top 10 ──
  const distanceData = [...allDevices]
    .sort((a, b) => (b.totalDistance || 0) - (a.totalDistance || 0))
    .slice(0, 10);
  const maxDistance = Math.max(...distanceData.map(d => d.totalDistance || 0), 1);

  // ── Status ──
  const statusData = [
    { label: 'ONLINE',  value: allDevices.filter(d => d.status === 'online').length,  color: '#00ff41' },
    { label: 'IDLE',    value: allDevices.filter(d => d.status === 'idle').length,    color: '#ff6600' },
    { label: 'OFFLINE', value: allDevices.filter(d => d.status === 'offline').length, color: '#ff003c' }
  ];
  const totalStatus = statusData.reduce((sum, s) => sum + s.value, 0) || 1;

  // ── Sévérité ──
  const severityData = [
    { label: 'DANGER',  value: filteredAlerts.filter(a => a.severity === 'danger').length,  color: '#ff003c' },
    { label: 'WARNING', value: filteredAlerts.filter(a => a.severity === 'warning').length, color: '#ff6600' },
    { label: 'INFO',    value: filteredAlerts.filter(a => a.severity === 'info').length,    color: '#00ffff' }
  ];

  // ── Export ──
  const exportCSV = () => {
    const headers = ['Type', 'Device', 'Message', 'Sévérité', 'Date', 'Status'];
    const rows = filteredAlerts.map(a => [
      a.type,
      a.deviceName || '',
      `"${(a.message || '').replace(/"/g, '""')}"`,
      a.severity,
      formatDate(a.timestamp),
      a.read ? 'Lue' : 'Non lue'
    ]);
    downloadCSV([headers, ...rows], `alertes-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportInterventionsCSV = () => {
    const headers = ['Date', 'Unité', 'Spécialité', 'Téléphone', 'Device', 'Action', 'Priorité', 'Message'];
    const rows = filteredInterventions.map(i => [
      formatDate(i.timestamp),
      i.agentName || i.agent || '',
      i.agentSpecialty || '',
      i.agentPhone || '',
      i.deviceName || '',
      i.action || '',
      i.priority || '',
      `"${(i.message || '').replace(/"/g, '""')}"`
    ]);
    downloadCSV([headers, ...rows], `interventions-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportDevicesCSV = () => {
    const headers = ['Nom', 'Type', 'IMEI', 'Plaque', 'Status', 'Vitesse', 'Batterie', 'Distance', 'Conducteur'];
    const rows = allDevices.map(d => [
      d.name,
      d.type,
      d.imei,
      d.plateNumber || '',
      d.status,
      d.speed || 0,
      d.battery || 0,
      d.totalDistance || 0,
      d.driver?.name || ''
    ]);
    downloadCSV([headers, ...rows], `devices-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const downloadCSV = (data, filename) => {
    const csv = data.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Effacer interventions ──
  const clearInterventions = () => {
    if (window.confirm('⚠ Supprimer TOUTES les interventions ? Cette action est irréversible.')) {
      localStorage.removeItem('interventions');
      setInterventions([]);
    }
  };

  // ── Toggle sort ──
  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const sortIndicator = (key) => {
    if (sortBy !== key) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            <span style={styles.titleIcon}>◆</span> REPORTS & ANALYTICS
          </h2>
          <span style={styles.subtitle}>
            {filteredAlerts.length} alertes • {filteredInterventions.length} interventions • {allDevices.length} devices
          </span>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.exportBtn} onClick={exportCSV}>
            ⬇ ALERTES
          </button>
          <button
            style={{...styles.exportBtn, borderColor: '#00ffff', color: '#00ffff'}}
            onClick={exportInterventionsCSV}
          >
            ⬇ INTERVENTIONS
          </button>
          <button
            style={{...styles.exportBtn, borderColor: '#ff6600', color: '#ff6600'}}
            onClick={exportDevicesCSV}
          >
            ⬇ DEVICES
          </button>
          <button
            style={{...styles.exportBtn, borderColor: 'rgba(0,255,65,0.3)', color: '#888'}}
            onClick={refreshInterventions}
            title="Rafraîchir"
          >
            ↻
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={styles.searchSection}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>⌕</span>
          <input
            type="text"
            placeholder="Rechercher dans alertes, interventions, devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {searchQuery && (
            <button style={styles.clearBtn} onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>

        <button style={styles.resetBtn} onClick={resetFilters} title="Réinitialiser filtres">
          ↺ RESET
        </button>
      </div>

      {/* FILTERS */}
      <div style={styles.filtersBar}>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>PÉRIODE :</span>
          {[
            { key: 'today', label: 'JOUR' },
            { key: 'week',  label: '7J' },
            { key: 'month', label: '30J' },
            { key: 'all',   label: 'TOUT' }
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                ...styles.filterChip,
                ...(period === p.key ? styles.filterChipActive : {})
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>DEVICE :</span>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            style={styles.select}
          >
            <option value="all">Tous les devices</option>
            {allDevices.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>TRI :</span>
          {[
            { key: 'date',     label: 'DATE' },
            { key: 'device',   label: 'DEVICE' },
            { key: 'severity', label: 'NIVEAU' }
          ].map(s => (
            <button
              key={s.key}
              onClick={() => toggleSort(s.key)}
              style={{
                ...styles.filterChip,
                ...(sortBy === s.key ? styles.filterChipActive : {})
              }}
            >
              {s.label}{sortIndicator(s.key)}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={{...styles.kpiIcon, color: '#00ff41'}}>⊞</div>
          <div>
            <div style={{...styles.kpiValue, color: '#00ff41'}}>{allDevices.length}</div>
            <div style={styles.kpiLabel}>DEVICES TOTAL</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{...styles.kpiIcon, color: '#00ffff'}}>📍</div>
          <div>
            <div style={{...styles.kpiValue, color: '#00ffff'}}>{totalDistance.toLocaleString()}</div>
            <div style={styles.kpiLabel}>KM TOTAL</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{...styles.kpiIcon, color: '#ff6600'}}>⚡</div>
          <div>
            <div style={{...styles.kpiValue, color: '#ff6600'}}>{avgSpeed}</div>
            <div style={styles.kpiLabel}>KM/H MOYEN</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{...styles.kpiIcon, color: '#00ff41'}}>🔋</div>
          <div>
            <div style={{...styles.kpiValue, color: '#00ff41'}}>{avgBattery}%</div>
            <div style={styles.kpiLabel}>BATTERIE MOY</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{...styles.kpiIcon, color: '#ff003c'}}>⚠</div>
          <div>
            <div style={{...styles.kpiValue, color: '#ff003c'}}>{filteredAlerts.length}</div>
            <div style={styles.kpiLabel}>ALERTES</div>
          </div>
        </div>

        <div style={styles.kpiCard}>
          <div style={{...styles.kpiIcon, color: '#9900ff'}}>⚡</div>
          <div>
            <div style={{...styles.kpiValue, color: '#9900ff'}}>{filteredInterventions.length}</div>
            <div style={styles.kpiLabel}>INTERVENTIONS</div>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div style={styles.chartsRow}>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>
              <span style={{color: '#00ff41'}}>◆</span> RÉPARTITION STATUS
            </h3>
          </div>

          <div style={styles.donutContainer}>
            <div style={styles.donutWrapper}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                {(() => {
                  let cumulative = 0;
                  return statusData.map((segment, i) => {
                    if (segment.value === 0) return null;
                    const percent = segment.value / totalStatus;
                    const startAngle = cumulative * 2 * Math.PI;
                    const endAngle = (cumulative + percent) * 2 * Math.PI;
                    cumulative += percent;

                    const x1 = 80 + 70 * Math.sin(startAngle);
                    const y1 = 80 - 70 * Math.cos(startAngle);
                    const x2 = 80 + 70 * Math.sin(endAngle);
                    const y2 = 80 - 70 * Math.cos(endAngle);
                    const largeArc = percent > 0.5 ? 1 : 0;

                    return (
                      <path
                        key={i}
                        d={`M 80 80 L ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={segment.color}
                        opacity="0.8"
                        stroke="#0d0d0d"
                        strokeWidth="2"
                      />
                    );
                  });
                })()}
                <circle cx="80" cy="80" r="40" fill="#0d0d0d" />
                <text x="80" y="78" textAnchor="middle" fill="#00ff41" fontSize="20" fontWeight="700" fontFamily="monospace">
                  {totalStatus}
                </text>
                <text x="80" y="92" textAnchor="middle" fill="#666" fontSize="9" fontFamily="monospace">
                  TOTAL
                </text>
              </svg>
            </div>

            <div style={styles.donutLegend}>
              {statusData.map((s, i) => (
                <div key={i} style={styles.legendItem}>
                  <div style={{...styles.legendDot, background: s.color, boxShadow: `0 0 6px ${s.color}`}}></div>
                  <span style={styles.legendLabel}>{s.label}</span>
                  <span style={{...styles.legendValue, color: s.color}}>{s.value}</span>
                  <span style={styles.legendPercent}>
                    {Math.round((s.value / totalStatus) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>
              <span style={{color: '#00ff41'}}>◆</span> ALERTES PAR SÉVÉRITÉ
            </h3>
          </div>

          <div style={styles.barsContainer}>
            {severityData.map((s, i) => {
              const max = Math.max(...severityData.map(x => x.value), 1);
              const widthPercent = (s.value / max) * 100;

              return (
                <div key={i} style={styles.barRow}>
                  <div style={styles.barHeader}>
                    <span style={{...styles.barLabel, color: s.color}}>{s.label}</span>
                    <span style={{...styles.barValue, color: s.color}}>{s.value}</span>
                  </div>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.barFill,
                        width: `${widthPercent}%`,
                        background: s.color,
                        boxShadow: `0 0 8px ${s.color}`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TOP DEVICES */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <h3 style={styles.chartTitle}>
            <span style={{color: '#00ff41'}}>◆</span> TOP 10 DEVICES PAR DISTANCE
          </h3>
        </div>

        <div style={styles.devicesBars}>
          {distanceData.length === 0 ? (
            <div style={styles.empty}>Aucune donnée</div>
          ) : (
            distanceData.map((device, i) => {
              const widthPercent = ((device.totalDistance || 0) / maxDistance) * 100;
              const color = i === 0 ? '#00ff41' : i === 1 ? '#00ffff' : i === 2 ? '#ff6600' : '#666';

              return (
                <div key={device.id} style={styles.deviceBarRow}>
                  <div style={{...styles.rank, color}}>#{i + 1}</div>
                  <div style={styles.deviceBarIcon}>{getDeviceIcon(device.type)}</div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={styles.deviceBarHeader}>
                      <span style={styles.deviceBarName}>{device.name}</span>
                      <span style={{...styles.deviceBarDistance, color}}>
                        {(device.totalDistance || 0).toLocaleString()} km
                      </span>
                    </div>
                    <div style={styles.deviceBarTrack}>
                      <div
                        style={{
                          ...styles.deviceBarFill,
                          width: `${widthPercent}%`,
                          background: color,
                          boxShadow: `0 0 6px ${color}`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* INTERVENTIONS */}
      <div style={styles.chartCard}>
        <div style={styles.chartHeader}>
          <h3 style={styles.chartTitle}>
            <span style={{color: '#00ff41'}}>◆</span> HISTORIQUE INTERVENTIONS
          </h3>
          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <span style={{fontSize: '11px', color: '#666'}}>
              {filteredInterventions.length} entrées
            </span>
            {filteredInterventions.length > 20 && (
              <button
                style={styles.smallBtn}
                onClick={() => setShowAllInterventions(!showAllInterventions)}
              >
                {showAllInterventions ? '◐ MOINS' : '◑ TOUT VOIR'}
              </button>
            )}
            {interventions.length > 0 && (
              <button
                style={{...styles.smallBtn, borderColor: 'rgba(255,0,60,0.3)', color: '#ff003c'}}
                onClick={clearInterventions}
              >
                ✕ EFFACER TOUT
              </button>
            )}
          </div>
        </div>

        <div style={styles.tableWrapper}>
          {displayedInterventions.length === 0 ? (
            <div style={styles.empty}>Aucune intervention enregistrée</div>
          ) : (
            <table style={styles.table}>
              <colgroup>
                <col style={{width: '140px'}} />
                <col style={{width: '160px'}} />
                <col style={{width: '130px'}} />
                <col style={{width: '100px'}} />
                <col style={{width: '90px'}} />
                <col />
              </colgroup>
              <thead>
                <tr>
                  <th style={styles.th} onClick={() => toggleSort('date')}>
                    DATE{sortIndicator('date')}
                  </th>
                  <th style={styles.th}>UNITÉ</th>
                  <th style={styles.th} onClick={() => toggleSort('device')}>
                    DEVICE{sortIndicator('device')}
                  </th>
                  <th style={styles.th}>ACTION</th>
                  <th style={styles.th} onClick={() => toggleSort('severity')}>
                    PRIORITÉ{sortIndicator('severity')}
                  </th>
                  <th style={styles.th}>MESSAGE</th>
                </tr>
              </thead>
              <tbody>
                {displayedInterventions.map(i => (
                  <tr key={i.id} style={styles.tr}>
                    <td style={{...styles.td, color: '#666', fontSize: '10px'}}>
                      {formatDate(i.timestamp)}
                    </td>
                    <td style={{...styles.td, color: '#00ff41'}}>
                      {i.agentName || i.agent || '--'}
                    </td>
                    <td style={styles.td}>{i.deviceName || '--'}</td>
                    <td style={{...styles.td, color: '#00ffff'}}>
                      {(i.action || '').toUpperCase()}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        color: i.priority === 'urgent' ? '#ff003c' :
                               i.priority === 'high'   ? '#ff6600' :
                               i.priority === 'normal' ? '#00ff41' : '#666',
                        background: i.priority === 'urgent' ? 'rgba(255,0,60,0.1)' :
                                    i.priority === 'high'   ? 'rgba(255,102,0,0.1)' :
                                    i.priority === 'normal' ? 'rgba(0,255,65,0.1)' : 'rgba(100,100,100,0.1)',
                        border: `1px solid ${
                          i.priority === 'urgent' ? 'rgba(255,0,60,0.3)' :
                          i.priority === 'high'   ? 'rgba(255,102,0,0.3)' :
                          i.priority === 'normal' ? 'rgba(0,255,65,0.3)' : 'rgba(100,100,100,0.3)'
                        }`
                      }}>
                        {(i.priority || 'normal').toUpperCase()}
                      </span>
                    </td>
                    <td style={{...styles.td, color: '#888', fontSize: '10px'}}>
                      {(i.message || '').slice(0, 80)}{(i.message || '').length > 80 ? '...' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default ReportsPage;

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: 'monospace' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '5px' },
  title: { fontSize: '14px', color: '#00ff41', letterSpacing: '2px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 0 6px rgba(0,255,65,0.4)' },
  titleIcon: { color: '#00ff41', fontSize: '12px', textShadow: '0 0 6px #00ff41' },
  subtitle: { fontSize: '11px', color: '#666', letterSpacing: '1px', marginTop: '4px', display: 'block' },
  headerActions: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  exportBtn: { padding: '8px 14px', background: 'rgba(0,255,65,0.1)', border: '1px solid #00ff41', color: '#00ff41', fontFamily: 'monospace', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', borderRadius: '3px', cursor: 'pointer' },
  searchSection: { display: 'flex', gap: '10px', padding: '12px 16px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '5px' },
  searchWrapper: { flex: 1, display: 'flex', alignItems: 'center', background: '#000', border: '1px solid #1a1a1a', borderRadius: '3px', padding: '0 12px', height: '32px' },
  searchIcon: { color: '#444', fontSize: '14px', marginRight: '8px' },
  searchInput: { flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e0e0e0', fontSize: '12px', fontFamily: 'monospace' },
  clearBtn: { background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '12px', fontFamily: 'monospace' },
  resetBtn: { padding: '0 14px', background: 'transparent', border: '1px solid rgba(255,102,0,0.3)', color: '#ff6600', fontFamily: 'monospace', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', borderRadius: '3px', cursor: 'pointer' },
  filtersBar: { display: 'flex', alignItems: 'center', padding: '12px 16px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '5px', gap: '20px', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '6px' },
  filterLabel: { fontSize: '10px', color: '#666', letterSpacing: '1.5px', fontWeight: 700, marginRight: '4px' },
  filterChip: { padding: '5px 10px', background: 'transparent', border: '1px solid #1a1a1a', borderRadius: '3px', color: '#666', fontFamily: 'monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s' },
  filterChipActive: { background: 'rgba(0,255,65,0.1)', borderColor: 'rgba(0,255,65,0.4)', color: '#00ff41' },
  select: { padding: '5px 10px', background: '#000', border: '1px solid #1a1a1a', borderRadius: '3px', color: '#e0e0e0', fontSize: '11px', fontFamily: 'monospace', outline: 'none' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' },
  kpiCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '5px' },
  kpiIcon: { fontSize: '24px', filter: 'drop-shadow(0 0 6px currentColor)' },
  kpiValue: { fontSize: '20px', fontWeight: 700, fontFamily: 'monospace', lineHeight: 1, whiteSpace: 'nowrap' },
  kpiLabel: { fontSize: '9px', color: '#555', letterSpacing: '1.5px', marginTop: '4px' },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  chartCard: { background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '5px', padding: '16px' },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #1a1a1a' },
  chartTitle: { fontSize: '12px', color: '#00ff41', letterSpacing: '2px', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' },
  smallBtn: { padding: '4px 10px', background: 'transparent', border: '1px solid rgba(0,255,65,0.3)', color: '#00ff41', fontFamily: 'monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '1px', borderRadius: '3px', cursor: 'pointer' },
  donutContainer: { display: 'flex', alignItems: 'center', gap: '24px' },
  donutWrapper: { flexShrink: 0 },
  donutLegend: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '3px' },
  legendDot: { width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0 },
  legendLabel: { flex: 1, fontSize: '10px', color: '#888', letterSpacing: '1.5px', fontWeight: 700 },
  legendValue: { fontSize: '14px', fontWeight: 700, fontFamily: 'monospace' },
  legendPercent: { fontSize: '10px', color: '#666', fontWeight: 600, minWidth: '32px', textAlign: 'right' },
  barsContainer: { display: 'flex', flexDirection: 'column', gap: '14px' },
  barRow: { display: 'flex', flexDirection: 'column', gap: '6px' },
  barHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  barLabel: { fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px' },
  barValue: { fontSize: '14px', fontWeight: 700, fontFamily: 'monospace' },
  barTrack: { height: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid #1a1a1a', borderRadius: '2px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '2px', transition: 'width 0.5s ease' },
  devicesBars: { display: 'flex', flexDirection: 'column', gap: '10px' },
  deviceBarRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '3px' },
  rank: { fontSize: '14px', fontWeight: 700, fontFamily: 'monospace', width: '30px', textAlign: 'center' },
  deviceBarIcon: { fontSize: '18px', width: '24px', textAlign: 'center' },
  deviceBarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  deviceBarName: { fontSize: '12px', color: '#e0e0e0', fontWeight: 600 },
  deviceBarDistance: { fontSize: '11px', fontWeight: 700, fontFamily: 'monospace' },
  deviceBarTrack: { height: '5px', background: 'rgba(0,0,0,0.5)', border: '1px solid #1a1a1a', borderRadius: '2px', overflow: 'hidden' },
  deviceBarFill: { height: '100%', borderRadius: '2px', transition: 'width 0.5s ease' },
  tableWrapper: { overflowX: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', border: '1px solid rgba(0,255,65,0.08)' },
  table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontFamily: 'monospace' },
  th: { padding: '10px 14px', textAlign: 'left', color: '#00ff41', fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', background: 'rgba(0,255,65,0.04)', borderBottom: '1px solid rgba(0,255,65,0.2)', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.02)' },
  td: { padding: '10px 14px', textAlign: 'left', color: '#ccc', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  empty: { padding: '40px 20px', textAlign: 'center', color: '#444', fontSize: '11px', letterSpacing: '2px' }
};