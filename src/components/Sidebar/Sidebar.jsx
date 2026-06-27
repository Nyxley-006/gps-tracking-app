import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toggleCollapse } from '../../store/slices/uiSlice';
import './Sidebar.css';

const menuItems = [
  { path: '/', icon: '▣', label: 'Dashboard' },
  { path: '/tracking', icon: '◉', label: 'Live Map' },
  { path: '/devices', icon: '⊞', label: 'Devices' },
  { path: '/alerts', icon: '⚠', label: 'Alertes' },
  { path: '/geofence', icon: '⬡', label: 'Geofence' },
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

      {!sidebarCollapsed && (
        <div className="sidebar-status">
          <span className="status-dot animate-blink"></span>
          <span className="status-text">SYSTEM ONLINE</span>
        </div>
      )}

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

      {!sidebarCollapsed && (
        <div className="sidebar-user">
          <div className="user-avatar">{userInitial}</div>

          <div className="user-info">
            <span className="user-name">{user?.username || 'admin'}</span>
            <span className="user-role">{user?.role || 'user'}</span>
          </div>
        </div>
      )}

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