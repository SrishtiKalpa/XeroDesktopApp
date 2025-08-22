import React from 'react';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your application preferences</p>
      </div>
      
      <div className="card">
        <div className="card-body">
          <div className="text-center p-6">
            <Settings size={48} className="text-muted mb-4" />
            <h3>Application Settings</h3>
            <p className="text-muted">Settings and configuration options will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
