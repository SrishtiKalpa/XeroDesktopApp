import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  User, 
  Settings, 
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe,
  Database
} from 'lucide-react';
import './Header.css';

const Header = ({ 
  sidebarCollapsed, 
  onToggleSidebar, 
  connectionStatus, 
  syncStatus, 
  lastSyncTime,
  useWebMode,
  onToggleMode,
  apiAvailable
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSyncNow = async () => {
    try {
      // Trigger manual sync
      console.log('Manual sync triggered');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const formatLastSyncTime = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const syncTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - syncTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw size={16} className="spinning" />;
      case 'success':
        return <CheckCircle size={16} className="success" />;
      case 'error':
        return <AlertCircle size={16} className="error" />;
      default:
        return <Clock size={16} className="neutral" />;
    }
  };

  const getConnectionIcon = () => {
    return connectionStatus.isOnline ? 
      <Wifi size={16} className="online" /> : 
      <WifiOff size={16} className="offline" />;
  };

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="menu-btn"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <Menu size={20} />
        </button>
        
        <div className="connection-indicator">
          {getConnectionIcon()}
          <span className="connection-text">
            {connectionStatus.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Mode Toggle */}
        {apiAvailable && (
          <button 
            className="mode-toggle-btn"
            onClick={onToggleMode}
            title={`Switch to ${useWebMode ? 'API' : 'Web'} Mode`}
          >
            {useWebMode ? <Database size={16} /> : <Globe size={16} />}
            <span className="mode-text">
              {useWebMode ? 'API Mode' : 'Web Mode'}
            </span>
          </button>
        )}
      </div>

      <div className="header-center">
        {!useWebMode && (
          <div className="sync-status">
            <div className="sync-indicator">
              {getSyncStatusIcon()}
              <span className="sync-text">
                {syncStatus === 'syncing' ? 'Syncing...' : 
                 syncStatus === 'success' ? 'Synced' : 
                 syncStatus === 'error' ? 'Sync Error' : 'Not Synced'}
              </span>
            </div>
            
            {lastSyncTime && (
              <span className="last-sync">
                Last sync: {formatLastSyncTime(lastSyncTime)}
              </span>
            )}
            
            <button 
              className="sync-btn"
              onClick={handleSyncNow}
              disabled={syncStatus === 'syncing' || !connectionStatus.isOnline}
              title="Sync Now"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        )}
        
        {useWebMode && (
          <div className="web-mode-indicator">
            <Globe size={16} />
            <span>Web Mode - Using Xero Web Interface</span>
          </div>
        )}
      </div>

      <div className="header-right">
        <div className="notification-container">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button className="mark-all-read">Mark all read</button>
              </div>
              
              <div className="notification-list">
                <div className="notification-item unread">
                  <div className="notification-icon">
                    <CheckCircle size={16} />
                  </div>
                  <div className="notification-content">
                    <p>Payment received for invoice INV-001</p>
                    <span className="notification-time">2 minutes ago</span>
                  </div>
                </div>
                
                <div className="notification-item unread">
                  <div className="notification-icon">
                    <AlertCircle size={16} />
                  </div>
                  <div className="notification-content">
                    <p>Invoice INV-002 is overdue</p>
                    <span className="notification-time">1 hour ago</span>
                  </div>
                </div>
                
                <div className="notification-item">
                  <div className="notification-icon">
                    <RefreshCw size={16} />
                  </div>
                  <div className="notification-content">
                    <p>Sync completed successfully</p>
                    <span className="notification-time">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="user-menu-container">
          <button 
            className="user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="User Menu"
          >
            <User size={20} />
            <span className="user-name">John Doe</span>
          </button>
          
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-avatar">
                  <User size={24} />
                </div>
                <div className="user-details">
                  <span className="user-full-name">John Doe</span>
                  <span className="user-email">john.doe@company.com</span>
                </div>
              </div>
              
              <div className="user-menu-items">
                <button className="menu-item">
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                
                <button className="menu-item">
                  <User size={16} />
                  <span>Profile</span>
                </button>
                
                <div className="menu-divider"></div>
                
                <button className="menu-item logout">
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
