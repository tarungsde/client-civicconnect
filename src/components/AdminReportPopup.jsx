import React, { useState } from 'react';

function AdminReportPopup({ report, onStatusUpdate, isUpdatingStatus }) {
  const [selectedStatus, setSelectedStatus] = useState(report.status);
  const [adminNotes, setAdminNotes] = useState('');
  
  const statusOptions = ['Pending', 'In-progress', 'Resolved', 'Rejected'];
  
  const handleStatusUpdate = () => {
    onStatusUpdate(report._id, {
      status: selectedStatus,
      adminNotes
    });
  };
  
  return (
    <div style={{ minWidth: '300px' }}>
      <h3>{report.title}</h3>
      <p>{report.description}</p>
      
      <div style={{ margin: '10px 0' }}>
        <strong>Category:</strong> {report.category} | 
        <strong> Urgency:</strong> {report.urgency}
      </div>
      
      <div style={{ margin: '15px 0' }}>
        <label>Update Status:</label>
        <select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{ width: '100%', margin: '5px 0', padding: '5px' }}
        >
          {statusOptions.map(status => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        
        <textarea
          placeholder="Admin notes (optional)"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={3}
          style={{ width: '100%', margin: '5px 0', padding: '5px' }}
        />
        
        <button 
          onClick={handleStatusUpdate}
          disabled={isUpdatingStatus}
          style={{
            width: '100%',
            padding: '8px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: isUpdatingStatus ? 0.6 : 1
          }}
        >
          {isUpdatingStatus ? 'Updating...' : 'Update Status'}
        </button>
      </div>
      
      {/* Status History */}
      {report.statusHistory && report.statusHistory.length > 0 && (
        <div>
          <strong>Status History:</strong>
          <ul style={{ fontSize: '12px', marginTop: '5px' }}>
            {report.statusHistory.map((history, index) => (
              <li key={index}>
                {history.status} - {new Date(history.changedAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AdminReportPopup;