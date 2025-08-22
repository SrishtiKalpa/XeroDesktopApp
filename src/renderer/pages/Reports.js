import React from 'react';
import { BarChart3 } from 'lucide-react';

const Reports = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Reports</h1>
        <p className="page-subtitle">Generate and view business reports</p>
      </div>
      
      <div className="card">
        <div className="card-body">
          <div className="text-center p-6">
            <BarChart3 size={48} className="text-muted mb-4" />
            <h3>Reports & Analytics</h3>
            <p className="text-muted">Reporting and analytics features will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
