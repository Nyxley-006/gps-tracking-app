import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { setSearch } from '../../store/slices/deviceSlice';
import { fetchDevices } from '../../store/slices/deviceSlice';
import { fetchAlerts } from '../../store/slices/alertSlice';
import './Header.css';

// ════════════════════════════════════════
//  PAGE TITLES
// ════════════════════════════════════════
const pageTitles = {
  '/':          'SYSTEM DASHBOARD',
  '/tracking':  'LIVE TRACKING MAP',
  '/devices':   'DEVICES MANAGEMENT',
  '/alerts':    'ALERTS CENTER',
  '/geofence':  'GEOFENCE ZONES',
  '/reports':   'REPORTS'
};

const Header = () => {
  const dispatch  = useDispatch();
  const location  = useLocation();
  const { user }  = useSelector((state) => state.auth);
  const { stats } = useSelector((state) => state.devices);
  const alertStats = useSelector((state) => state.alerts.stats);

  const [clock, setClock]     = useState('');
  const [dateStr, setDateStr] = useState('');
  const [searchValue, setSearchValue] = useState('');

  // ── Live Clock ──
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('fr-FR', {
          hour:   '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
      setDateStr(
        now.toLocaleDateString('fr-FR', {
          day:   '2-digit',
          month: '2-digit',
          year:  'numeric'
        })
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Search ──
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    dispatch(setSearch(val));
  };

  // ── Refresh ──
  const handleRefresh = () => {
    dispatch(fetchDevices());
    dispatch(fetchAlerts());
  };

  const pageTitle = pageTitles[location.pathname] || 'GPS TRACKER';

  return (
    <header className="header">

      {/* ── LEFT ── */}
      <div className="header-left">
        <h2 className="header-title">{pageTitle}</h2>
        <div className="header-indicators">
          <span className="indicator indicator-green">
            <span className="indicator-dot animate-blink"></span>
            {stats.online} EN LIGNE
          </span>
          <span className="indicator indicator-red">
            <span className="indicator-dot-red"></span>
            {alertStats.unread} ALERTES
          </span>
        </div>
      </div>

      {/* ── CENTER : SEARCH ── 
      <div className="header-center">
        <div className="search-wrapper">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher device, IMEI, driver..."
            value={searchValue}
            onChange={handleSearch}
          />
          {searchValue && (
            <button
              className="search-clear"
              onClick={() => {
                setSearchValue('');
                dispatch(setSearch(''));
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      */}

      {/* ── RIGHT ── */}
      <div className="header-right">

        {/* Refresh */}
        <button
          className="header-btn"
          onClick={handleRefresh}
          title="Rafraîchir"
        >
          ↻
        </button>

        {/* Clock */}
        <div className="header-clock">
          <span className="clock-time">{clock}</span>
          <span className="clock-date">{dateStr}</span>
        </div>

        {/* User */}
        <div className="header-user">
          <div className="header-avatar">
            {(user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="header-user-info">
            <span className="header-user-name">
              {user?.username || 'guest'}
            </span>
            <span className="header-user-role">
              {user?.role || 'user'}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;