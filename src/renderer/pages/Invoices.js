import React from 'react';
import { FileText, Plus } from 'lucide-react';

const Invoices = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Invoices</h1>
        <p className="page-subtitle">Manage your customer invoices</p>
      </div>
      
      <div className="page-actions">
        <button className="btn btn-primary">
          <Plus size={16} />
          New Invoice
        </button>
      </div>
      
      <div className="card">
        <div className="card-body">
          <div className="text-center p-6">
            <FileText size={48} className="text-muted mb-4" />
            <h3>Invoices Management</h3>
            <p className="text-muted">Invoice management features will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
