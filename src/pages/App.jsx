import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../services/api';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import ReportCard from './ReportCard';

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

  const navigate = useNavigate();

  const defaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
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
    if(!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
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
    return () => {
      navigator.geolocation.clearWatch(watchId);
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

  const submitReport = async (reportData) => {
    try {
      const fullReport = {
        ...reportData,
        latitude,
        longitude
      };
      
      await reportAPI.createReport(fullReport);
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Report submission error:', error);
      alert('Failed to submit report');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('authStateChange'));
    navigate('/');
  };

  return (
    <div>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          fontFamily: 'Arial, sans-serif'
        }}>
          Getting your location...
        </div>
      )}
      
      {locationError && !isLoading && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: 'rgba(255, 235, 235, 0.95)',
          padding: '10px 20px',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          color: '#d32f2f',
          maxWidth: '80%',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px'
        }}>
          Unable to get your location. Showing default location instead.
        </div>
      )}

      <MapContainer 
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
          icon={defaultIcon}
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
          {/* <Tooltip
            direction="top"
            offset={[0, -10]}
            permanent
            className="marker-label"
          >
            You are here
          </Tooltip> */}
        </Marker>
        {accuracy && (
          <Circle
            center={[latitude,longitude]}
            radius={accuracy}
            pathOptions={{
              color: "blue",
              fillColor: "#3388ff",
              fillOpacity: 0.1
            }}
          />
        )}
      </MapContainer>

      <div>
        {showReportForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    maxWidth: '500px',
                    width: '90%',
                    maxHeight: '90vh',
                    overflow: 'auto'
            }}>
              <ReportCard
                latitude={latitude}
                longitude={longitude}
                onSuccess={(newReport) => {
                  console.log('Report created:', newReport);
                  setShowReportForm(false);
                  // Add marker to map, etc.
                }}
                onCancel={() => setShowReportForm(false)}
              />
            </div>
          </div>
        )}
      </div>
      <button 
        onClick={() => setShowReportForm(true)}
        style={{
          position: 'absolute',
          bottom: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: '#28a745',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        Report Issue Here
      </button>
      

      {!isLoading && !manualMode && (
        <button
          onClick={() => setManualMode(true)}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          📍 Click to correct the location
        </button>
      )}

      {manualMode && (
        <button
          onClick={() => setManualMode(false)}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          Cancel Manual Mode
        </button>
      )}
            
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '8px 16px',
          background: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>

    </div>
  );
}

export default App;