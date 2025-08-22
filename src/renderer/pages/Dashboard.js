import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  FileText, 
  Receipt, 
  Users, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalBills: 0,
    totalContacts: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    overdueInvoices: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load statistics
      const invoices = await window.electronAPI.getDatabaseData('invoices', {});
      const bills = await window.electronAPI.getDatabaseData('bills', {});
      const contacts = await window.electronAPI.getDatabaseData('contacts', {});
      
      const totalRevenue = invoices
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
      
      const pendingInvoices = invoices.filter(inv => inv.status === 'AUTHORISED').length;
      const overdueInvoices = invoices.filter(inv => {
        if (inv.status !== 'AUTHORISED') return false;
        const dueDate = new Date(inv.due_date);
        return dueDate < new Date();
      }).length;

      setStats({
        totalInvoices: invoices.length,
        totalBills: bills.length,
        totalContacts: contacts.length,
        totalRevenue,
        pendingInvoices,
        overdueInvoices
      });

      // Load recent activity
      const allActivity = [
        ...invoices.map(inv => ({
          ...inv,
          type: 'invoice',
          date: inv.created_at,
          title: `Invoice ${inv.invoice_number}`,
          amount: inv.total,
          status: inv.status
        })),
        ...bills.map(bill => ({
          ...bill,
          type: 'bill',
          date: bill.created_at,
          title: `Bill ${bill.bill_number}`,
          amount: bill.total,
          status: bill.status
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date))
       .slice(0, 10);

      setRecentActivity(allActivity);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <div className="stat-value">{value}</div>
        {trend && (
          <div className={`stat-trend ${trend}`}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getStatusIcon = (status) => {
      switch (status) {
        case 'PAID':
        case 'AUTHORISED':
          return <CheckCircle size={16} className="text-success" />;
        case 'OVERDUE':
          return <AlertCircle size={16} className="text-danger" />;
        default:
          return <Clock size={16} className="text-muted" />;
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'PAID':
        case 'AUTHORISED':
          return 'success';
        case 'OVERDUE':
          return 'danger';
        default:
          return 'neutral';
      }
    };

    return (
      <div className="activity-item">
        <div className="activity-icon">
          {activity.type === 'invoice' ? <FileText size={16} /> : <Receipt size={16} />}
        </div>
        <div className="activity-content">
          <div className="activity-title">{activity.title}</div>
          <div className="activity-meta">
            <span className="activity-date">
              {new Date(activity.date).toLocaleDateString()}
            </span>
            <span className="activity-amount">
              ${activity.amount?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
        <div className="activity-status">
          {getStatusIcon(activity.status)}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-lg"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your business finances</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend="up"
          trendValue="+12.5%"
          color="success"
        />
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={FileText}
          trend="up"
          trendValue="+8.2%"
          color="primary"
        />
        <StatCard
          title="Total Bills"
          value={stats.totalBills}
          icon={Receipt}
          trend="down"
          trendValue="-3.1%"
          color="warning"
        />
        <StatCard
          title="Total Contacts"
          value={stats.totalContacts}
          icon={Users}
          trend="up"
          trendValue="+15.7%"
          color="info"
        />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          {/* Pending Items */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Pending Items</h3>
            </div>
            <div className="card-body">
              <div className="pending-items">
                <div className="pending-item">
                  <div className="pending-icon">
                    <FileText size={20} />
                  </div>
                  <div className="pending-content">
                    <div className="pending-title">Pending Invoices</div>
                    <div className="pending-value">{stats.pendingInvoices}</div>
                  </div>
                </div>
                <div className="pending-item">
                  <div className="pending-icon overdue">
                    <AlertCircle size={20} />
                  </div>
                  <div className="pending-content">
                    <div className="pending-title">Overdue Invoices</div>
                    <div className="pending-value">{stats.overdueInvoices}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Activity</h3>
            </div>
            <div className="card-body">
              <div className="activity-list">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))
                ) : (
                  <div className="no-activity">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
