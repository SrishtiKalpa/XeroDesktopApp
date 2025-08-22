const fetchDynamic = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { v4: uuidv4 } = require('uuid');

class SyncManager {
  constructor(database, store) {
    this.database = database;
    this.store = store;
    this.isOnline = false;
    this.syncInterval = null;
    this.syncInProgress = false;
    this.xeroApiUrl = 'https://api.xero.com/api.xro/2.0';
    this.accessToken = null;
    this.tenantId = null;
  }

  start() {
    // Check connection status every 30 seconds
    this.syncInterval = setInterval(() => {
      this.checkConnection();
    }, 30000);

    // Initial connection check
    this.checkConnection();
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async checkConnection() {
    try {
      const response = await fetchDynamic('https://www.google.com', { 
        method: 'HEAD',
        timeout: 5000 
      });
      
      const wasOnline = this.isOnline;
      this.isOnline = response.ok;
      
      // If we just came back online, trigger a sync
      if (!wasOnline && this.isOnline) {
        console.log('Connection restored, starting sync...');
        this.syncPendingData();
      }
      
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  async syncData(data) {
    if (!this.isOnline) {
      // Store data for later sync
      await this.addToSyncQueue(data.table, data.id, data.action, data);
      return { success: false, message: 'Offline - data queued for sync' };
    }

    try {
      const result = await this.performSync(data);
      return { success: true, data: result };
    } catch (error) {
      console.error('Sync error:', error);
      await this.addToSyncQueue(data.table, data.id, data.action, data);
      return { success: false, message: error.message };
    }
  }

  async performSync(data) {
    const { table, action, record } = data;
    
    switch (action) {
      case 'create':
        return await this.createRecord(table, record);
      case 'update':
        return await this.updateRecord(table, record);
      case 'delete':
        return await this.deleteRecord(table, record.id);
      default:
        throw new Error(`Unknown sync action: ${action}`);
    }
  }

  async createRecord(table, record) {
    const endpoint = this.getEndpointForTable(table);
    const response = await this.makeXeroRequest(endpoint, 'POST', record);
    
    if (response.success) {
      // Update local record with Xero ID
      await this.database.saveData(table, {
        ...record,
        xero_id: response.data.Id,
        sync_status: 'synced',
        is_offline: 0
      });
    }
    
    return response;
  }

  async updateRecord(table, record) {
    const endpoint = `${this.getEndpointForTable(table)}/${record.xero_id}`;
    const response = await this.makeXeroRequest(endpoint, 'PUT', record);
    
    if (response.success) {
      await this.database.saveData(table, {
        ...record,
        sync_status: 'synced',
        is_offline: 0
      });
    }
    
    return response;
  }

  async deleteRecord(table, recordId) {
    const record = await this.database.getData(table, { id: recordId });
    if (!record || !record[0] || !record[0].xero_id) {
      throw new Error('Record not found or no Xero ID');
    }
    
    const endpoint = `${this.getEndpointForTable(table)}/${record[0].xero_id}`;
    const response = await this.makeXeroRequest(endpoint, 'DELETE');
    
    if (response.success) {
      await this.database.saveData(table, {
        ...record[0],
        sync_status: 'deleted',
        is_offline: 0
      });
    }
    
    return response;
  }

  getEndpointForTable(table) {
    const endpoints = {
      invoices: '/Invoices',
      bills: '/Bills',
      contacts: '/Contacts',
      bank_transactions: '/BankTransactions',
      expense_claims: '/ExpenseClaims'
    };
    
    return endpoints[table] || `/${table}`;
  }

  async makeXeroRequest(endpoint, method, data = null) {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Xero');
    }

    const url = `${this.xeroApiUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Xero-tenant-id': this.tenantId,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const options = {
      method,
      headers,
      timeout: 30000
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(this.formatDataForXero(data));
    }

    try {
      const response = await fetchDynamic(url, options);
      
      if (!response.ok) {
        throw new Error(`Xero API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  formatDataForXero(data) {
    // Transform local data format to Xero API format
    const xeroData = { ...data };
    
    // Remove local-only fields
    delete xeroData.id;
    delete xeroData.is_offline;
    delete xeroData.sync_status;
    delete xeroData.created_at;
    delete xeroData.updated_at;
    
    // Format dates
    if (xeroData.date) {
      xeroData.Date = xeroData.date;
      delete xeroData.date;
    }
    
    if (xeroData.due_date) {
      xeroData.DueDate = xeroData.due_date;
      delete xeroData.due_date;
    }
    
    // Format line items
    if (xeroData.line_items) {
      xeroData.LineItems = xeroData.line_items.map(item => ({
        Description: item.description,
        Quantity: item.quantity,
        UnitAmount: item.unit_amount,
        AccountCode: item.account_code,
        TaxType: item.tax_type
      }));
      delete xeroData.line_items;
    }
    
    return xeroData;
  }

  async syncPendingData() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    
    try {
      const syncQueue = await this.database.getSyncQueue();
      
      for (const item of syncQueue) {
        try {
          await this.performSync(item.data);
          await this.database.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          // Increment retry count and skip if too many retries
          if (item.retry_count >= 3) {
            await this.database.removeFromSyncQueue(item.id);
          }
        }
      }
    } catch (error) {
      console.error('Error during pending data sync:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async addToSyncQueue(table, recordId, action, data) {
    return await this.database.addToSyncQueue(table, recordId, action, data);
  }

  async resolveConflict(localRecord, serverRecord, resolution) {
    // Handle data conflicts between local and server versions
    let finalRecord;
    
    switch (resolution) {
      case 'local':
        finalRecord = localRecord;
        break;
      case 'server':
        finalRecord = serverRecord;
        break;
      case 'merge':
        // Merge strategy - take the most recent changes
        finalRecord = this.mergeRecords(localRecord, serverRecord);
        break;
      default:
        throw new Error(`Unknown conflict resolution: ${resolution}`);
    }
    
    // Update local record
    await this.database.saveData(localRecord.table, {
      ...finalRecord,
      sync_status: 'synced',
      is_offline: 0
    });
    
    return finalRecord;
  }

  mergeRecords(localRecord, serverRecord) {
    // Simple merge strategy - prefer server data but keep local offline changes
    const merged = { ...serverRecord };
    
    // Keep local offline changes that haven't been synced
    if (localRecord.is_offline && localRecord.sync_status === 'pending') {
      // Merge line items if they exist
      if (localRecord.line_items && serverRecord.line_items) {
        merged.line_items = this.mergeLineItems(localRecord.line_items, serverRecord.line_items);
      }
      
      // Keep local notes if they're more recent
      if (localRecord.notes && (!serverRecord.notes || new Date(localRecord.updated_at) > new Date(serverRecord.updated_at))) {
        merged.notes = localRecord.notes;
      }
    }
    
    return merged;
  }

  mergeLineItems(localItems, serverItems) {
    // Merge line items by ID or create new ones
    const merged = [...serverItems];
    
    localItems.forEach(localItem => {
      const existingIndex = merged.findIndex(item => item.id === localItem.id);
      if (existingIndex >= 0) {
        merged[existingIndex] = { ...merged[existingIndex], ...localItem };
      } else {
        merged.push(localItem);
      }
    });
    
    return merged;
  }

  async setCredentials(accessToken, tenantId) {
    this.accessToken = accessToken;
    this.tenantId = tenantId;
    
    // Store credentials securely
    this.store.set('xero.accessToken', accessToken);
    this.store.set('xero.tenantId', tenantId);
  }

  async loadCredentials() {
    this.accessToken = this.store.get('xero.accessToken');
    this.tenantId = this.store.get('xero.tenantId');
    return { accessToken: this.accessToken, tenantId: this.tenantId };
  }

  async clearCredentials() {
    this.accessToken = null;
    this.tenantId = null;
    this.store.delete('xero.accessToken');
    this.store.delete('xero.tenantId');
  }

  isAuthenticated() {
    return !!(this.accessToken && this.tenantId);
  }

  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      isAuthenticated: this.isAuthenticated(),
      syncInProgress: this.syncInProgress
    };
  }
}

module.exports = SyncManager;
