import React from 'react';
import useDevices from '../../hooks/useDevices';
import useAlerts from '../../hooks/useAlerts';
import StatsCard from './StatsCard';
import './Dashboard.css';

const Dashboard = () => {
  const { allDevices, stats, loading } = useDevices();
  const { stats: alertStats } = useAlerts();

  if (loading && allDevices.length === 0) {
    return (
      <div className="hacker-loading">
        <span className="loading-logo">◎</span>
        <span className="loading-text">Loading System...</span>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    );
  }

  const totalDistance = allDevices.reduce(
    (sum, d) => sum + (d.totalDistance || 0),
    0
  );

  // Styles inline pour forcer
  const tdStyle = {
    padding: '12px 14px',
    textAlign: 'left',
    verticalAlign: 'middle',
    color: '#ccc',
    fontSize: '11px',
    fontFamily: 'monospace',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  const thStyle = {
    padding: '10px 14px',
    textAlign: 'left',
    verticalAlign: 'middle',
    color: '#00ff41',
    fontSize: '9px',
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap'
  };

  return (
    <div className="dashboard">

      {/* SECTION TITLE */}
      <div className="section-header">
        <h2 className="section-title">◆ System Overview</h2>
           <span className="section-time"><span style={{ color: '#00ff41', textShadow: '0 0 6px #00ff41', marginRight: '6px' }}>◆</span> TRACKED DEVICES
          {new Date().toLocaleTimeString('fr-FR')}
        </span>
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid">
        <StatsCard icon="⊞" label="TOTAL DEVICES" value={stats.total}    color="#00ff41" />
        <StatsCard icon="◉" label="ONLINE"        value={stats.online}   color="#00ff41" glow />
        <StatsCard icon="◎" label="IDLE"          value={stats.idle}     color="#ff6600" />
        <StatsCard icon="✖" label="OFFLINE"       value={stats.offline}  color="#ff003c" />
        <StatsCard icon="⚠" label="ALERTS"        value={alertStats.unread} color="#ff003c" glow={alertStats.unread > 0} />
        <StatsCard icon="⬡" label="DISTANCE"      value={`${totalDistance} km`} color="#00ffff" />
      </div>

      {/* DEVICE LIST */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Active Devices</h3>
          <span className="section-count">[{allDevices.length}]</span>
        </div>

        <div style={{
          overflowX: 'auto',
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(0,255,65,0.08)',
          borderRadius: '4px'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            fontFamily: 'monospace'
          }}>
            <colgroup>
              <col style={{ width: '110px' }} />
              <col style={{ width: '130px' }} />
              <col style={{ width: '110px' }} />
              <col style={{ width: '90px'  }} />
              <col style={{ width: '170px' }} />
              <col />
              <col style={{ width: '110px' }} />
            </colgroup>

            <thead style={{
              background: 'rgba(0,255,65,0.04)',
              borderBottom: '1px solid rgba(0,255,65,0.2)'
            }}>
              <tr>
                <th style={thStyle}>STATUS</th>
                <th style={thStyle}>NAME</th>
                <th style={thStyle}>TYPE</th>
                <th style={thStyle}>SPEED</th>
                <th style={thStyle}>BATTERY</th>
                <th style={thStyle}>PROPRIETARY/DRIVER</th>
                <th style={thStyle}>LAST UPDATE</th>
              </tr>
            </thead>

            <tbody>
              {allDevices.map((device) => (
                <tr
                  key={device.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.02)'
                  }}
                >
                  <td style={tdStyle}>
                    <span className={`badge badge-${device.status}`}>
                      {device.status}
                    </span>
                  </td>

                  <td style={{ ...tdStyle, color: '#00ff41', fontWeight: 600 }}>
                    {device.name}
                  </td>

                  <td style={tdStyle}>
                    {device.type}
                  </td>

                  <td style={tdStyle}>
                    <span style={{
                      color: device.speed > 80 ? '#ff003c' :
                             device.speed > 0  ? '#00ff41' : '#666'
                    }}>
                      {device.speed} km/h
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%'
                    }}>
                      <div style={{
                        flex: 1,
                        height: '5px',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(0,255,65,0.1)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        minWidth: '60px'
                      }}>
                        <div style={{
                          width: `${device.battery}%`,
                          height: '100%',
                          background:
                            device.battery > 60 ? '#00ff41' :
                            device.battery > 30 ? '#ff6600' : '#ff003c',
                          boxShadow: '0 0 5px currentColor'
                        }}></div>
                      </div>
                      <span style={{
                        fontSize: '10px',
                        color: '#888',
                        fontWeight: 600,
                        minWidth: '32px',
                        textAlign: 'right'
                      }}>
                        {device.battery}%
                      </span>
                    </div>
                  </td>

                  <td style={tdStyle}>
                    {device.driver?.name || '--'}
                  </td>

                  <td style={{ ...tdStyle, color: '#555', fontSize: '10px' }}>
                    {device.lastUpdate
                      ? new Date(device.lastUpdate).toLocaleTimeString('fr-FR')
                      : '--'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TERMINAL LOGS */}
      <div className="dashboard-section">
        <div className="terminal-box">
          <div className="terminal-header">
            <span className="terminal-dot red"></span>
            <span className="terminal-dot yellow"></span>
            <span className="terminal-dot green"></span>
            <span className="terminal-title">System Logs</span>
          </div>

          {allDevices.slice(0, 5).map((device) => (
            <div className="terminal-line" key={device.id}>
              <span className="terminal-prompt">&gt;</span>
              <span className="terminal-cmd">
                [{new Date().toLocaleTimeString('fr-FR')}]
              </span>
              <span className={
                device.status === 'online'
                  ? 'terminal-success'
                  : device.status === 'idle'
                    ? 'terminal-warn'
                    : 'terminal-error'
              }>
                {device.name} — {device.status.toUpperCase()}
                {device.speed > 0 ? ` — ${device.speed} km/h` : ''}
                {device.position?.address ? ` — ${device.position.address}` : ''}
              </span>
            </div>
          ))}

          <div className="terminal-line">
            <span className="terminal-prompt">&gt;</span>
            <span className="terminal-output animate-blink">_</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;