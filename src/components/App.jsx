import { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents, Circle, Tooltip, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../services/api';
import { toast, Toaster } from 'sonner';
import multiColorPin from '../assets/multi-color-pin.png';
import redPin from '../assets/red-pin.png';
import yellowPin from '../assets/yellow-pin.png';
import greenPin from '../assets/green-pin.png';
import blackPin from '../assets/black-pin.png';
import Report from './Report';
import UpvoteButton from './UpvoteButton';

// delete L.Icon.Default.prototype._getIconUrl;

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
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState(null);
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
      const response = await reportAPI.getAllReports(
        // latitude,
        // longitude,
        // radius: 5000
        filters
      );
      console.log(response);
      setReports(response.data.reports);
    } catch (error) {
      setReportsError('Failed to load reports');
      console.error('Failed to fetch report:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     fetchReports();
  //   }, 1000);
  //   return () => clearTimeout(timer);
  // }, [latitude, longitude]);

  useEffect(() => {
      fetchReports();
  }, [filters]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authStateChange'));
    navigate('/');
  };

  const statusOptions = ['', 'All', 'Pending', 'In-progress', 'Resolved', 'Rejected'];
  const categoryOptions = ['', 'pothole', 'garbage', 'streetlight', 'water', 'traffic', 'other'];

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

  // Helper function to get the right icon
  const getStatusIcon = (status) => {
    const normalizedStatus = status?.toLowerCase();
    return statusIcons[normalizedStatus] || statusIcons['default'];
  };

  return (
    <div className='app-shell'>

      <div className='app-header'>
        <h1 className='app-title'>Civic Connect</h1>
        <button
          className='btn btn-logout'
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <div className='app-body'>
        <aside className='sidebar'> 
          <div className='filter-container'>
            <h4 className="filter-header">
              Filters
              <button
                onClick={clearFilters}
                className='btn-clear'
              >
                Clear
              </button>
            </h4>
            
            <div className='filter-group'>
              <label className='filter-label'>Status</label>
              <select
                className='filter-select'
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status === '' ? 'Select Status' : status}
                  </option>
                ))}
              </select>
            </div>

            <div className='filter-group'>
              <label className='filter-label'>Category</label>
              <select
                className='filter-select'
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categoryOptions.map(category => (
                  <option key={category} value={category}>
                    {category === '' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className='filter-group'>
              <label className='filter-label'>Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div className='filter-group'>
              <label className='filter-label'>Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
        </aside>

        <main className='map-area'>
          <MapContainer 
            className='leaflet-container'
            center={[latitude, longitude]} 
            zoom={15}
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
              <Tooltip
                direction="top"
                offset={[0, -10]}
                permanent
                className="marker-label"
              >
                You are here
              </Tooltip>
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
                        <h3>{report.title}</h3>
                        <p className='popup-description'>{report.description}</p>
                      </div>
                      
                      <div className='popup-details'>
                        <div className="detail-item">
                          <span className="detail-label">Category:</span>
                          <span>{report.category}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Status:</span>
                          <span className={`status-badge status-${report.status?.toLowerCase()}`}>
                            {report.status}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Location:</span>
                          <span>{report.address || 'Address not found'}</span>
                        </div>
                      </div>

                      <div className="popup-footer">
                        <UpvoteButton 
                          reportId={report._id} 
                          initialUpvotes={report.upvoteCount || 0}
                        />
                        <span className="popup-date">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {report.photos && report.photos.length > 0 && (
                        <img 
                          src={report.photos[0]} 
                          alt={report.title}
                          className='popup-image'
                        />
                      )}
                      {report.reportedBy._id === user?.id && (
                        <button 
                          onClick={() => {
                            setEditingReport(report);
                          }}
                          className='btn btn-sm btn-primary popup-edit-btn'
                        >
                          Edit Report
                        </button>
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
                  color: "blue",
                  fillColor: "#3388ff",
                  fillOpacity: 0.1,
                  dashArray: '5, 5',
                }}
              />
            )}
          </MapContainer>
        </main>

      </div>

      {isLoading && (
        <div className='loading-overlay'>
          Getting your location...
        </div>
      )}
      
      {locationError && !isLoading && (
        <div className='error-overlay'>
          Unable to get your location. Showing default location instead.
        </div>
      )}

      <Toaster 
          position="top-right"
          richColors
      />

      

      <div>
        {(showReportForm || editingReport) && (
          <div className='modal-overlay'>
            <div className='modal-content'>
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
                    toast.success('Status updated successfully');
                  } else {
                    setReports(prevReports => [updatedReport, ...prevReports]);
                    toast.success('Status submitted successfully');
                  }
                  setShowReportForm(false);
                  setEditingReport(null);
                  }}
                onCancel={() => {
                  setShowReportForm(false);
                  setEditingReport(null);
                  }
                }
              />
            </div>
          </div>
        )}
      </div>
      
      <footer className='action-bar'>
        <button 
          className='btn btn-report'
          onClick={() => {
            setEditingReport(null);
            setShowReportForm(true);
          }}
        >
          Report Issue Here
        </button>

        {!isLoading && !manualMode && (
          <button
            className='btn btn-manual-mode'
            onClick={() => setManualMode(true)}
          >
            📍 Adjust location
          </button>
        )}

        {manualMode && (
          <button
            className='btn-cancel-manual'
            onClick={() => setManualMode(false)}
          >
            Cancel Manual Mode
          </button>
        )}

        <button 
          onClick={() => { getLocation(true); }}
          className="btn btn-primary" 
        >
          {isLoading ? 'Getting location...' : 'Refresh Location'}
        </button>
      </footer>

    </div>
  );
}

export default App;