import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { adminAPI } from '../services/api';
import AdminReportPopup from './AdminReportPopup';
import AdminSidebar from './AdminSidebar';
import ReportTable from './ReportTable';
import StatsDashboard from './StatsDashboard';

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

  // Fetch reports with filters
  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      const response = await adminAPI.getReports(filters);
      setReports(response.data.reports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const updateStatus = async (reportId, status) => {
    try {
      await adminAPI.updateStatus(reportId, { status });
      fetchReports(); // Refresh
      alert('Status updated successfully');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <AdminSidebar 
        filters={filters}
        setFilters={setFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
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
                eventHandlers={{ click: () => setSelectedReport(report) }}
              >
                <Popup>
                  <AdminReportPopup 
                    report={report} 
                    onStatusUpdate={updateStatus}
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