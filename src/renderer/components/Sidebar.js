import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Receipt, 
  Users, 
  CreditCard, 
  FileSpreadsheet, 
  BarChart3, 
  Settings, 
  Plus,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Wifi,
  WifiOff,
  Globe,
  Database
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ collapsed, onToggle, currentPath, onUrlClick, useWebMode, apiAvailable }) => {
  const [recentUrls, setRecentUrls] = useState([]);
  const [shortcuts, setShortcuts] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [showAddShortcut, setShowAddShortcut] = useState(false);
  const [newShortcut, setNewShortcut] = useState({ name: '', url: '', icon: 'Star' });
  
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentUrls();
    loadShortcuts();
    checkConnectionStatus();
  }, []);

  const loadRecentUrls = async () => {
    try {
      const urls = await window.electronAPI.getDatabaseData('recent_urls', {});
      setRecentUrls(urls.slice(0, 5)); // Show last 5
    } catch (error) {
      console.error('Failed to load recent URLs:', error);
    }
  };

  const loadShortcuts = async () => {
    try {
      const shortcutsData = await window.electronAPI.getDatabaseData('navigation_shortcuts', {});
      setShortcuts(shortcutsData);
    } catch (error) {
      console.error('Failed to load shortcuts:', error);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const status = await window.electronAPI.checkConnection();
      setIsOnline(status);
    } catch (error) {
      setIsOnline(false);
    }
  };

  const handleAddShortcut = async () => {
    if (!newShortcut.name || !newShortcut.url) return;

    try {
      await window.electronAPI.saveDatabaseData('navigation_shortcuts', newShortcut);
      setNewShortcut({ name: '', url: '', icon: 'Star' });
      setShowAddShortcut(false);
      loadShortcuts();
    } catch (error) {
      console.error('Failed to add shortcut:', error);
    }
  };

  const handleRemoveShortcut = async (id) => {
    try {
      await window.electronAPI.getDatabaseData('navigation_shortcuts', { id });
      loadShortcuts();
    } catch (error) {
      console.error('Failed to remove shortcut:', error);
    }
  };

  const handleUrlClick = async (url, title) => {
    try {
      // Add to recent URLs
      await window.electronAPI.saveDatabaseData('recent_urls', {
        url,
        title,
        last_visited: new Date().toISOString()
      });
      
      // Navigate to URL
      if (onUrlClick) {
        onUrlClick(url);
      } else {
        navigate(url);
      }
      loadRecentUrls();
    } catch (error) {
      console.error('Failed to handle URL click:', error);
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      Home,
      FileText,
      Receipt,
      Users,
      CreditCard,
      FileSpreadsheet,
      BarChart3,
      Settings,
      Star,
      Clock
    };
    return icons[iconName] || Star;
  };

  const getWebModeNavigationItems = () => [
    { 
      path: 'https://go.xero.com/Dashboard/', 
      icon: Home, 
      label: 'Dashboard',
      isWeb: true
    },
    { 
      path: 'https://go.xero.com/Invoices/', 
      icon: FileText, 
      label: 'Invoices',
      isWeb: true
    },
    { 
      path: 'https://go.xero.com/Bills/', 
      icon: Receipt, 
      label: 'Bills',
      isWeb: true
    },
    { 
      path: 'https://go.xero.com/Contacts/', 
      icon: Users, 
      label: 'Contacts',
      isWeb: true
    },
    { 
      path: 'https://go.xero.com/BankAccounts/', 
      icon: CreditCard, 
      label: 'Bank Accounts',
      isWeb: true
    },
    { 
      path: 'https://go.xero.com/ExpenseClaims/', 
      icon: FileSpreadsheet, 
      label: 'Expense Claims',
      isWeb: true
    },
    { 
      path: 'https://go.xero.com/Reports/', 
      icon: BarChart3, 
      label: 'Reports',
      isWeb: true
    },
    { 
      path: 'https://go.xero.com/Settings/', 
      icon: Settings, 
      label: 'Settings',
      isWeb: true
    }
  ];

  const getApiModeNavigationItems = () => [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/invoices', icon: FileText, label: 'Invoices' },
    { path: '/bills', icon: Receipt, label: 'Bills' },
    { path: '/contacts', icon: Users, label: 'Contacts' },
    { path: '/bank-transactions', icon: CreditCard, label: 'Bank Transactions' },
    { path: '/expense-claims', icon: FileSpreadsheet, label: 'Expense Claims' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const navigationItems = useWebMode ? getWebModeNavigationItems() : getApiModeNavigationItems();

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <img src="assets/xero-logo.png" alt="Xero" />
          {!collapsed && <span>Xero Desktop</span>}
        </div>
        <button className="toggle-btn" onClick={onToggle}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="connection-status">
        <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
        </div>
        {!collapsed && (
          <span className="status-text">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        )}
      </div>

      {/* Mode Indicator */}
      {!collapsed && (
        <div className="mode-indicator">
          <div className={`mode-badge ${useWebMode ? 'web-mode' : 'api-mode'}`}>
            {useWebMode ? <Globe size={14} /> : <Database size={14} />}
            <span>{useWebMode ? 'Web Mode' : 'API Mode'}</span>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = useWebMode ? 
            currentPath === item.path : 
            currentPath.startsWith(item.path);
          
          if (useWebMode || item.isWeb) {
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleUrlClick(item.path, item.label)}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          } else {
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          }
        })}
      </nav>

      {!collapsed && (
        <>
          {/* Custom Shortcuts */}
          <div className="sidebar-section">
            <div className="section-header">
              <h3>Shortcuts</h3>
              <button 
                className="add-btn"
                onClick={() => setShowAddShortcut(true)}
                title="Add Shortcut"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="shortcuts-list">
              {shortcuts.map((shortcut) => {
                const Icon = getIconComponent(shortcut.icon);
                return (
                  <div key={shortcut.id} className="shortcut-item">
                    <button
                      className="shortcut-btn"
                      onClick={() => handleUrlClick(shortcut.url, shortcut.name)}
                      title={shortcut.name}
                    >
                      <Icon size={16} />
                      <span>{shortcut.name}</span>
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveShortcut(shortcut.id)}
                      title="Remove Shortcut"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recently Used URLs */}
          <div className="sidebar-section">
            <div className="section-header">
              <h3>Recent</h3>
              <Clock size={16} />
            </div>
            
            <div className="recent-urls-list">
              {recentUrls.map((url) => (
                <button
                  key={url.id}
                  className="recent-url-item"
                  onClick={() => handleUrlClick(url.url, url.title)}
                  title={url.title}
                >
                  <span className="url-title">{url.title}</span>
                  <ExternalLink size={12} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Add Shortcut Modal */}
      {showAddShortcut && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Shortcut</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={newShortcut.name}
                onChange={(e) => setNewShortcut({ ...newShortcut, name: e.target.value })}
                placeholder="Shortcut name"
              />
            </div>
            <div className="form-group">
              <label>URL:</label>
              <input
                type="text"
                value={newShortcut.url}
                onChange={(e) => setNewShortcut({ ...newShortcut, url: e.target.value })}
                placeholder="https://go.xero.com/..."
              />
            </div>
            <div className="form-group">
              <label>Icon:</label>
              <select
                value={newShortcut.icon}
                onChange={(e) => setNewShortcut({ ...newShortcut, icon: e.target.value })}
              >
                <option value="Star">Star</option>
                <option value="FileText">Document</option>
                <option value="BarChart3">Chart</option>
                <option value="Settings">Settings</option>
                <option value="Home">Home</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddShortcut(false)}>Cancel</button>
              <button onClick={handleAddShortcut} className="primary">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
