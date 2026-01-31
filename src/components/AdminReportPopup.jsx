import React, { useState } from 'react';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Ban,
  Calendar,
  User,
  MapPin,
  MessageSquare,
  Save,
  X
} from 'lucide-react';

function AdminReportPopup({ report, onStatusUpdate, isUpdatingStatus, expanded = false }) {
  const [selectedStatus, setSelectedStatus] = useState(report.status);
  const [adminNotes, setAdminNotes] = useState(report.adminNotes || '');
  const [showNotes, setShowNotes] = useState(false);
  
  const statusOptions = [
    { value: 'Pending', label: 'Pending', icon: <AlertCircle size={16} />, color: '#ef4444' },
    { value: 'In-progress', label: 'In Progress', icon: <Clock size={16} />, color: '#f59e0b' },
    { value: 'Resolved', label: 'Resolved', icon: <CheckCircle size={16} />, color: '#10b981' },
    { value: 'Rejected', label: 'Rejected', icon: <Ban size={16} />, color: '#6b7280' }
  ];
  
  const handleStatusUpdate = () => {
    onStatusUpdate(report._id, {
      status: selectedStatus,
      adminNotes: adminNotes.trim()
    });
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : '#6b7280';
  };

  return (
    <div className={`admin-report-popup ${expanded ? 'expanded' : ''}`}>
      <div className="admin-popup-header">
        <div className="popup-title-section">
          <h3 className="popup-report-title">{report.title}</h3>
          <span className="popup-report-id">#{report._id.slice(-6)}</span>
        </div>
        <div className="popup-status-indicator" style={{ borderColor: getStatusColor(report.status) }}>
          <span style={{ color: getStatusColor(report.status) }}>
            {report.status}
          </span>
        </div>
      </div>
      
      <div className="admin-popup-content">
        {/* Report Details */}
        <div className="popup-details-grid">
          <div className="detail-item">
            <div className="detail-icon">
              <MessageSquare size={16} />
            </div>
            <div className="detail-content">
              <label>Description</label>
              <p>{report.description}</p>
            </div>
          </div>
          
          <div className="detail-item">
            <div className="detail-icon">
              <AlertCircle size={16} />
            </div>
            <div className="detail-content">
              <label>Category</label>
              <span className="detail-tag">{report.category}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <div className="detail-icon">
              <AlertCircle size={16} />
            </div>
            <div className="detail-content">
              <label>Urgency</label>
              <span className={`urgency-tag urgency-${report.urgency}`}>
                {report.urgency}
              </span>
            </div>
          </div>
          
          <div className="detail-item">
            <div className="detail-icon">
              <User size={16} />
            </div>
            <div className="detail-content">
              <label>Reported By</label>
              <span>{report.reportedBy?.name || 'Anonymous'}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <div className="detail-icon">
              <Calendar size={16} />
            </div>
            <div className="detail-content">
              <label>Reported On</label>
              <span>{new Date(report.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="detail-item">
            <div className="detail-icon">
              <MapPin size={16} />
            </div>
            <div className="detail-content">
              <label>Location</label>
              <span className="location-text">{report.address || 'Address not available'}</span>
            </div>
          </div>
        </div>

        {/* Photos */}
        {report.photos && report.photos.length > 0 && (
          <div className="popup-photos-section">
            <h4>Attached Photos ({report.photos.length})</h4>
            <div className="popup-photos-grid">
              {report.photos.map((photo, index) => (
                <div key={index} className="popup-photo-item">
                  <img 
                    src={photo} 
                    alt={`Report photo ${index + 1}`}
                    className="popup-photo"
                    onClick={() => window.open(photo, '_blank')}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Update Section */}
        <div className="status-update-section">
          <div className="section-header">
            <h4>Update Status</h4>
            <button 
              className="notes-toggle-btn"
              onClick={() => setShowNotes(!showNotes)}
            >
              {showNotes ? 'Hide Notes' : 'Add Notes'}
            </button>
          </div>
          
          <div className="status-options-grid">
            {statusOptions.map(option => (
              <button
                key={option.value}
                className={`status-option ${selectedStatus === option.value ? 'selected' : ''}`}
                onClick={() => setSelectedStatus(option.value)}
                style={{ borderColor: selectedStatus === option.value ? option.color : 'var(--border)' }}
              >
                <div className="status-option-icon" style={{ color: option.color }}>
                  {option.icon}
                </div>
                <span className="status-option-label">{option.label}</span>
              </button>
            ))}
          </div>
          
          {showNotes && (
            <div className="admin-notes-input">
              <label>Admin Notes (Optional)</label>
              <textarea
                placeholder="Add notes about this status change..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="notes-textarea"
              />
              <small className="notes-hint">
                These notes will be visible to the reporter
              </small>
            </div>
          )}

          <button 
            className="status-update-btn"
            onClick={handleStatusUpdate}
            disabled={isUpdatingStatus || selectedStatus === report.status}
          >
            {isUpdatingStatus ? (
              <>
                <div className="spinner-small"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Update Status</span>
              </>
            )}
          </button>
        </div>

        {/* Status History */}
        {report.statusHistory && report.statusHistory.length > 0 && (
          <div className="status-history-section">
            <h4>Status History</h4>
            <div className="status-timeline">
              {report.statusHistory.map((history, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-dot" style={{ backgroundColor: getStatusColor(history.status) }} />
                  <div className="timeline-content">
                    <div className="timeline-status">
                      <span className="history-status" style={{ color: getStatusColor(history.status) }}>
                        {history.status}
                      </span>
                      <span className="history-date">
                        {new Date(history.changedAt).toLocaleString()}
                      </span>
                    </div>
                    {history.adminNotes && (
                      <p className="history-notes">{history.adminNotes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminReportPopup;