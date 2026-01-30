import { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents, Circle, Tooltip, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../services/api';
import { toast, Toaster } from 'sonner';
import { 
  MapPin, 
  Navigation, 
  Target, 
  Filter, 
  Plus, 
  LogOut, 
  RefreshCw, 
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban
} from 'lucide-react';
import multiColorPin from '../assets/multi-color-pin.png';
import redPin from '../assets/red-pin.png';
import yellowPin from '../assets/yellow-pin.png';
import greenPin from '../assets/green-pin.png';
import blackPin from '../assets/black-pin.png';
import Report from './Report';
import UpvoteButton from './UpvoteButton';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function App() {
  const [latitude, setLatitude] = useState(13.083512739205634);
  const [longitude, setLongitude] = useState(80.27065486455128);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [showToolTip, setShowToolTip] = useState(false);
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState(null);
  const [showFilters, setShowFilters] = useState(() => {
  return window.innerWidth >= 1024;
});
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    dateFrom: '',
    dateTo: ''
  });

  const watchIdRef = useRef(null);
  const navigate = useNavigate();

  const userIcon = L.icon({
    iconUrl: multiColorPin,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && !showFilters) {
        setShowFilters(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showFilters]); 

  const getLocation = (isManualRefresh = false) => {
    if(!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return null;
    }

    if(isManualRefresh) {
      setIsLoading(true);
      setLocationError(null);
    }

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
  
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAccuracy(position.coords.accuracy);
        setIsLoading(false);
      },
      (error) => {
        console.log('Location error:', error.message);
        setLocationError(error.message);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    watchIdRef.current = watchId;
    return watchId;
  }

  useEffect(() => {
    getLocation();

    return () => {
      if(watchIdRef.current)
        navigator.geolocation.clearWatch(watchIdRef.current);
    }
  }, []);

  const ChangeView = ({ center, zoom, manualMode, onLocationSet }) => {
    const map = useMap();

    useMapEvents({
      click(e) {
        if (manualMode) {
          onLocationSet(e.latlng.lat, e.latlng.lng);
        }
      }
    });

    useEffect(() => {
      map.setView(center, zoom);
    }, [center, zoom, map]);
    
    return null;
  }

  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const response = await reportAPI.getAllReports(filters);
      setReports(response.data.reports);
    } catch (error) {
      setReportsError('Failed to load reports');
      console.error('Failed to fetch report:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const showTooltip = () => {
    setShowToolTip(true);
    setTimeout(() => {
      setShowToolTip(false);
    }, 5000);
  }

  useEffect(() => {
    showTooltip();
  }, [latitude, longitude, manualMode]);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authStateChange'));
    navigate('/');
  };

  const statusOptions = [
    { value: '', label: 'All Status', icon: <Filter size={16} /> },
    { value: 'Pending', label: 'Pending', icon: <AlertCircle size={16} /> },
    { value: 'In-progress', label: 'In Progress', icon: <Clock size={16} /> },
    { value: 'Resolved', label: 'Resolved', icon: <CheckCircle size={16} /> },
    { value: 'Rejected', label: 'Rejected', icon: <Ban size={16} /> }
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

  const StatusIndicator = ({ status }) => {
    const getStatusConfig = (status) => {
      switch(status?.toLowerCase()) {
        case 'pending': return { color: '#ef4444', icon: <AlertCircle size={14} />, label: 'Pending' };
        case 'in-progress': return { color: '#f59e0b', icon: <Clock size={14} />, label: 'In Progress' };
        case 'resolved': return { color: '#10b981', icon: <CheckCircle size={14} />, label: 'Resolved' };
        case 'rejected': return { color: '#6b7280', icon: <Ban size={14} />, label: 'Rejected' };
        default: return { color: '#6b7280', icon: null, label: status };
      }
    };

    const config = getStatusConfig(status);
    
    return (
      <span 
        className="status-badge" 
        style={{ 
          backgroundColor: `${config.color}15`,
          borderColor: config.color,
          color: config.color
        }}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className='app-shell'>
      {/* Header */}
      <header className='app-header'>
        <div className='header-content'>
          <div className='brand-section'>
            <div className='logo-container'>
              <MapPin className='logo-icon' />
              <h1 className='app-title'>CivicConnect</h1>
            </div>
            <p className='app-subtitle'>Community Issue Reporting Platform</p>
          </div>
          
          <div className='user-section'>
            {user && (
              <div className='user-info'>
                <div className='user-avatar'>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className='user-name'>{user.name}</span>
              </div>
            )}
            <button
              className='btn btn-logout'
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='main-content'>
        {/* Left Panel - Filters & Reports */}
        <aside className={`sidebar ${showFilters ? 'open' : ''}`}>
          <div className='sidebar-header'>
            <div className='header-title'>
              <Filter size={20} />
              <h3>Filters & Reports</h3>
            </div>
            <button 
              className='close-filters'
              onClick={() => setShowFilters(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className='sidebar-content'>
            {/* Quick Stats */}
            <div className='stats-grid'>
              <div className='stat-card'>
                <div className='stat-icon pending'>
                  <AlertCircle size={20} />
                </div>
                <div className='stat-content'>
                  <span className='stat-value'>{reports.filter(r => r.status === 'Pending').length}</span>
                  <span className='stat-label'>Pending</span>
                </div>
              </div>
              <div className='stat-card'>
                <div className='stat-icon in-progress'>
                  <Clock size={20} />
                </div>
                <div className='stat-content'>
                  <span className='stat-value'>{reports.filter(r => r.status === 'In-progress').length}</span>
                  <span className='stat-label'>In Progress</span>
                </div>
              </div>
              <div className='stat-card'>
                <div className='stat-icon resolved'>
                  <CheckCircle size={20} />
                </div>
                <div className='stat-content'>
                  <span className='stat-value'>{reports.filter(r => r.status === 'Resolved').length}</span>
                  <span className='stat-label'>Resolved</span>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className='filter-section'>
              <div className='rsection-header'>
                <h4>Filter Reports</h4>
                <button
                  onClick={clearFilters}
                  className='btn-clear'
                >
                  Clear All
                </button>
              </div>
              
              <div className='filter-grid'>
                <div className='filter-group'>
                  <label className='filter-label'>
                    <AlertCircle size={16} />
                    Status
                  </label>
                  <select
                    className='filter-select'
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    {statusOptions.map(({ value, label, icon }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='filter-group'>
                  <label className='filter-label'>
                    <Filter size={16} />
                    Category
                  </label>
                  <select
                    className='filter-select'
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    {categoryOptions.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='filter-group'>
                  <label className='filter-label'>Date From</label>
                  <input
                    type="date"
                    className='date-input'
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>

                <div className='filter-group'>
                  <label className='filter-label'>Date To</label>
                  <input
                    type="date"
                    className='date-input'
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className='reports-section'>
              <div className='section-header'>
                <h4>Recent Reports ({reports.length})</h4>
              </div>
              <div className='reports-list'>
                {loadingReports ? (
                  <div className='loading-reports'>Loading reports...</div>
                ) : reportsError ? (
                  <div className='error-message'>{reportsError}</div>
                ) : reports.length === 0 ? (
                  <div className='empty-state'>
                    <AlertCircle size={48} />
                    <p>No reports found</p>
                    <small>Try adjusting your filters</small>
                  </div>
                ) : (
                  reports.slice(reports.length - 5, reports.length).map(report => (
                    <div 
                      key={report._id} 
                      className='report-item'
                      onClick={() => {
                        // Optional: Fly to report location on map
                      }}
                    >
                      <div className='report-header'>
                        <h5 className='report-title'>{report.title}</h5>
                        <StatusIndicator status={report.status} />
                      </div>
                      <p className='report-description'>{report.description.substring(0, 80)}...</p>
                      <div className='report-footer'>
                        <span className='report-category'>{report.category}</span>
                        <span className='report-date'>
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Map Area */}
        <main className='map-area'>
          {/* Map Controls Overlay */}
          <div className={`map-controls ${showFilters ? 'sidebar-open' : ''}`}>

            {!showFilters && (
              <button 
                className='control-btn filter-toggle'
                onClick={() => setShowFilters(true)}
              >
                <Filter size={20} />
              </button>
            )}
            
            <div className='location-controls'>
              <button 
                onClick={() => { getLocation(true); }}
                className='control-btn location-btn'
                disabled={isLoading}
              >
                <RefreshCw size={20} className={isLoading ? 'spinning' : ''} />
              </button>
              
              {!isLoading && !manualMode && (
                <button
                  className='control-btn manual-mode-btn'
                  onClick={() => setManualMode(true)}
                >
                  <Target size={20} />
                </button>
              )}

              {manualMode && (
                <button
                  className='control-btn cancel-btn'
                  onClick={() => setManualMode(false)}
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Accuracy Circle */}
          {accuracy && (
            <div className={`accuracy-indicator ${showFilters ? 'sidebar-open' : ''}`}>
              <Navigation size={16} />
              <span>Accuracy: {Math.round(accuracy)} meters</span>
            </div>
          )}


          {/* Map Container */}
          <MapContainer 
            className='leaflet-container'
            center={[latitude, longitude]} 
            zoom={15}
            zoomControl={false}
          >
            <ChangeView 
              center={[latitude, longitude]} 
              zoom={15} 
              manualMode={manualMode}
              onLocationSet={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
                setManualMode(false);
              }}
            />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />

            <Marker
              key={`${latitude}-${longitude}`} 
              position={[latitude, longitude]} 
              icon={userIcon}
              draggable={manualMode}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setLatitude(position.lat);
                  setLongitude(position.lng);
                  setManualMode(false);
                }
              }}
            >
              {showToolTip && (
                <Tooltip
                  direction="top"
                  offset={[0, -42]}
                  permanent
                  className="marker-label"
                >
                  Your Location
                </Tooltip>
              )}
            </Marker>

            {reports.map((report) => {
              const icon = getStatusIcon(report.status);
              return (
                <Marker
                  key={report._id || `${report.latitude}-${report.longitude}`}
                  position={[report.latitude, report.longitude]} 
                  icon={icon}
                >
                  <Popup>
                    <div className='report-popup'>
                      <div className='popup-header'>
                        <div className='popup-title-section'>
                          <h3>{report.title}</h3>
                          <StatusIndicator status={report.status} />
                        </div>
                        <p className='popup-description'>{report.description}</p>
                      </div>
                      
                      <div className='popup-details'>
                        <div className="detail-row">
                          <span className="detail-label">Category:</span>
                          <span className="detail-value">{report.category}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">{report.address || 'Address not found'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Reported by:</span>
                          <span className="detail-value">{report.reportedBy?.name || 'Anonymous'}</span>
                        </div>
                      </div>

                      <div className="popup-footer">
                        <div className='upvote-section'>
                          <UpvoteButton 
                            reportId={report._id} 
                            initialUpvotes={report.upvoteCount || 0}
                          />
                        </div>
                        <div className='popup-actions'>
                          <span className="popup-date">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                          {report.reportedBy._id === user?.id && (
                            <button 
                              onClick={() => {
                                setEditingReport(report);
                                setShowReportForm(true);
                              }}
                              className='edit-btn'
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {report.photos && report.photos.length > 0 && (
                        <div className='popup-image-container'>
                          <img 
                            src={report.photos[0]} 
                            alt={report.title}
                            className='popup-image'
                          />
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {accuracy && (
              <Circle
                center={[latitude,longitude]}
                radius={Math.min(accuracy, 500)}
                pathOptions={{
                  color: "#3388ff",
                  fillColor: "#3388ff",
                  fillOpacity: 0.1,
                  dashArray: '5, 5',
                }}
              />
            )}
          </MapContainer>
        </main>
      </div>

      {/* Floating Action Button */}
      <button 
        className='fab'
        onClick={() => {
          setEditingReport(null);
          setShowReportForm(true);
        }}
      >
        <Plus size={24} />
      </button>

      {/* Location Status Toast */}
      {isLoading && (
        <div className='toast toast-loading'>
          <Navigation size={20} className='spinning' />
          <span>Getting your location...</span>
        </div>
      )}
      
      {locationError && !isLoading && (
        <div className='toast toast-error'>
          <AlertCircle size={20} />
          <span>Unable to get location. Showing default location.</span>
        </div>
      )}

      {manualMode && (
        <div className='toast toast-info'>
          <Target size={20} />
          <span>Click on map to set location</span>
        </div>
      )}

      {/* Modals */}
      <Toaster 
        position="top-right"
        richColors
        toastOptions={{
          style: {
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          },
        }}
      />

      {(showReportForm || editingReport) && (
        <div className='modal-overlay'>
          <div className='modal-container'>
            <Report
              editing={editingReport}
              latitude={latitude}
              longitude={longitude}
              onSuccess={(updatedReport) => {                
                if (editingReport) {
                  setReports(prevReports => 
                    prevReports.map(report => 
                      report._id === updatedReport._id ? updatedReport : report
                    )
                  );
                  toast.success('Report updated successfully');
                } else {
                  setReports(prevReports => [updatedReport, ...prevReports]);
                  toast.success('Report submitted successfully');
                }
                setShowReportForm(false);
                setEditingReport(null);
              }}
              onCancel={() => {
                setShowReportForm(false);
                setEditingReport(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;