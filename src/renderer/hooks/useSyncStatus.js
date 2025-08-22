import { useState, useEffect } from 'react';

export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState({
    status: 'idle', // 'idle', 'syncing', 'success', 'error'
    lastSyncTime: null,
    pendingItems: 0,
    errorMessage: null
  });

  useEffect(() => {
    let intervalId;

    const checkSyncStatus = async () => {
      try {
        // Get sync queue status
        const syncQueue = await window.electronAPI.getDatabaseData('sync_queue', {});
        
        setSyncStatus(prev => ({
          ...prev,
          pendingItems: syncQueue.length,
          status: syncQueue.length > 0 ? 'pending' : 'success'
        }));
      } catch (error) {
        console.error('Failed to check sync status:', error);
        setSyncStatus(prev => ({
          ...prev,
          status: 'error',
          errorMessage: error.message
        }));
      }
    };

    // Initial check
    checkSyncStatus();

    // Set up periodic checks
    intervalId = setInterval(checkSyncStatus, 10000); // Check every 10 seconds

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const startSync = async () => {
    try {
      setSyncStatus(prev => ({
        ...prev,
        status: 'syncing',
        errorMessage: null
      }));

      // Trigger sync
      const result = await window.electronAPI.syncData({ action: 'sync-all' });
      
      if (result.success) {
        setSyncStatus(prev => ({
          ...prev,
          status: 'success',
          lastSyncTime: new Date().toISOString(),
          errorMessage: null
        }));
      } else {
        setSyncStatus(prev => ({
          ...prev,
          status: 'error',
          errorMessage: result.message
        }));
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        status: 'error',
        errorMessage: error.message
      }));
    }
  };

  const clearError = () => {
    setSyncStatus(prev => ({
      ...prev,
      status: 'idle',
      errorMessage: null
    }));
  };

  return {
    syncStatus: syncStatus.status,
    lastSyncTime: syncStatus.lastSyncTime,
    pendingItems: syncStatus.pendingItems,
    errorMessage: syncStatus.errorMessage,
    startSync,
    clearError
  };
};
