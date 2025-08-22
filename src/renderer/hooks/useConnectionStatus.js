import { useState, useEffect } from 'react';

export const useConnectionStatus = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    isOnline: true,
    lastChecked: null,
    retryCount: 0
  });

  useEffect(() => {
    let intervalId;

    const checkConnection = async () => {
      try {
        const isOnline = await window.electronAPI.checkConnection();
        setConnectionStatus(prev => ({
          ...prev,
          isOnline,
          lastChecked: new Date().toISOString(),
          retryCount: isOnline ? 0 : prev.retryCount + 1
        }));
      } catch (error) {
        console.error('Connection check failed:', error);
        setConnectionStatus(prev => ({
          ...prev,
          isOnline: false,
          lastChecked: new Date().toISOString(),
          retryCount: prev.retryCount + 1
        }));
      }
    };

    // Initial check
    checkConnection();

    // Set up periodic checks
    intervalId = setInterval(checkConnection, 30000); // Check every 30 seconds

    // Listen for online/offline events
    const handleOnline = () => {
      setConnectionStatus(prev => ({
        ...prev,
        isOnline: true,
        lastChecked: new Date().toISOString(),
        retryCount: 0
      }));
    };

    const handleOffline = () => {
      setConnectionStatus(prev => ({
        ...prev,
        isOnline: false,
        lastChecked: new Date().toISOString(),
        retryCount: prev.retryCount + 1
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline: connectionStatus.isOnline,
    connectionStatus,
    lastChecked: connectionStatus.lastChecked,
    retryCount: connectionStatus.retryCount
  };
};
