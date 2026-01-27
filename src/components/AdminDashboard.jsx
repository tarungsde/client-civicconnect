import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { adminAPI } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import AdminReportPopup from './AdminReportPopup';
import AdminSidebar from './AdminSidebar';
import ReportTable from './ReportTable';
import StatsDashboard from './StatsDashboard';
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

  const navigate = useNavigate();

  // Fetch reports with filters
  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getReports(filters);
      setReports(response.data.reports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reportId, data) => {
    try {
      setIsUpdatingStatus(true);
      await adminAPI.updateStatus(reportId, data);
      toast.success('Status updated successfully', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#2cdd55',
          color: '#fff',
        },
      });
      fetchReports(); // Refresh
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(`Failed to update status: ${error.response?.data?.error || error.message}`, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#dc3545',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          fontWeight: 'bold',
        },
        icon: '❌',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authStateChange'));
    navigate('/');
  }

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
    <div style={{ display: 'flex', height: '100vh' }}>

      <Toaster 
        position="top-right"
      />

      <button 
        style={{position: 'fixed', top: '5px', right: '5px', background: 'red', zIndex: '1000'}}
        onClick={handleLogout}
      >
        Logout
      </button>

      {/* Sidebar */}
      <AdminSidebar 
        filters={filters}
        setFilters={setFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setReports={setReports}
      />
      
      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {viewMode === 'map' && (
          <MapContainer center={[13.0835, 80.2706]} zoom={12} style={{ height: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {reports.map(report => (
              <Marker 
                key={report._id} 
                position={[report.latitude, report.longitude]}
                icon={getStatusIcon(report.status)}
                eventHandlers={{ click: () => setSelectedReport(report) }}
              >
                <Popup>
                  <AdminReportPopup 
                    report={report} 
                    onStatusUpdate={updateStatus}
                    isUpdatingStatus={isUpdatingStatus}
                  />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
        
        {viewMode === 'table' && (
          <ReportTable 
            reports={reports}
            onStatusUpdate={updateStatus}
          />
        )}
        
        {viewMode === 'stats' && (
          <StatsDashboard />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;