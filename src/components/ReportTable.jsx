import React, { useState } from 'react';
import { 
  Eye, 
  MoreVertical,
  AlertCircle,
  Clock,
  CheckCircle,
  Ban,
  ChevronUp,
  ChevronDown,
  Filter
} from 'lucide-react';

function ReportTable({ reports, onStatusUpdate, loading }) {
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedRow, setExpandedRow] = useState(null);

  const statusOptions = [
    { value: 'Pending', label: 'Pending', color: '#ef4444' },
    { value: 'In-progress', label: 'In Progress', color: '#f59e0b' },
    { value: 'Resolved', label: 'Resolved', color: '#10b981' },
    { value: 'Rejected', label: 'Rejected', color: '#6b7280' }
  ];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedReports = [...reports].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortField === 'createdAt') {
      return sortDirection === 'asc' 
        ? new Date(aValue) - new Date(bValue)
        : new Date(bValue) - new Date(aValue);
    }
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const StatusBadge = ({ status }) => {
    const option = statusOptions.find(opt => opt.value === status);
    if (!option) return null;
    
    return (
      <span className="table-status-badge" style={{ 
        backgroundColor: `${option.color}15`,
        borderColor: option.color,
        color: option.color
      }}>
        {option.label}
      </span>
    );
  };

  const UrgencyBadge = ({ urgency }) => {
    const colorMap = {
      'high': '#ef4444',
      'medium': '#f59e0b',
      'low': '#10b981'
    };
    
    return (
      <span className="urgency-badge" style={{ 
        backgroundColor: `${colorMap[urgency] || '#6b7280'}15`,
        borderColor: colorMap[urgency] || '#6b7280',
        color: colorMap[urgency] || '#6b7280'
      }}>
        {urgency}
      </span>
    );
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <Filter size={12} />;
    }
    return sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  if (loading && reports.length === 0) {
    return (
      <div className="table-loading">
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="table-empty">
        <AlertCircle size={48} />
        <h3>No reports found</h3>
        <p>Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="admin-report-table">
      <div className="table-header">
        <div className="table-info">
          <h3>Reports ({reports.length})</h3>
          <p>Sorted by {sortField} ({sortDirection})</p>
        </div>
        <div className="table-controls">
          <button className="export-table-btn">
            Export CSV
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="reports-data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('title')}>
                <div className="table-header-cell">
                  <span>Title</span>
                  <SortIcon field="title" />
                </div>
              </th>
              <th onClick={() => handleSort('category')}>
                <div className="table-header-cell">
                  <span>Category</span>
                  <SortIcon field="category" />
                </div>
              </th>
              <th onClick={() => handleSort('status')}>
                <div className="table-header-cell">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th onClick={() => handleSort('urgency')}>
                <div className="table-header-cell">
                  <span>Urgency</span>
                  <SortIcon field="urgency" />
                </div>
              </th>
              <th onClick={() => handleSort('createdAt')}>
                <div className="table-header-cell">
                  <span>Date</span>
                  <SortIcon field="createdAt" />
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedReports.map((report) => (
              <React.Fragment key={report._id}>
                <tr className="table-data-row">
                  <td>
                    <div className="report-title-cell">
                      <div className="report-title-text">
                        {report.title}
                      </div>
                      <div className="report-id">
                        #{report._id.slice(-6)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">
                      {report.category}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={report.status} />
                  </td>
                  <td>
                    <UrgencyBadge urgency={report.urgency} />
                  </td>
                  <td>
                    <div className="date-cell">
                      <div className="date-value">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                      <div className="time-value">
                        {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="view-details-btn"
                        onClick={() => setExpandedRow(expandedRow === report._id ? null : report._id)}
                      >
                        <Eye size={16} />
                        <span>Details</span>
                      </button>
                      <button className="more-actions-btn">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRow === report._id && (
                  <tr className="expanded-row">
                    <td colSpan={6}>
                      <div className="expanded-content">
                        <div className="expanded-details">
                          <div className="detail-section">
                            <h4>Description</h4>
                            <p>{report.description}</p>
                          </div>
                          <div className="detail-section">
                            <h4>Location</h4>
                            <p>{report.address || 'Address not available'}</p>
                            <small>Coordinates: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</small>
                          </div>
                          <div className="detail-section">
                            <h4>Reported By</h4>
                            <p>{report.reportedBy?.name || 'Anonymous'}</p>
                            <small>Email: {report.reportedBy?.email || 'Not provided'}</small>
                          </div>
                          {report.photos && report.photos.length > 0 && (
                            <div className="detail-section">
                              <h4>Photos ({report.photos.length})</h4>
                              <div className="expanded-photos">
                                {report.photos.map((photo, index) => (
                                  <img 
                                    key={index}
                                    src={photo} 
                                    alt={`Report ${index + 1}`}
                                    className="expanded-photo"
                                    onClick={() => window.open(photo, '_blank')}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="expanded-actions">
                          <select 
                            className="status-select"
                            value={report.status}
                            onChange={(e) => onStatusUpdate(report._id, { status: e.target.value })}
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <button className="quick-update-btn">
                            Update Status
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="pagination-info">
          Showing {reports.length} of {reports.length} reports
        </div>
        <div className="pagination-controls">
          <button className="pagination-btn" disabled>
            Previous
          </button>
          <span className="pagination-page">Page 1 of 1</span>
          <button className="pagination-btn" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportTable;