const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(process.env.APPDATA || process.env.HOME, '.xero-desktop', 'xero.db');
    this.encryptionKey = 'xero-desktop-secure-key-2024'; // In production, this should be stored securely
  }

  initialize() {
    // Ensure directory exists
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  createTables() {
    const tables = [
      // Invoices table
      `CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        xero_id TEXT,
        contact_id TEXT,
        contact_name TEXT,
        invoice_number TEXT,
        reference TEXT,
        status TEXT,
        total REAL,
        amount_due REAL,
        date TEXT,
        due_date TEXT,
        line_items TEXT,
        notes TEXT,
        is_offline INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        created_at TEXT,
        updated_at TEXT
      )`,

      // Bills table
      `CREATE TABLE IF NOT EXISTS bills (
        id TEXT PRIMARY KEY,
        xero_id TEXT,
        contact_id TEXT,
        contact_name TEXT,
        bill_number TEXT,
        reference TEXT,
        status TEXT,
        total REAL,
        amount_due REAL,
        date TEXT,
        due_date TEXT,
        line_items TEXT,
        notes TEXT,
        is_offline INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        created_at TEXT,
        updated_at TEXT
      )`,

      // Contacts table
      `CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        xero_id TEXT,
        name TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        contact_number TEXT,
        is_customer INTEGER DEFAULT 1,
        is_supplier INTEGER DEFAULT 0,
        is_offline INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        created_at TEXT,
        updated_at TEXT
      )`,

      // Bank transactions table
      `CREATE TABLE IF NOT EXISTS bank_transactions (
        id TEXT PRIMARY KEY,
        xero_id TEXT,
        bank_account_id TEXT,
        bank_account_name TEXT,
        date TEXT,
        amount REAL,
        description TEXT,
        reference TEXT,
        status TEXT,
        is_offline INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        created_at TEXT,
        updated_at TEXT
      )`,

      // Expense claims table
      `CREATE TABLE IF NOT EXISTS expense_claims (
        id TEXT PRIMARY KEY,
        xero_id TEXT,
        employee_id TEXT,
        employee_name TEXT,
        date TEXT,
        total REAL,
        status TEXT,
        description TEXT,
        line_items TEXT,
        is_offline INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced',
        created_at TEXT,
        updated_at TEXT
      )`,

      // Reports table (cached)
      `CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        report_type TEXT,
        report_data TEXT,
        generated_at TEXT,
        expires_at TEXT
      )`,

      // Navigation shortcuts
      `CREATE TABLE IF NOT EXISTS navigation_shortcuts (
        id TEXT PRIMARY KEY,
        name TEXT,
        url TEXT,
        icon TEXT,
        order_index INTEGER,
        created_at TEXT
      )`,

      // Recently used URLs
      `CREATE TABLE IF NOT EXISTS recent_urls (
        id TEXT PRIMARY KEY,
        url TEXT,
        title TEXT,
        last_visited TEXT,
        visit_count INTEGER DEFAULT 1
      )`,

      // Sync queue
      `CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        table_name TEXT,
        record_id TEXT,
        action TEXT,
        data TEXT,
        created_at TEXT,
        retry_count INTEGER DEFAULT 0
      )`
    ];

    return new Promise((resolve, reject) => {
      let completed = 0;
      const total = tables.length;

      tables.forEach((sql) => {
        this.db.run(sql, (err) => {
          if (err) {
            console.error('Error creating table:', err);
            reject(err);
          } else {
            completed++;
            if (completed === total) {
              resolve();
            }
          }
        });
      });
    });
  }

  encrypt(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
  }

  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Error decrypting data:', error);
      return null;
    }
  }

  async getData(table, query = {}) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT * FROM ${table}`;
      const params = [];

      if (Object.keys(query).length > 0) {
        const conditions = Object.keys(query).map(key => `${key} = ?`);
        sql += ` WHERE ${conditions.join(' AND ')}`;
        params.push(...Object.values(query));
      }

      sql += ' ORDER BY created_at DESC';

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Decrypt sensitive data
          const decryptedRows = rows.map(row => {
            if (row.line_items) {
              row.line_items = this.decrypt(row.line_items) || [];
            }
            if (row.address) {
              row.address = this.decrypt(row.address) || {};
            }
            return row;
          });
          resolve(decryptedRows);
        }
      });
    });
  }

  async saveData(table, data) {
    return new Promise((resolve, reject) => {
      const id = data.id || uuidv4();
      const now = new Date().toISOString();

      // Encrypt sensitive data
      const encryptedData = { ...data };
      if (data.line_items) {
        encryptedData.line_items = this.encrypt(data.line_items);
      }
      if (data.address) {
        encryptedData.address = this.encrypt(data.address);
      }

      const columns = Object.keys(encryptedData);
      const placeholders = columns.map(() => '?').join(', ');
      const values = Object.values(encryptedData);

      const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

      this.db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  async getOfflineData(table) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM ${table} WHERE is_offline = 1 ORDER BY created_at DESC`;
      
      this.db.all(sql, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const decryptedRows = rows.map(row => {
            if (row.line_items) {
              row.line_items = this.decrypt(row.line_items) || [];
            }
            if (row.address) {
              row.address = this.decrypt(row.address) || {};
            }
            return row;
          });
          resolve(decryptedRows);
        }
      });
    });
  }

  async saveOfflineData(table, data) {
    const offlineData = { ...data, is_offline: 1, sync_status: 'pending' };
    return await this.saveData(table, offlineData);
  }

  async addToSyncQueue(table, recordId, action, data) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO sync_queue (id, table_name, record_id, action, data, created_at) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
      
      const values = [
        uuidv4(),
        table,
        recordId,
        action,
        JSON.stringify(data),
        new Date().toISOString()
      ];

      this.db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  async getSyncQueue() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM sync_queue ORDER BY created_at ASC`;
      
      this.db.all(sql, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const processedRows = rows.map(row => ({
            ...row,
            data: JSON.parse(row.data)
          }));
          resolve(processedRows);
        }
      });
    });
  }

  async removeFromSyncQueue(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM sync_queue WHERE id = ?`;
      
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  async addRecentUrl(url, title) {
    return new Promise((resolve, reject) => {
      // Check if URL already exists
      this.db.get('SELECT * FROM recent_urls WHERE url = ?', [url], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          // Update existing record
          const sql = `UPDATE recent_urls SET visit_count = visit_count + 1, last_visited = ? WHERE url = ?`;
          this.db.run(sql, [new Date().toISOString(), url], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ changes: this.changes });
            }
          });
        } else {
          // Insert new record
          const sql = `INSERT INTO recent_urls (id, url, title, last_visited) VALUES (?, ?, ?, ?)`;
          this.db.run(sql, [uuidv4(), url, title, new Date().toISOString()], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id: this.lastID });
            }
          });
        }
      });
    });
  }

  async getRecentUrls(limit = 10) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM recent_urls ORDER BY last_visited DESC LIMIT ?`;
      
      this.db.all(sql, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async addNavigationShortcut(name, url, icon) {
    return new Promise((resolve, reject) => {
      // Get the highest order index
      this.db.get('SELECT MAX(order_index) as max_order FROM navigation_shortcuts', (err, row) => {
        if (err) {
          reject(err);
        } else {
          const orderIndex = (row.max_order || 0) + 1;
          const sql = `INSERT INTO navigation_shortcuts (id, name, url, icon, order_index, created_at) 
                       VALUES (?, ?, ?, ?, ?, ?)`;
          
          this.db.run(sql, [uuidv4(), name, url, icon, orderIndex, new Date().toISOString()], function(err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id: this.lastID });
            }
          });
        }
      });
    });
  }

  async getNavigationShortcuts() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM navigation_shortcuts ORDER BY order_index ASC`;
      
      this.db.all(sql, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async removeNavigationShortcut(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM navigation_shortcuts WHERE id = ?`;
      
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = Database;
