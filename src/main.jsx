import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

import './index.css';
import App from './components/App.jsx';
import Login from './components/Login.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const AuthRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const checkAuth = () => {
    const userData = localStorage.getItem('user');
    setUser(userData ? JSON.parse(userData) : null);
    setIsAuthenticated(!!userData);
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();

    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/app" /> : <Login />}
      />
      <Route
        path="/app"
        element={isAuthenticated ? <App /> : <Navigate to="/" />}
      />
      <Route
        path="/admin"
        element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
      />
    </Routes>
  );
};

const Root = () => (
  <BrowserRouter>
    <AuthRoutes />
  </BrowserRouter>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <Root />
      </ErrorBoundary>
    </GoogleOAuthProvider>
  </StrictMode>
);
