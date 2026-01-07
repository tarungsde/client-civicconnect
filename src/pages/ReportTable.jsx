import React, { useState } from 'react';

function ReportTable({ reports, onStatusUpdate }) {
  const [expandedReport, setExpandedReport] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({});

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'in-progress': return '#17a2b8';
      case 'resolved': return '#28a745';
      case 'false report': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleStatusChange = (reportId, status) => {
    setStatusUpdate(prev => ({ ...prev, [reportId]: status }));
  };

  const saveStatusUpdate = (reportId) => {
    if (statusUpdate[reportId]) {
      onStatusUpdate(reportId, { status: statusUpdate[reportId] });
      setStatusUpdate(prev => ({ ...prev, [reportId]: '' }));
    }
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
      <h3 style={{ marginBottom: '20px' }}>Reports Table ({reports.length})</h3>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Title</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Category</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Urgency</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Created</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <React.Fragment key={report._id}>
                <tr style={{ 
                  borderBottom: '1px solid #dee2e6',
                  background: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                }}>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => setExpandedReport(expandedReport === report._id ? null : report._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#007bff'
                      }}
                    >
                      {expandedReport === report._id ? '▼' : '▶'} {report._id.substring(0, 8)}...
                    </button>
                  </td>
                  <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {report.title}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      background: '#e9ecef',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {report.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      background: getStatusColor(report.status),
                      color: report.status === 'pending' ? 'black' : 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {report.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{report.urgency}</td>
                  <td style={{ padding: '12px' }}>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={statusUpdate[report._id] || ''}
                        onChange={(e) => handleStatusChange(report._id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="">Change Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="false report">False Report</option>
                      </select>
                      {statusUpdate[report._id] && (
                        <button
                          onClick={() => saveStatusUpdate(report._id)}
                          style={{
                            padding: '4px 8px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Save
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                
                {/* Expanded Details */}
                {expandedReport === report._id && (
                  <tr>
                    <td colSpan="7" style={{ 
                      padding: '20px', 
                      background: '#f8f9fa',
                      borderBottom: '2px solid #dee2e6'
                    }}>
                      <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ marginBottom: '10px' }}>Report Details</h4>
                          <p><strong>Description:</strong> {report.description}</p>
                          <p><strong>Location:</strong> {report.latitude?.toFixed(6)}, {report.longitude?.toFixed(6)}</p>
                          <p><strong>Reporter:</strong> {report.reportedBy?.name || 'Unknown'} ({report.reportedBy?.email})</p>
                          <p><strong>Upvotes:</strong> {report.upvoteCount || 0}</p>
                          
                          {report.photos && report.photos.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                              <strong>Photos:</strong>
                              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                {report.photos.map((photo, idx) => (
                                  <img 
                                    key={idx}
                                    src={photo} 
                                    alt={`Report ${idx}`}
                                    style={{ 
                                      width: '80px', 
                                      height: '80px', 
                                      objectFit: 'cover',
                                      borderRadius: '4px'
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <h4 style={{ marginBottom: '10px' }}>Status History</h4>
                          {report.statusHistory && report.statusHistory.length > 0 ? (
                            <ul style={{ 
                              listStyle: 'none', 
                              padding: 0,
                              maxHeight: '200px',
                              overflowY: 'auto'
                            }}>
                              {report.statusHistory.map((history, idx) => (
                                <li key={idx} style={{ 
                                  padding: '8px', 
                                  marginBottom: '5px',
                                  background: 'white',
                                  borderLeft: `4px solid ${getStatusColor(history.status)}`,
                                  borderRadius: '4px'
                                }}>
                                  <div><strong>{history.status}</strong></div>
                                  <small>
                                    {new Date(history.changedAt).toLocaleString()}
                                    {history.notes && ` - ${history.notes}`}
                                  </small>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No status history available</p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        
        {reports.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#6c757d'
          }}>
            No reports found with current filters
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportTable;