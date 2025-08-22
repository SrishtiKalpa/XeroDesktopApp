import React from 'react';
import { WifiOff, FileText, Receipt, Users, CreditCard, FileSpreadsheet } from 'lucide-react';
import './OfflineMode.css';

const OfflineMode = () => {
  const offlineFeatures = [
    {
      icon: FileText,
      title: 'View Invoices',
      description: 'Access all your invoices in read-only mode'
    },
    {
      icon: Receipt,
      title: 'View Bills',
      description: 'Review all your bills and expenses'
    },
    {
      icon: Users,
      title: 'View Contacts',
      description: 'Browse your customer and supplier contacts'
    },
    {
      icon: CreditCard,
      title: 'View Bank Transactions',
      description: 'Check your bank transaction history'
    },
    {
      icon: FileSpreadsheet,
      title: 'Create Offline Records',
      description: 'Create new invoices, bills, and contacts'
    }
  ];

  return (
    <div className="offline-mode">
      <div className="offline-banner">
        <div className="offline-icon">
          <WifiOff size={24} />
        </div>
        <div className="offline-content">
          <h2>Working Offline</h2>
          <p>You're currently working offline. Some features may be limited, but you can still access your data and create new records.</p>
        </div>
      </div>

      <div className="offline-features">
        <h3>Available Offline Features</h3>
        <div className="features-grid">
          {offlineFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <Icon size={20} />
                </div>
                <div className="feature-content">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="offline-info">
        <div className="info-card">
          <h4>Data Sync</h4>
          <p>When you reconnect to the internet, any changes you make offline will automatically sync with Xero.</p>
        </div>
        
        <div className="info-card">
          <h4>Conflict Resolution</h4>
          <p>If there are conflicts between offline and online data, you'll be prompted to choose which version to keep.</p>
        </div>
      </div>
    </div>
  );
};

export default OfflineMode;
