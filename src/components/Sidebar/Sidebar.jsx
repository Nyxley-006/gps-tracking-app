import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toggleCollapse } from '../../store/slices/uiSlice';
import './Sidebar.css';

const menuItems = [
  { path: '/', icon: '▣', label: 'Dashboard' },
  { path: '/tracking', icon: '◉', label: 'Live Map' },
  { path: '/devices', icon: '⊞', label: 'Appareils' },
  { path: '/alerts', icon: '⚠', label: 'Alertes' },
  { path: '/reports', icon: '≡', label: 'Rapports' }
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const sidebarCollapsed = useSelector(
    (state) => state.ui?.sidebarCollapsed ?? false
  );

  const unreadCount = useSelector(
    (state) => state.alerts?.stats?.unread ?? 0
  );

  const user = useSelector(
    (state) => state.auth?.user ?? null
  );

  const userInitial = (user?.username || 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>

      {/* LOGO */}
      <div className="sidebar-logo">
        <span className="logo-icon animate-rotateSlow">◎</span>

        {!sidebarCollapsed && (
          <div className="logo-text">
            <span className="logo-title neon-text-green">GPS TRACKER</span>
            <span className="logo-sub">Hacker System v1.0</span>
          </div>
        )}

        <button
          type="button"
          className="collapse-btn"
          onClick={() => dispatch(toggleCollapse())}
        >
          {sidebarCollapsed ? '»' : '«'}
        </button>
      </div>

      {/* STATUS */}
      {!sidebarCollapsed && (
        <div className="sidebar-status">
          <span className="status-dot animate-blink"></span>
          <span className="status-text">SYSTEM ONLINE</span>
        </div>
      )}

      {/* SCROLLABLE AREA */}
      <div className="sidebar-scroll-area">

        {/* NAV MENU */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>

              {!sidebarCollapsed && (
                <>
                  <span className="nav-label">{item.label}</span>

                  {item.path === '/alerts' && unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hacker-divider"></div>

        {/* USER CARD */}
        {!sidebarCollapsed && (
          <div className="sidebar-user-card">

            {/* Cover */}
            <div className="user-cover">
              <div className="user-cover-overlay"></div>
              <div className="user-cover-info">
                <span className="user-cover-dot"></span>
                <span>SECURE SESSION</span>
              </div>
            </div>

            {/* Corners */}
            <span className="user-corner user-corner-tl"></span>
            <span className="user-corner user-corner-tr"></span>
            <span className="user-corner user-corner-bl"></span>
            <span className="user-corner user-corner-br"></span>

            {/* Avatar */}
            <div className="user-avatar-container">
              <div className="user-avatar-wrapper">
                <div className="user-avatar-ring"></div>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.username}
                    className="user-avatar-img"
                  />
                ) : (
                  <div className="user-avatar-default">
                    {userInitial}
                  </div>
                )}
                <span className="user-online-dot"></span>
              </div>

              <button
                className="user-photo-btn"
                onClick={() => alert('Changement de photo - À venir')}
                title="Changer la photo"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            </div>

            {/* Main Info */}
            <div className="user-main-info">
              <h3 className="user-display-name">{user?.username || 'admin'}</h3>
              <div className="user-role-badge">
                <span className="role-dot"></span>
                {(user?.role || 'user').toUpperCase()}
              </div>
            </div>

            {/* Email */}
            <div className="user-detail-row">
              <span className="user-detail-icon">✉</span>
              <span className="user-detail-text">
                {user?.email || 'admin@gpshacker.com'}
              </span>
            </div>

            {/* Location */}
            <div className="user-detail-row">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="user-detail-text">Antananarivo, MG</span>
            </div>

            {/* Bio */}
            <div className="user-bio">
              <span className="user-bio-icon">◉</span>
              <span>GPS~Tracker</span>
            </div>


            {/* System Info */}
            <div className="user-system-info">
              <div className="user-info-line">
                <span className="user-info-label">ID</span>
                <span className="user-info-value">#{user?.id || '001'}</span>
              </div>
              <div className="user-info-line">
                <span className="user-info-label">SESSION</span>
                <span className="user-info-value session-time">
                  {new Date().toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="user-info-line">
                <span className="user-info-label">STATUS</span>
                <span className="user-info-value" style={{color: '#00ff41'}}>
                  ● ACTIVE
                </span>
              </div>
              <div className="user-info-line">
                <span className="user-info-label">ACCESS</span>
                <span className="user-info-value" style={{color: '#00ffff'}}>
                  LEVEL 5
                </span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* LOGOUT - Toujours en bas */}
      <button
        type="button"
        className="logout-btn"
        onClick={handleLogout}
      >
        <span className="nav-icon">⏻</span>
        {!sidebarCollapsed && <span>Déconnexion</span>}
      </button>

    </aside>
  );
};

export default Sidebar;