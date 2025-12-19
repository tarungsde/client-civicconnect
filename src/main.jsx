import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import App from './pages/App.jsx';
import Login from './pages/Login.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const AuthRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const checkAuth = () => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
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
      <Root />
    </GoogleOAuthProvider>
  </StrictMode>
);
