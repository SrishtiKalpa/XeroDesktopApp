import React from 'react';
import { Receipt, Plus } from 'lucide-react';

const Bills = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Bills</h1>
        <p className="page-subtitle">Manage your supplier bills</p>
      </div>
      
      <div className="page-actions">
        <button className="btn btn-primary">
          <Plus size={16} />
          New Bill
        </button>
      </div>
      
      <div className="card">
        <div className="card-body">
          <div className="text-center p-6">
            <Receipt size={48} className="text-muted mb-4" />
            <h3>Bills Management</h3>
            <p className="text-muted">Bill management features will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bills;
