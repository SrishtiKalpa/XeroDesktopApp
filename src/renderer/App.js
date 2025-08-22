import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Bills from './pages/Bills';
import Contacts from './pages/Contacts';
import BankTransactions from './pages/BankTransactions';
import ExpenseClaims from './pages/ExpenseClaims';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import OfflineMode from './pages/OfflineMode';
import WebView from './components/WebView';
import { useConnectionStatus } from './hooks/useConnectionStatus';
import { useSyncStatus } from './hooks/useSyncStatus';
import './styles/App.css';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWebUrl, setCurrentWebUrl] = useState(null);
  const [useWebMode, setUseWebMode] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isOnline, connectionStatus } = useConnectionStatus();
  const { syncStatus, lastSyncTime } = useSyncStatus();

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Check if user is authenticated
        const accessToken = await window.electronAPI.getStoreValue('xero.accessToken');
        
        // Check if API is available
        const apiStatus = await checkApiAvailability();
        setApiAvailable(apiStatus);
        
        // If no API access, default to web mode
        if (!accessToken || !apiStatus) {
          setUseWebMode(true);
          // Set default Xero web URL
          setCurrentWebUrl('https://go.xero.com/Dashboard/');
        }
        
        // Load recent URLs and shortcuts
        await loadNavigationData();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Fallback to web mode
        setUseWebMode(true);
        setCurrentWebUrl('https://go.xero.com/Dashboard/');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [navigate]);

  const checkApiAvailability = async () => {
    try {
      // Try to make a simple API call to check availability
      const response = await fetch('https://api.xero.com/api.xro/2.0/Organisation', {
        method: 'HEAD',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      console.log('API not available, falling back to web mode');
      return false;
    }
  };

  const loadNavigationData = async () => {
    try {
      // Load recent URLs and shortcuts from database
      // This will be handled by the Sidebar component
    } catch (error) {
      console.error('Failed to load navigation data:', error);
    }
  };

  const handleMenuAction = (action) => {
    switch (action) {
      case 'new-invoice':
        if (useWebMode) {
          setCurrentWebUrl('https://go.xero.com/Invoices/New');
        } else {
          navigate('/invoices/new');
        }
        break;
      case 'new-bill':
        if (useWebMode) {
          setCurrentWebUrl('https://go.xero.com/Bills/New');
        } else {
          navigate('/bills/new');
        }
        break;
      case 'sync-now':
        // Trigger manual sync
        break;
      default:
        break;
    }
  };

  const handleUrlNavigation = (url) => {
    if (useWebMode) {
      setCurrentWebUrl(url);
    } else {
      // Handle internal navigation
      navigate(url);
    }
  };

  useEffect(() => {
    // Listen for menu actions from main process
    const handleMenuActionEvent = (event, action) => {
      handleMenuAction(action);
    };

    window.electronAPI.onMenuAction(handleMenuActionEvent);

    return () => {
      window.electronAPI.removeAllListeners('menu-action');
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMode = () => {
    setUseWebMode(!useWebMode);
    if (!useWebMode) {
      // Switching to web mode
      setCurrentWebUrl('https://go.xero.com/Dashboard/');
    }
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading Xero Desktop...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        currentPath={location.pathname}
        onUrlClick={handleUrlNavigation}
        useWebMode={useWebMode}
        apiAvailable={apiAvailable}
      />
      
      <div className="app-main">
        <Header 
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          connectionStatus={connectionStatus}
          syncStatus={syncStatus}
          lastSyncTime={lastSyncTime}
          useWebMode={useWebMode}
          onToggleMode={toggleMode}
          apiAvailable={apiAvailable}
        />
        
        <main className="app-content">
          {!isOnline && (
            <OfflineMode />
          )}
          
          {useWebMode ? (
            <WebView 
              url={currentWebUrl}
              onUrlChange={setCurrentWebUrl}
            />
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/invoices/*" element={<Invoices />} />
              <Route path="/bills/*" element={<Bills />} />
              <Route path="/contacts/*" element={<Contacts />} />
              <Route path="/bank-transactions/*" element={<BankTransactions />} />
              <Route path="/expense-claims/*" element={<ExpenseClaims />} />
              <Route path="/reports/*" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
