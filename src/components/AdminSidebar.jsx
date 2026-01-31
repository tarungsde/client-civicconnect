import React from 'react';
import { 
  Filter, 
  X, 
  AlertCircle,
  Clock,
  CheckCircle,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

function AdminSidebar({ filters, setFilters, viewMode, setViewMode, stats }) {
  const statusOptions = [
    { value: '', label: 'All Status', icon: <Filter size={16} /> },
    { value: 'Pending', label: 'Pending', icon: <AlertCircle size={16} />, color: '#ef4444' },
    { value: 'In-progress', label: 'In Progress', icon: <Clock size={16} />, color: '#f59e0b' },
    { value: 'Resolved', label: 'Resolved', icon: <CheckCircle size={16} />, color: '#10b981' },
    { value: 'Rejected', label: 'Rejected', icon: <X size={16} />, color: '#6b7280' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'pothole', label: 'Pothole' },
    { value: 'garbage', label: 'Garbage' },
    { value: 'streetlight', label: 'Street Light' },
    { value: 'water', label: 'Water' },
    { value: 'traffic', label: 'Traffic' },
    { value: 'other', label: 'Other' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const exportReports = () => {
    // Export functionality would go here
    alert('Export functionality would be implemented here');
  };

  return (
    <aside className="admin-sidebar-panel">
      <div className="admin-sidebar-header">
        <div className="sidebar-title">
          <Filter size={20} />
          <h3>Filters & Controls</h3>
        </div>
        <button className="sidebar-close-btn">
          <X size={20} />
        </button>
      </div>

      <div className="admin-sidebar-content">
        {/* Quick Stats */}
        {stats && (
          <div className="admin-stats-summary">
            <div className="stats-summary-item">
              <span className="stats-value">{stats.totalReports || 0}</span>
              <span className="stats-label">Total Reports</span>
            </div>
            <div className="stats-summary-item pending">
              <span className="stats-value">
                {stats.statusStats?.find(s => s._id === 'Pending')?.count || 0}
              </span>
              <span className="stats-label">Pending</span>
            </div>
            <div className="stats-summary-item resolved">
              <span className="stats-value">
                {stats.statusStats?.find(s => s._id === 'Resolved')?.count || 0}
              </span>
              <span className="stats-label">Resolved</span>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="admin-filters-section">
          <div className="filters-header">
            <h4>Filter Reports</h4>
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All
            </button>
          </div>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">
                <AlertCircle size={16} />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="admin-filter-select"
              >
                {statusOptions.map(({ value, label, icon }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <Filter size={16} />
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="admin-filter-select"
              >
                {categoryOptions.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Date From</label>
              <input
                type="date"
                className="admin-date-input"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Date To</label>
              <input
                type="date"
                className="admin-date-input"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-quick-actions">
          <h4>Quick Actions</h4>
          <div className="quick-actions-grid">
            <button
              className="quick-action-btn pending-action"
              onClick={() => setFilters({...filters, status: 'Pending'})}
            >
              <AlertCircle size={18} />
              <span>View Pending</span>
            </button>
            <button
              className="quick-action-btn inprogress-action"
              onClick={() => setFilters({...filters, status: 'In-progress'})}
            >
              <Clock size={18} />
              <span>In Progress</span>
            </button>
            <button
              className="quick-action-btn hide-resolved"
              onClick={() => {
                setFilters({...filters, status: '!Resolved'});
              }}
            >
              <EyeOff size={18} />
              <span>Hide Resolved</span>
            </button>
            <button
              className="quick-action-btn show-all"
              onClick={clearFilters}
            >
              <Eye size={18} />
              <span>Show All</span>
            </button>
          </div>
        </div>

        {/* Export Section */}
        <div className="admin-export-section">
          <h4>Export Data</h4>
          <button className="export-btn" onClick={exportReports}>
            <Download size={18} />
            <span>Export Reports (CSV)</span>
          </button>
          <p className="export-hint">
            Export filtered reports for offline analysis
          </p>
        </div>

        {/* Category Distribution */}
        {stats?.categoryStats && (
          <div className="category-distribution">
            <h4>Category Breakdown</h4>
            <div className="category-list">
              {stats.categoryStats.map((category, index) => (
                <div key={category._id} className="category-item">
                  <div className="category-header">
                    <span className="category-name">{category._id || 'Other'}</span>
                    <span className="category-count">{category.count}</span>
                  </div>
                  <div className="category-bar">
                    <div 
                      className="category-fill"
                      style={{ 
                        width: `${(category.count / stats.totalReports) * 100}%`,
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default AdminSidebar;