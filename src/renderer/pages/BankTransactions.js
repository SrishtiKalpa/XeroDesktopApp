import React from 'react';
import { CreditCard } from 'lucide-react';

const BankTransactions = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Bank Transactions</h1>
        <p className="page-subtitle">View and manage your bank transactions</p>
      </div>
      
      <div className="card">
        <div className="card-body">
          <div className="text-center p-6">
            <CreditCard size={48} className="text-muted mb-4" />
            <h3>Bank Transactions</h3>
            <p className="text-muted">Bank transaction management features will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankTransactions;
