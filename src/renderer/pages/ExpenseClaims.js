import React from 'react';
import { FileSpreadsheet, Plus } from 'lucide-react';

const ExpenseClaims = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Expense Claims</h1>
        <p className="page-subtitle">Manage employee expense claims</p>
      </div>
      
      <div className="page-actions">
        <button className="btn btn-primary">
          <Plus size={16} />
          New Expense Claim
        </button>
      </div>
      
      <div className="card">
        <div className="card-body">
          <div className="text-center p-6">
            <FileSpreadsheet size={48} className="text-muted mb-4" />
            <h3>Expense Claims Management</h3>
            <p className="text-muted">Expense claim management features will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseClaims;
