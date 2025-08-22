import React from 'react';
import { Users, Plus } from 'lucide-react';

const Contacts = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Contacts</h1>
        <p className="page-subtitle">Manage your customers and suppliers</p>
      </div>
      
      <div className="page-actions">
        <button className="btn btn-primary">
          <Plus size={16} />
          New Contact
        </button>
      </div>
      
      <div className="card">
        <div className="card-body">
          <div className="text-center p-6">
            <Users size={48} className="text-muted mb-4" />
            <h3>Contacts Management</h3>
            <p className="text-muted">Contact management features will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
