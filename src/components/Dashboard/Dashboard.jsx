import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useDevices from '../../hooks/useDevices';
import useAlerts from '../../hooks/useAlerts';
import StatsCard from './StatsCard';
import {
  fetchDevices,
  deleteDevice,
  updateDevice
} from '../../store/slices/deviceSlice';
import {
  fetchAlerts,
  markAsReadLocal,
  deleteAlertLocal
} from '../../store/slices/alertSlice';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { allDevices, stats, loading } = useDevices();
  const { allAlerts, stats: alertStats } = useAlerts();

  const [commandInput, setCommandInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', text: '━━━ GPS TRACKER TERMINAL v1.0 ━━━' },
    { type: 'system', text: 'Type "help" for available commands' },
    { type: 'output', text: '' }
  ]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [bootTime] = useState(new Date());
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const addToHistory = (entries) => {
    setTerminalHistory(prev => [...prev, ...entries]);
  };

  const executeCommand = async (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addToHistory([{ type: 'command', text: trimmed }]);
    setCommandHistory(prev => [trimmed, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        addToHistory([
          { type: 'output', text: '━━━ COMMANDS LIST ━━━' },
          { type: 'output', text: '' },
          { type: 'success', text: '▸ DEVICES MANAGEMENT' },
          { type: 'info', text: '  devices           List all devices' },
          { type: 'info', text: '  device <id>       Show device details' },
          { type: 'info', text: '  delete <id>       Delete a device' },
          { type: 'info', text: '  search <query>    Search devices' },
          { type: 'info', text: '  status <state>    Filter by status' },
          { type: 'info', text: '  type <type>       Filter by type' },
          { type: 'info', text: '  battery <n>       Battery < n%' },
          { type: 'info', text: '  speed <n>         Speed > n km/h' },
          { type: 'info', text: '  fuel <n>          Fuel < n%' },
          { type: 'info', text: '  top-speed         Show fastest device' },
          { type: 'info', text: '  top-distance      Device with most km' },
          { type: 'info', text: '  low-battery       All battery < 20%' },
          { type: 'info', text: '  online-count      Count by status' },
          { type: 'output', text: '' },
          { type: 'success', text: '▸ ALERTS MANAGEMENT' },
          { type: 'info', text: '  alerts            List recent alerts' },
          { type: 'info', text: '  danger            Show danger alerts' },
          { type: 'info', text: '  warning           Show warning alerts' },
          { type: 'info', text: '  info-alerts       Show info alerts' },
          { type: 'info', text: '  read-all          Mark all as read' },
          { type: 'info', text: '  clear-alerts      Delete read alerts' },
          { type: 'output', text: '' },
          { type: 'success', text: '▸ SYSTEM' },
          { type: 'info', text: '  stats             Global statistics' },
          { type: 'info', text: '  refresh           Reload from server' },
          { type: 'info', text: '  ping              Test connection' },
          { type: 'info', text: '  uptime            System uptime' },
          { type: 'info', text: '  whoami            Current user info' },
          { type: 'info', text: '  time              Current time' },
          { type: 'info', text: '  date              Current date' },
          { type: 'output', text: '' },
          { type: 'success', text: '▸ DATA EXPORT' },
          { type: 'info', text: '  export            Download JSON file' },
          { type: 'info', text: '  backup            Save to localStorage' },
          { type: 'output', text: '' },
          { type: 'success', text: '▸ UTILITIES' },
          { type: 'info', text: '  echo <text>       Print text' },
          { type: 'info', text: '  calc <expr>       Calculator' },
          { type: 'info', text: '  base64 <text>     Encode base64' },
          { type: 'info', text: '  hash <text>       Generate hash' },
          { type: 'info', text: '  rand <min> <max>  Random number' },
          { type: 'info', text: '  uuid              Generate UUID' },
          { type: 'info', text: '  ascii <char>      ASCII code' },
          { type: 'info', text: '  matrix            Matrix effect' },
          { type: 'info', text: '  quote             Random quote' },
          { type: 'output', text: '' },
          { type: 'success', text: '▸ TERMINAL' },
          { type: 'info', text: '  clear             Clear screen' },
          { type: 'info', text: '  history           Command history' },
          { type: 'info', text: '  help              Show this help' },
          { type: 'output', text: '' },
          { type: 'success', text: '▸ APPLICATION' },
          { type: 'info', text: '  version           App version' },
          { type: 'info', text: '  about             About system' },
          { type: 'info', text: '  changelog         Version history' },
          { type: 'info', text: '  reload            Reload page' },
          { type: 'info', text: '  logout            Logout' },
          { type: 'output', text: '' },
          { type: 'warn', text: '━━━ TIPS ━━━' },
          { type: 'info', text: '  ↑ ↓               Navigate history' },
          { type: 'info', text: '  Enter             Execute command' },
          { type: 'output', text: '' }
        ]);
        break;

      case 'clear':
        setTerminalHistory([
          { type: 'system', text: '━━━ GPS TRACKER TERMINAL v1.0 ━━━' },
          { type: 'output', text: '' }
        ]);
        break;

      case 'devices':
        if (allDevices.length === 0) {
          addToHistory([{ type: 'warn', text: 'No devices found' }]);
          break;
        }
        addToHistory([
          { type: 'output', text: `Found ${allDevices.length} devices:` },
          { type: 'output', text: '─────────────────────────────' },
          ...allDevices.map(d => ({
            type: 'success',
            text: `#${d.id.toString().padEnd(3)} ${d.name.padEnd(18).slice(0,18)} ${d.status.toUpperCase().padEnd(8)} ${(d.speed||0)}km/h`
          })),
          { type: 'output', text: '' }
        ]);
        break;

      case 'device': {
        if (args.length === 0) {
          addToHistory([{ type: 'error', text: 'Usage: device <id>' }]);
          break;
        }
        const deviceId = args[0];
const device = allDevices.find(d =>
  d.id == deviceId || d.id === parseInt(deviceId)
);
        if (!device) {
          addToHistory([{ type: 'error', text: `Device #${deviceId} not found` }]);
          break;
        }
        addToHistory([
          { type: 'output', text: `━━━ DEVICE #${device.id} ━━━` },
          { type: 'info', text: `Name       : ${device.name}` },
          { type: 'info', text: `Type       : ${device.type}` },
          { type: 'info', text: `Status     : ${device.status.toUpperCase()}` },
          { type: 'info', text: `Speed      : ${device.speed || 0} km/h` },
          { type: 'info', text: `Battery    : ${device.battery || 0}%` },
          { type: 'info', text: `Fuel       : ${device.fuel !== null ? device.fuel + '%' : 'N/A'}` },
          { type: 'info', text: `IMEI       : ${device.imei}` },
          { type: 'info', text: `Plate      : ${device.plateNumber || 'N/A'}` },
          { type: 'info', text: `Driver     : ${device.driver?.name || 'N/A'}` },
          { type: 'info', text: `Position   : ${device.position?.lat?.toFixed(5)}, ${device.position?.lng?.toFixed(5)}` },
          { type: 'info', text: `Address    : ${device.position?.address || 'Unknown'}` },
          { type: 'info', text: `Distance   : ${device.totalDistance || 0} km` },
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'delete': {
        if (args.length === 0) {
          addToHistory([{ type: 'error', text: 'Usage: delete <id>' }]);
          break;
        }
        const delId = args[0];
const delDevice = allDevices.find(d =>
  d.id == delId || d.id === parseInt(delId)
);
        if (!delDevice) {
          addToHistory([{ type: 'error', text: `Device #${delId} not found` }]);
          break;
        }
        addToHistory([{ type: 'info', text: `Deleting device #${delId}...` }]);
        try {
          await dispatch(deleteDevice(delId)).unwrap();
          await dispatch(fetchDevices()).unwrap();
          addToHistory([
            { type: 'success', text: `Device #${delId} (${delDevice.name}) deleted from server` },
            { type: 'output', text: '' }
          ]);
        } catch (err) {
          addToHistory([{ type: 'error', text: `Error: ${err.message || 'Failed to delete'}` }]);
        }
        break;
      }

      case 'stats':
        addToHistory([
          { type: 'output', text: '━━━ STATISTICS ━━━' },
          { type: 'success', text: `Total devices    : ${stats.total}` },
          { type: 'success', text: `Online           : ${stats.online}` },
          { type: 'warn',    text: `Idle             : ${stats.idle}` },
          { type: 'error',   text: `Offline          : ${stats.offline}` },
          { type: 'output',  text: '─────────────────────────────' },
          { type: 'info',    text: `Total alerts     : ${alertStats.total}` },
          { type: 'error',   text: `Unread alerts    : ${alertStats.unread}` },
          { type: 'error',   text: `Danger           : ${alertStats.danger}` },
          { type: 'warn',    text: `Warning          : ${alertStats.warning}` },
          { type: 'info',    text: `Info             : ${alertStats.info}` },
          { type: 'output',  text: '─────────────────────────────' },
          { type: 'info',    text: `Total distance   : ${allDevices.reduce((s, d) => s + (d.totalDistance || 0), 0)} km` },
          { type: 'output', text: '' }
        ]);
        break;

      case 'alerts': {
        const recentAlerts = allAlerts.slice(0, 10);
        if (recentAlerts.length === 0) {
          addToHistory([{ type: 'info', text: 'No alerts found' }]);
          break;
        }
        addToHistory([
          { type: 'output', text: `Recent alerts (${recentAlerts.length}):` },
          { type: 'output', text: '─────────────────────────────' },
          ...recentAlerts.map(a => ({
            type: a.severity === 'danger' ? 'error' : a.severity === 'warning' ? 'warn' : 'info',
            text: `[${a.severity.toUpperCase().padEnd(7)}] ${(a.deviceName || 'Sys').padEnd(15).slice(0,15)} ${a.read ? 'READ' : 'NEW'}`
          })),
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'danger': {
        const dangerAlerts = allAlerts.filter(a => a.severity === 'danger');
        if (dangerAlerts.length === 0) {
          addToHistory([{ type: 'success', text: 'No danger alerts' }]);
          break;
        }
        addToHistory([
          { type: 'error', text: `${dangerAlerts.length} DANGER alert(s):` },
          ...dangerAlerts.slice(0, 10).map(a => ({
            type: 'error',
            text: `  ${(a.deviceName || 'Sys').padEnd(15).slice(0,15)} ${(a.message || '').slice(0, 45)}`
          })),
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'warning': {
        const warnAlerts = allAlerts.filter(a => a.severity === 'warning');
        if (warnAlerts.length === 0) {
          addToHistory([{ type: 'success', text: 'No warning alerts' }]);
          break;
        }
        addToHistory([
          { type: 'warn', text: `${warnAlerts.length} WARNING alert(s):` },
          ...warnAlerts.slice(0, 10).map(a => ({
            type: 'warn',
            text: `  ${(a.deviceName || 'Sys').padEnd(15).slice(0,15)} ${(a.message || '').slice(0, 45)}`
          })),
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'info-alerts': {
        const infoAlerts = allAlerts.filter(a => a.severity === 'info');
        if (infoAlerts.length === 0) {
          addToHistory([{ type: 'info', text: 'No info alerts' }]);
          break;
        }
        addToHistory([
          { type: 'info', text: `${infoAlerts.length} INFO alert(s):` },
          ...infoAlerts.slice(0, 10).map(a => ({
            type: 'info',
            text: `  ${(a.deviceName || 'Sys').padEnd(15).slice(0,15)} ${(a.message || '').slice(0, 45)}`
          })),
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'clear-alerts': {
        const readAlerts = allAlerts.filter(a => a.read);
        if (readAlerts.length === 0) {
          addToHistory([{ type: 'info', text: 'No read alerts to clear' }]);
          break;
        }
        readAlerts.forEach(a => dispatch(deleteAlertLocal(a.id)));
        addToHistory([
          { type: 'success', text: `Cleared ${readAlerts.length} read alerts` },
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'read-all': {
        const unreadAlerts = allAlerts.filter(a => !a.read);
        if (unreadAlerts.length === 0) {
          addToHistory([{ type: 'info', text: 'All alerts already read' }]);
          break;
        }
        unreadAlerts.forEach(a => dispatch(markAsReadLocal(a.id)));
        addToHistory([
          { type: 'success', text: `Marked ${unreadAlerts.length} alerts as read` },
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'refresh':
        addToHistory([{ type: 'info', text: 'Refreshing from server...' }]);
        try {
          await dispatch(fetchDevices()).unwrap();
          await dispatch(fetchAlerts()).unwrap();
          addToHistory([
            { type: 'success', text: `Loaded ${allDevices.length} devices and ${allAlerts.length} alerts` },
            { type: 'output', text: '' }
          ]);
        } catch (err) {
          addToHistory([{ type: 'error', text: `Failed: ${err.message || 'Server unreachable'}` }]);
        }
        break;

      case 'search': {
        if (args.length === 0) {
          addToHistory([{ type: 'error', text: 'Usage: search <query>' }]);
          break;
        }
        const query = args.join(' ').toLowerCase();
        const found = allDevices.filter(d =>
          d.name?.toLowerCase().includes(query) ||
          d.imei?.toLowerCase().includes(query) ||
          d.type?.toLowerCase().includes(query) ||
          d.driver?.name?.toLowerCase().includes(query) ||
          d.plateNumber?.toLowerCase().includes(query)
        );
        if (found.length === 0) {
          addToHistory([{ type: 'warn', text: `No results for "${query}"` }]);
          break;
        }
        addToHistory([
          { type: 'success', text: `Found ${found.length} result(s):` },
          ...found.map(d => ({
            type: 'info',
            text: `  #${d.id} ${d.name} (${d.status})`
          })),
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'status': {
        if (args.length === 0) {
          addToHistory([{ type: 'error', text: 'Usage: status <online|idle|offline>' }]);
          break;
        }
        const filter = args[0].toLowerCase();
        if (!['online', 'idle', 'offline'].includes(filter)) {
          addToHistory([{ type: 'error', text: 'Invalid status. Use: online, idle, or offline' }]);
          break;
        }
        const filtered = allDevices.filter(d => d.status === filter);
        if (filtered.length === 0) {
          addToHistory([{ type: 'warn', text: `No devices with status "${filter}"` }]);
          break;
        }
        addToHistory([
          { type: 'success', text: `${filtered.length} device(s) ${filter.toUpperCase()}:` },
          ...filtered.map(d => ({
            type: 'info',
            text: `  #${d.id} ${d.name} - ${d.speed || 0} km/h`
          })),
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'type': {
        if (args.length === 0) {
          addToHistory([
            { type: 'error', text: 'Usage: type <type>' },
            { type: 'info', text: 'Available: truck, van, car, motorcycle, bus, phone, tablet, drone, boat, bicycle, person, pet, asset, other' }
          ]);
          break;
        }
        const typeFilter = args[0].toLowerCase();
        const byType = allDevices.filter(d => d.type === typeFilter);
        if (byType.length === 0) {
          addToHistory([{ type: 'warn', text: `No devices of type "${typeFilter}"` }]);
          break;
        }
        addToHistory([
          { type: 'success', text: `${byType.length} device(s) type ${typeFilter}:` },
          ...byType.map(d => ({
            type: 'info',
            text: `  #${d.id} ${d.name}`
          })),
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'battery': {
        const battLimit = parseInt(args[0]) || 30;
        const lowBatt = allDevices.filter(d => (d.battery || 0) < battLimit);
        if (lowBatt.length === 0) {
          addToHistory([{ type: 'success', text: `No devices with battery < ${battLimit}%` }]);
          break;
        }
        addToHistory([
          { type: 'success', text: `${lowBatt.length} device(s) battery < ${battLimit}%:` },
          ...lowBatt.map(d => ({
            type: d.battery < 15 ? 'error' : 'warn',
            text: `  #${d.id} ${d.name.padEnd(20).slice(0,20)} ${d.battery}%`
          })),
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'speed': {
        const speedLimit = parseInt(args[0]) || 50;
        const fast = allDevices.filter(d => (d.speed || 0) > speedLimit);
        if (fast.length === 0) {
          addToHistory([{ type: 'info', text: `No devices faster than ${speedLimit} km/h` }]);
          break;
        }
        addToHistory([
          { type: 'success', text: `${fast.length} device(s) faster than ${speedLimit}:` },
          ...fast.map(d => ({
            type: 'info',
            text: `  #${d.id} ${d.name.padEnd(20).slice(0,20)} ${d.speed} km/h`
          })),
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'fuel': {
        const fuelLimit = parseInt(args[0]) || 30;
        const lowFuel = allDevices.filter(d => d.fuel !== null && d.fuel !== undefined && d.fuel < fuelLimit);
        if (lowFuel.length === 0) {
          addToHistory([{ type: 'success', text: `No devices with fuel < ${fuelLimit}%` }]);
          break;
        }
        addToHistory([
          { type: 'success', text: `${lowFuel.length} device(s) fuel < ${fuelLimit}%:` },
          ...lowFuel.map(d => ({
            type: d.fuel < 15 ? 'error' : 'warn',
            text: `  #${d.id} ${d.name.padEnd(20).slice(0,20)} ${d.fuel}%`
          })),
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'top-speed': {
        if (allDevices.length === 0) {
          addToHistory([{ type: 'warn', text: 'No devices' }]);
          break;
        }
        const fastest = [...allDevices].sort((a, b) => (b.speed || 0) - (a.speed || 0))[0];
        addToHistory([
          { type: 'success', text: `Fastest device:` },
          { type: 'info', text: `  Name  : ${fastest.name}` },
          { type: 'info', text: `  Speed : ${fastest.speed || 0} km/h` },
          { type: 'info', text: `  Type  : ${fastest.type}` },
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'top-distance': {
        if (allDevices.length === 0) {
          addToHistory([{ type: 'warn', text: 'No devices' }]);
          break;
        }
        const longest = [...allDevices].sort((a, b) => (b.totalDistance || 0) - (a.totalDistance || 0))[0];
        addToHistory([
          { type: 'success', text: `Most kilometers:` },
          { type: 'info', text: `  Name     : ${longest.name}` },
          { type: 'info', text: `  Distance : ${longest.totalDistance || 0} km` },
          { type: 'info', text: `  Type     : ${longest.type}` },
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'low-battery': {
        const critical = allDevices.filter(d => (d.battery || 0) < 20);
        if (critical.length === 0) {
          addToHistory([{ type: 'success', text: 'All devices have battery >= 20%' }]);
          break;
        }
        addToHistory([
          { type: 'warn', text: `${critical.length} device(s) with low battery:` },
          ...critical.map(d => ({
            type: d.battery < 10 ? 'error' : 'warn',
            text: `  #${d.id} ${d.name.padEnd(18).slice(0,18)} ${d.battery}%`
          })),
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'online-count':
        addToHistory([
          { type: 'success', text: `Online   : ${stats.online}` },
          { type: 'warn',    text: `Idle     : ${stats.idle}` },
          { type: 'error',   text: `Offline  : ${stats.offline}` },
          { type: 'info',    text: `Total    : ${stats.total}` },
          { type: 'output', text: '' }
        ]);
        break;

      case 'time':
        addToHistory([
          { type: 'info', text: `Time     : ${new Date().toLocaleTimeString('fr-FR')}` },
          { type: 'info', text: `Timezone : ${Intl.DateTimeFormat().resolvedOptions().timeZone}` },
          { type: 'output', text: '' }
        ]);
        break;

      case 'date':
        addToHistory([
          { type: 'info', text: `Date : ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` },
          { type: 'output', text: '' }
        ]);
        break;

      case 'uptime': {
        const uptimeMs = Date.now() - bootTime.getTime();
        const days = Math.floor(uptimeMs / 86400000);
        const hours = Math.floor((uptimeMs % 86400000) / 3600000);
        const mins = Math.floor((uptimeMs % 3600000) / 60000);
        const secs = Math.floor((uptimeMs % 60000) / 1000);
        addToHistory([
          { type: 'success', text: `Session uptime: ${days}d ${hours}h ${mins}m ${secs}s` },
          { type: 'info', text: `Started at: ${bootTime.toLocaleTimeString('fr-FR')}` },
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'whoami': {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        addToHistory([
          { type: 'success', text: `User  : ${user.username || 'unknown'}` },
          { type: 'info',    text: `Email : ${user.email || 'N/A'}` },
          { type: 'info',    text: `Role  : ${(user.role || 'user').toUpperCase()}` },
          { type: 'info',    text: `ID    : #${user.id || '???'}` },
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'ping':
        addToHistory([{ type: 'info', text: 'Pinging server...' }]);
        try {
          const start = Date.now();
          const response = await fetch('http://localhost:3001/devices?_limit=1');
          const time = Date.now() - start;
          if (response.ok) {
            addToHistory([
              { type: 'success', text: `Pong! Response: ${time}ms` },
              { type: 'success', text: `Server: OPERATIONAL` },
              { type: 'output', text: '' }
            ]);
          } else {
            addToHistory([{ type: 'warn', text: `Server responded with status ${response.status}` }]);
          }
        } catch (err) {
          addToHistory([
            { type: 'error', text: 'Server unreachable' },
            { type: 'info', text: 'Run: npm run server' }
          ]);
        }
        break;

      case 'export': {
        try {
          const exportData = {
            exportedAt: new Date().toISOString(),
            exportedBy: JSON.parse(localStorage.getItem('user') || '{}').username || 'unknown',
            devices: allDevices,
            alerts: allAlerts,
            stats,
            alertStats
          };
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `gps-export-${Date.now()}.json`;
          link.click();
          URL.revokeObjectURL(url);
          addToHistory([
            { type: 'success', text: `Export downloaded: ${allDevices.length} devices, ${allAlerts.length} alerts` },
            { type: 'output', text: '' }
          ]);
        } catch (err) {
          addToHistory([{ type: 'error', text: `Export failed: ${err.message}` }]);
        }
        break;
      }

      case 'backup': {
        try {
          const key = 'backup_' + Date.now();
          localStorage.setItem(key, JSON.stringify({
            devices: allDevices,
            alerts: allAlerts,
            timestamp: new Date().toISOString()
          }));
          addToHistory([
            { type: 'success', text: `Backup saved: ${key}` },
            { type: 'info', text: `Devices: ${allDevices.length} - Alerts: ${allAlerts.length}` },
            { type: 'output', text: '' }
          ]);
        } catch (err) {
          addToHistory([{ type: 'error', text: `Backup failed: ${err.message}` }]);
        }
        break;
      }

      case 'version':
        addToHistory([
          { type: 'success', text: '━━━ VERSION INFO ━━━' },
          { type: 'info', text: 'GPS Tracker : v1.0.0' },
          { type: 'info', text: 'React       : v19.2.7' },
          { type: 'info', text: 'Vite        : v8.1.0' },
          { type: 'info', text: 'Redux       : Latest' },
          { type: 'info', text: 'Build       : development' },
          { type: 'output', text: '' }
        ]);
        break;

      case 'about':
        addToHistory([
          { type: 'success', text: '━━━ GPS HACKER SYSTEM ━━━' },
          { type: 'info', text: 'Real-time GPS monitoring platform' },
          { type: 'info', text: 'Built with React + Redux + Leaflet' },
          { type: 'info', text: 'Location: Madagascar' },
          { type: 'info', text: 'Author: Development Team' },
          { type: 'output', text: '' }
        ]);
        break;

      case 'changelog':
        addToHistory([
          { type: 'success', text: '━━━ CHANGELOG ━━━' },
          { type: 'success', text: 'v1.0.0 - Initial release' },
          { type: 'info', text: '  + Interactive terminal' },
          { type: 'info', text: '  + Mission control widgets' },
          { type: 'info', text: '  + Real-time GPS tracking' },
          { type: 'info', text: '  + Smart alerts system' },
          { type: 'info', text: '  + User authentication' },
          { type: 'info', text: '  + Reports and exports' },
          { type: 'output', text: '' }
        ]);
        break;

      case 'echo':
        addToHistory([
          { type: 'info', text: args.join(' ') || '(empty)' },
          { type: 'output', text: '' }
        ]);
        break;

      case 'calc': {
        try {
          const expr = args.join(' ').replace(/[^0-9+\-*/().\s]/g, '');
          if (!expr) {
            addToHistory([{ type: 'error', text: 'Usage: calc <expression>' }]);
            break;
          }
          const result = new Function('return ' + expr)();
          addToHistory([
            { type: 'success', text: `${expr} = ${result}` },
            { type: 'output', text: '' }
          ]);
        } catch (err) {
          addToHistory([{ type: 'error', text: 'Invalid expression' }]);
        }
        break;
      }

      case 'base64': {
        if (args.length === 0) {
          addToHistory([{ type: 'error', text: 'Usage: base64 <text>' }]);
          break;
        }
        try {
          const text = args.join(' ');
          const encoded = btoa(text);
          addToHistory([
            { type: 'success', text: `Encoded: ${encoded}` },
            { type: 'output', text: '' }
          ]);
        } catch (err) {
          addToHistory([{ type: 'error', text: 'Encoding failed' }]);
        }
        break;
      }

      case 'hash': {
        if (args.length === 0) {
          addToHistory([{ type: 'error', text: 'Usage: hash <text>' }]);
          break;
        }
        const hashText = args.join(' ');
        let hash = 0;
        for (let i = 0; i < hashText.length; i++) {
          hash = ((hash << 5) - hash) + hashText.charCodeAt(i);
          hash |= 0;
        }
        addToHistory([
          { type: 'success', text: `Hash: ${Math.abs(hash).toString(16).toUpperCase()}` },
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'rand': {
        const min = parseInt(args[0]) || 0;
        const max = parseInt(args[1]) || 100;
        if (min >= max) {
          addToHistory([{ type: 'error', text: 'min must be less than max' }]);
          break;
        }
        const rand = Math.floor(Math.random() * (max - min + 1)) + min;
        addToHistory([
          { type: 'success', text: `Random [${min}-${max}]: ${rand}` },
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'uuid': {
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        addToHistory([
          { type: 'success', text: `UUID: ${uuid}` },
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'ascii': {
        if (args.length === 0) {
          addToHistory([{ type: 'error', text: 'Usage: ascii <character>' }]);
          break;
        }
        const char = args[0].charAt(0);
        addToHistory([
          { type: 'success', text: `ASCII '${char}' = ${char.charCodeAt(0)}` },
          { type: 'info', text: `Hex : 0x${char.charCodeAt(0).toString(16).toUpperCase()}` },
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'matrix':
        addToHistory([
          { type: 'success', text: '01001000 01100001 01100011 01101011' },
          { type: 'success', text: '01100101 01110010 00100000 01001101' },
          { type: 'success', text: '01101111 01100100 01100101 00100001' },
          { type: 'info', text: 'The Matrix has you...' },
          { type: 'info', text: 'Follow the white rabbit.' },
          { type: 'output', text: '' }
        ]);
        break;

      case 'quote': {
        const quotes = [
          'The only way to do great work is to love what you do.',
          'Innovation distinguishes between a leader and a follower.',
          'Code is poetry.',
          'Simplicity is the ultimate sophistication.',
          'Stay hungry, stay foolish.',
          'Talk is cheap. Show me the code.',
          'First, solve the problem. Then, write the code.',
          'Programs must be written for people to read.'
        ];
        addToHistory([
          { type: 'info', text: `"${quotes[Math.floor(Math.random() * quotes.length)]}"` },
          { type: 'output', text: '' }
        ]);
        break;
      }

      case 'reload':
        addToHistory([{ type: 'warn', text: 'Reloading page in 1 second...' }]);
        setTimeout(() => window.location.reload(), 1000);
        break;

      case 'logout':
        addToHistory([{ type: 'warn', text: 'Logging out...' }]);
        setTimeout(() => {
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 1000);
        break;

      case 'history':
        if (commandHistory.length === 0) {
          addToHistory([{ type: 'info', text: 'No command history yet' }]);
          break;
        }
        addToHistory([
          { type: 'success', text: `Last ${Math.min(15, commandHistory.length)} commands:` },
          ...commandHistory.slice(0, 15).map((c, i) => ({
            type: 'info',
            text: `  ${(i + 1).toString().padStart(2)}. ${c}`
          })),
          { type: 'output', text: '' }
        ]);
        break;

      default:
        addToHistory([
          { type: 'error', text: `Command not found: "${command}"` },
          { type: 'info',  text: 'Type "help" for available commands' },
          { type: 'output', text: '' }
        ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(commandInput);
      setCommandInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(newIndex);
        setCommandInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommandInput(commandHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    }
  };

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

  const totalDistance = allDevices.reduce((sum, d) => sum + (d.totalDistance || 0), 0);
  const avgBattery = Math.round(allDevices.reduce((s, d) => s + (d.battery || 0), 0) / (allDevices.length || 1));
  const avgSpeed = Math.round(allDevices.reduce((s, d) => s + (d.speed || 0), 0) / (allDevices.length || 1));
  const systemLoad = Math.round((stats.online / (stats.total || 1)) * 100);
  const missionProgress = ((currentTime.getSeconds() % 60) / 60) * 100;

  return (
    <div className="dashboard">

      <div className="section-header">
        <h2 className="section-title">System Overview</h2>
        <span className="section-time">
          {currentTime.toLocaleTimeString('fr-FR')}
        </span>
      </div>

      <div className="stats-grid">
        <StatsCard icon="⊞" label="TOTAL DEVICES" value={stats.total}    color="#00ff41" />
        <StatsCard icon="◉" label="ONLINE"        value={stats.online}   color="#00ff41" glow />
        <StatsCard icon="◎" label="IDLE"          value={stats.idle}     color="#ff6600" />
        <StatsCard icon="✖" label="OFFLINE"       value={stats.offline}  color="#ff003c" />
        <StatsCard icon="⚠" label="ALERTS"        value={alertStats.unread} color="#ff003c" glow={alertStats.unread > 0} />
        <StatsCard icon="⬡" label="DISTANCE"      value={`${totalDistance} km`} color="#00ffff" />
      </div>

      <div className="terminal-row">

        <div className="dashboard-section terminal-half">
          <div className="terminal-box terminal-interactive" onClick={handleTerminalClick}>
            <div className="terminal-header">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
              <span className="terminal-title">gps@tracker:~$ </span>
            </div>

            <div className="terminal-content">
              {terminalHistory.map((line, i) => (
                <div key={i} className="terminal-line">
                  {line.type === 'command' && (
                    <>
                      <span className="terminal-prompt">gps@tracker:~$</span>
                      <span className="terminal-cmd-input">{line.text}</span>
                    </>
                  )}
                  {line.type === 'system' && (
                    <span style={{color: '#00ffff', fontWeight: 700}}>{line.text}</span>
                  )}
                  {line.type === 'success' && (
                    <span className="terminal-success">{line.text}</span>
                  )}
                  {line.type === 'error' && (
                    <span className="terminal-error">{line.text}</span>
                  )}
                  {line.type === 'warn' && (
                    <span className="terminal-warn">{line.text}</span>
                  )}
                  {line.type === 'info' && (
                    <span style={{color: '#00ffff'}}>{line.text}</span>
                  )}
                  {line.type === 'output' && (
                    <span className="terminal-output">{line.text}</span>
                  )}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            <div className="terminal-input-fixed">
              <span className="terminal-prompt">gps@tracker:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="terminal-input"
                autoFocus
                spellCheck="false"
                autoComplete="off"
                placeholder="Type command..."
              />
            </div>
          </div>
        </div>

        <div className="dashboard-section system-monitor">
          <div className="monitor-header">
            <span className="monitor-icon">◆</span>
            <span className="monitor-title">SYSTEM MONITOR</span>
            <span className="monitor-live">● LIVE</span>
          </div>

          <div className="monitor-metric">
            <div className="metric-header">
              <span className="metric-label">◉ SYSTEM LOAD</span>
              <span className="metric-value">{systemLoad}%</span>
            </div>
            <div className="metric-bar">
              <div className="metric-fill metric-fill-green" style={{width: `${systemLoad}%`}}></div>
            </div>
          </div>

          <div className="monitor-metric">
            <div className="metric-header">
              <span className="metric-label">⚠ ALERTS RATIO</span>
              <span className="metric-value" style={{color: '#ff003c'}}>
                {alertStats.unread}/{alertStats.total}
              </span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill metric-fill-red"
                style={{width: `${(alertStats.unread / (alertStats.total || 1)) * 100}%`}}
              ></div>
            </div>
          </div>

          <div className="monitor-metric">
            <div className="metric-header">
              <span className="metric-label">🔋 AVG BATTERY</span>
              <span className="metric-value" style={{color: '#00ffff'}}>{avgBattery}%</span>
            </div>
            <div className="metric-bar">
              <div className="metric-fill metric-fill-cyan" style={{width: `${avgBattery}%`}}></div>
            </div>
          </div>

          <div className="monitor-metric">
            <div className="metric-header">
              <span className="metric-label">⚡ AVG SPEED</span>
              <span className="metric-value" style={{color: '#ff6600'}}>{avgSpeed} km/h</span>
            </div>
            <div className="metric-bar">
              <div
                className="metric-fill metric-fill-orange"
                style={{width: `${Math.min(100, avgSpeed)}%`}}
              ></div>
            </div>
          </div>

          <div className="monitor-divider">
            <span>◆ SYSTEM INFO ◆</span>
          </div>

          <div className="monitor-info-grid">
            <div className="info-card">
              <span className="info-card-label">TOTAL KM</span>
              <span className="info-card-value" style={{color: '#00ff41'}}>
                {totalDistance.toLocaleString()}
              </span>
            </div>
            <div className="info-card">
              <span className="info-card-label">ACTIVE</span>
              <span className="info-card-value" style={{color: '#00ff41'}}>
                {stats.online}
              </span>
            </div>
            <div className="info-card">
              <span className="info-card-label">SESSIONS</span>
              <span className="info-card-value" style={{color: '#00ffff'}}>
                {stats.total}
              </span>
            </div>
            <div className="info-card">
              <span className="info-card-label">UPTIME</span>
              <span className="info-card-value" style={{color: '#00ff41'}}>
                99.9%
              </span>
            </div>
          </div>

          <div className="monitor-footer">
            <div className="footer-item">
              <span className="footer-label">STATUS</span>
              <span className="footer-value" style={{color: '#00ff41'}}>ACTIVE</span>
            </div>
            <div className="footer-divider"></div>
            <div className="footer-item">
              <span className="footer-label">PING</span>
              <span className="footer-value">12ms</span>
            </div>
            <div className="footer-divider"></div>
            <div className="footer-item">
              <span className="footer-label">SERVER</span>
              <span className="footer-value" style={{color: '#00ff41'}}>OK</span>
            </div>
          </div>

        </div>
      </div>

      <div className="dashboard-section mission-control">

        <div className="mission-header">
          <div className="mission-title-wrap">
            <span className="mission-icon">◆</span>
            <div>
              <h3 className="mission-title">MISSION CONTROL</h3>
              <span className="mission-subtitle">Real-time operations center</span>
            </div>
          </div>
          <div className="mission-status-badge">
            <span className="mission-pulse"></span>
            <span>ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>

        <div className="mission-grid">

          <div className="mission-widget">
            <div className="widget-title">
              <span>◉</span> RADAR SCAN
            </div>
            <div className="radar-container">
              <div className="radar-circle"></div>
              <div className="radar-circle radar-circle-mid"></div>
              <div className="radar-circle radar-circle-inner"></div>
              <div className="radar-sweep"></div>
              <div className="radar-center"></div>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="radar-blip"
                  style={{
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.5}s`
                  }}
                />
              ))}
            </div>
            <div className="radar-stats">
              <span className="radar-stat">
                <span className="radar-stat-dot"></span>
                {stats.online} SIGNALS
              </span>
              <span className="radar-freq">433 MHz</span>
            </div>
          </div>

          <div className="mission-widget">
            <div className="widget-title">
              <span>◈</span> TEMPORAL DATA
            </div>
            <div className="clock-display">
              <div className="clock-time">
                {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="clock-date">
                {currentTime.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
              </div>
            </div>
            <div className="clock-info">
              <div className="clock-info-row">
                <span className="clock-info-label">TIMEZONE</span>
                <span className="clock-info-value">EAT +3</span>
              </div>
              <div className="clock-info-row">
                <span className="clock-info-label">LOCATION</span>
                <span className="clock-info-value">MADAGASCAR</span>
              </div>
              <div className="clock-info-row">
                <span className="clock-info-label">COORDS</span>
                <span className="clock-info-value">-18.87, 47.50</span>
              </div>
            </div>
          </div>

          <div className="mission-widget">
            <div className="widget-title">
              <span>◇</span> MISSION PROGRESS
            </div>
            <div className="mission-progress-ring">
              <svg width="110" height="110" viewBox="0 0 140 140">
                <circle
                  cx="70" cy="70" r="60"
                  fill="none"
                  stroke="rgba(0, 255, 65, 0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="70" cy="70" r="60"
                  fill="none"
                  stroke="#00ff41"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(missionProgress / 100) * 377} 377`}
                  transform="rotate(-90 70 70)"
                  style={{
                    filter: 'drop-shadow(0 0 6px #00ff41)',
                    transition: 'stroke-dasharray 0.5s ease'
                  }}
                />
                <text x="70" y="72" textAnchor="middle" fill="#00ff41" fontSize="26" fontWeight="700" fontFamily="monospace" dy="8">
                  {Math.round(missionProgress)}%
                </text>
                <text x="70" y="92" textAnchor="middle" fill="#666" fontSize="8" fontFamily="monospace" letterSpacing="2">
                  CYCLE
                </text>
              </svg>
            </div>
            <div className="progress-info">
              <div className="progress-info-item">
                <span className="dot-green"></span>
                <span>{stats.online} ACTIVE</span>
              </div>
              <div className="progress-info-item">
                <span className="dot-red"></span>
                <span>{stats.offline} INACTIVE</span>
              </div>
            </div>
          </div>

          <div className="mission-widget">
            <div className="widget-title">
              <span>◊</span> SIGNAL STRENGTH
            </div>
            <div className="signal-bars">
              {[85, 92, 78, 96, 88, 73, 91, 84].map((height, i) => (
                <div key={i} className="signal-bar-wrap">
                  <div
                    className="signal-bar"
                    style={{
                      height: `${height}%`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="signal-info">
              <div className="signal-info-item">
                <span className="signal-info-label">FREQ</span>
                <span className="signal-info-value">2.4 GHz</span>
              </div>
              <div className="signal-info-item">
                <span className="signal-info-label">PWR</span>
                <span className="signal-info-value">-42 dBm</span>
              </div>
              <div className="signal-info-item">
                <span className="signal-info-label">NOISE</span>
                <span className="signal-info-value">-95 dB</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;