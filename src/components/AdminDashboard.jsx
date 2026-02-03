import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { adminAPI } from '../services/api';
import { toast, Toaster } from 'sonner';
import AdminReportPopup from './AdminReportPopup';
import AdminSidebar from './AdminSidebar';
import ReportTable from './ReportTable';
import StatsDashboard from './StatsDashboard';
import { 
  MapPin, 
  LogOut, 
  Loader2,
  Shield,
  X,
  Filter
} from 'lucide-react';
import multiColorPin from '../assets/multi-color-pin.png';
import redPin from '../assets/red-pin.png';
import yellowPin from '../assets/yellow-pin.png';
import greenPin from '../assets/green-pin.png';
import blackPin from '../assets/black-pin.png';

function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map', 'table', 'stats'
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    dateFrom: '',
    dateTo: ''
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [filters]);

  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }, [isSidebarOpen]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getReports(filters);
      setReports(response.data.reports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const updateStatus = async (reportId, data) => {
    try {
      setIsUpdatingStatus(true);
      await adminAPI.updateStatus(reportId, data);
      toast.success('Status updated successfully');
      fetchReports(); // Refresh
      fetchStats(); // Update stats
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(`Failed to update status: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authStateChange'));
    navigate('/');
  };

  const statusIcons = {
    'pending': L.icon({
      iconUrl: redPin,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [30, 42], 
      iconAnchor: [15, 42],
      popupAnchor: [1, -34]
    }),
    'in-progress': L.icon({
      iconUrl: yellowPin,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [1, -34]
   }),
    'resolved': L.icon({
      iconUrl: greenPin,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [1, -34]
    }),
    'rejected': L.icon({
      iconUrl: blackPin,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [1, -34]
    }),
    'default': L.icon({
      iconUrl: multiColorPin,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [1, -34]
    })
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();
    return statusIcons[normalizedStatus] || statusIcons['default'];
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  useEffect(() => {
    const isMobile = window.innerWidth < 1200;
    
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <div className="admin-dashboard-shell">
      <Toaster position="top-right" richColors />
      
      {/* Admin Header */}
      <header className="admin-dashboard-header">
        <div className="admin-header-content">
          <div className="admin-brand-section">
            <div className="admin-logo-container">
              <Shield className="admin-logo-icon" />
              <div>
                <h1 className="admin-title">Admin Dashboard</h1>
                <p className="admin-subtitle">Manage community reports and analytics</p>
              </div>
            </div>
          </div>
          
          <div className="admin-header-actions">
            {stats && (
              <div className="admin-quick-stats">
                <div className="quick-stat-item">
                  <span className="quick-stat-value">{stats.totalReports || 0}</span>
                  <span className="quick-stat-label">Total Reports</span>
                </div>
                <div className="quick-stat-item pending">
                  <span className="quick-stat-value">
                    {stats.statusStats?.find(s => s._id === 'Pending')?.count || 0}
                  </span>
                  <span className="quick-stat-label">Pending</span>
                </div>
              </div>
            )}
            
            <button className="admin-logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="admin-main-content">
        {/* Admin Sidebar */}
        <AdminSidebar 
          filters={filters}
          setFilters={setFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          stats={stats}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {isSidebarOpen && (
          <div 
            className="admin-sidebar-overlay open" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Main Content Area */}
        <div className="admin-content-area">
          {/* View Mode Tabs */}
          <div className="admin-view-tabs">
            <div className="view-tabs-container">
              <button 
                className={`view-tab ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                <MapPin size={18} />
                <span>Map View</span>
              </button>
              <button 
                className={`view-tab ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <svg className="table-icon" viewBox="0 0 24 24" width="18" height="18">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2"/>
                  <line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Table View</span>
              </button>
              <button 
                className={`view-tab ${viewMode === 'stats' ? 'active' : ''}`}
                onClick={() => setViewMode('stats')}
              >
                <svg className="stats-icon" viewBox="0 0 24 24" width="18" height="18">
                  <path d="M10 20H14V4H10V20ZM4 20H8V12H4V20ZM16 9V20H20V9H16Z" fill="currentColor"/>
                </svg>
                <span>Analytics</span>
              </button>
            </div>
            
            <div className="view-controls">
              {loading && (
                <div className="admin-loading-indicator">
                  <Loader2 size={16} className="spinning" />
                  <span>Loading reports...</span>
                </div>
              )}

              <button 
                className="admin-sidebar-toggle-btn"
                onClick={toggleSidebar}
                aria-label={isSidebarOpen ? "Hide filters" : "Show filters"}
              >
                <Filter size={20} />
                <span>{isSidebarOpen ? "Hide Filters" : "Show Filters"}</span>
              </button>
              
              <button 
                className="admin-refresh-btn"
                onClick={fetchReports}
                disabled={loading}
              >
                <svg className="refresh-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="admin-view-content">
            {viewMode === 'map' && (
              <div className="admin-map-container">
                <MapContainer 
                  center={[13.0835, 80.2706]} 
                  zoom={12} 
                  className="admin-leaflet-map"
                  zoomControl={false}
                >
                  <TileLayer 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {reports.map(report => (
                    <Marker 
                      key={report._id} 
                      position={[report.latitude, report.longitude]}
                      icon={getStatusIcon(report.status)}
                      eventHandlers={{ click: () => setSelectedReport(report) }}
                    >
                      {/* <Popup>
                        <AdminReportPopup 
                          report={report} 
                          onStatusUpdate={updateStatus}
                          isUpdatingStatus={isUpdatingStatus}
                        />
                      </Popup> */}
                    </Marker>
                  ))}
                </MapContainer>
                
                {selectedReport && (
                  <div className="admin-selected-report-sidebar">
                    <div className="selected-report-header">
                      <h3>Selected Report</h3>
                      <button 
                        className="close-selected-btn"
                        onClick={() => setSelectedReport(null)}
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <AdminReportPopup 
                      report={selectedReport} 
                      onStatusUpdate={updateStatus}
                      isUpdatingStatus={isUpdatingStatus}
                      expanded={true}
                    />
                  </div>
                )}
              </div>
            )}
            
            {viewMode === 'table' && (
              <div className="admin-table-container">
                <ReportTable 
                  reports={reports}
                  onStatusUpdate={updateStatus}
                  loading={loading}
                />
              </div>
            )}
            
            {viewMode === 'stats' && (
              <div className="admin-stats-container">
                <StatsDashboard stats={stats} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;