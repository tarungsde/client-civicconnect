import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { 
  MapPin, 
  Users, 
  AlertCircle, 
  Shield, 
  Globe, 
  Sparkles,
  CheckCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [features] = useState([
    {
      icon: <MapPin />,
      title: 'Real-time Issue Tracking',
      description: 'Report and track community issues on an interactive map'
    },
    {
      icon: <Users />,
      title: 'Community Collaboration',
      description: 'Work together with neighbors and local authorities'
    },
    {
      icon: <Shield />,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: <Globe />,
      title: 'Local Impact',
      description: 'Make a real difference in your neighborhood'
    }
  ]);

  const handleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.googleLogin(credentialResponse.credential);
      
      // Store auth data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Trigger auth state change
      window.dispatchEvent(new Event('authStateChange'));
      
      // Add a small delay for better UX
      setTimeout(() => {
        navigate('/app');
      }, 300);
      
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Failed to process login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add a subtle background animation
    const createBubble = () => {
      const bubble = document.createElement('div');
      bubble.className = 'floating-bubble';
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.animationDuration = `${Math.random() * 20 + 10}s`;
      bubble.style.opacity = `${Math.random() * 0.3 + 0.1}`;
      document.querySelector('.login-background')?.appendChild(bubble);
      
      setTimeout(() => bubble.remove(), 30000);
    };

    // Create initial bubbles
    for (let i = 0; i < 15; i++) {
      setTimeout(createBubble, i * 200);
    }

    const interval = setInterval(createBubble, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='login-container'>
      {/* Animated Background */}
      <div className="login-background">
        <div className="gradient-overlay"></div>
      </div>
      
      {/* Decorative Elements */}
      <div className="decorative-circle circle-1"></div>
      <div className="decorative-circle circle-2"></div>
      <div className="decorative-circle circle-3"></div>
      
      {/* Main Content */}
      <div className="login-wrapper">
        {/* Left Panel - Features & Info */}
        <div className="features-panel">
          <div className="features-header">
            <div className="logo-section">
              <div className="llogo-container">
                <MapPin className="llogo-icon" />
                <h1 className="app-logo">CivicConnect</h1>
              </div>
              <p className="app-tagline">Your community, connected</p>
            </div>
            
            <div className="features-highlight">
              <Sparkles className="sparkle-icon" />
              <h2>Transform Your Community</h2>
              <p>Join thousands making their neighborhoods better, together</p>
            </div>
          </div>
          
          <div className="features-list">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="stats-section">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="lstat-label">Active Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="lstat-label">Issues Resolved</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100+</span>
              <span className="lstat-label">Cities</span>
            </div>
          </div>
        </div>
        
        {/* Right Panel - Login Form */}
        <div className="login-panel">
          <div className="login-card">
            {/* Welcome Header */}
            <div className="welcome-header">
              <div className="welcome-icon">
                <MapPin size={32} />
              </div>
              <div className="welcome-text">
                <h2>Welcome Back!</h2>
                <p>Sign in to continue your civic journey</p>
              </div>
            </div>
            
            {/* Login Form */}
            <div className="login-form">
              <div className="form-header">
                <h3>Sign in with Google</h3>
                <p>Quick, secure, and hassle-free</p>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="lerror-message">
                  <AlertCircle size={20} />
                  <div className="lerror-content">
                    <strong>Login Failed</strong>
                    <p>{error}</p>
                  </div>
                </div>
              )}
              
              {/* Google Login Button */}
              <div className="google-button-wrapper">
                <GoogleLogin 
                  onSuccess={handleSuccess}
                  onError={() => {
                    console.error('Google login failed');
                    setError('Unable to connect to Google. Please try again.');
                  }}
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                  theme="filled_blue"
                  width="100%"
                />
                {loading && (
                  <div className="login-loading">
                    <div className="loading-spinner"></div>
                    <span>Authenticating...</span>
                  </div>
                )}
              </div>

              <div className="guest-option">
                <button
                  className="guest-btn"
                  onClick={() => {
                    // Create demo admin credentials
                    const demoAdmin = {
                      token: 'demo-jwt-token-admin',
                      user: {
                        id: 'demo-admin-123',
                        email: 'demo.admin@example.com',
                        name: 'Demo Administrator',
                        picture: null,
                        role: 'admin',
                      }
                    };
                    
                    localStorage.setItem('token', demoAdmin.token);
                    localStorage.setItem('user', JSON.stringify(demoAdmin.user));
                    window.dispatchEvent(new Event('authStateChange'));
                    
                    alert('Demo Admin Mode Activated! You can now access admin features.');
                    
                    setTimeout(() => navigate('/app'), 300);
                  }}
                >
                  Try Admin Dashboard (Demo)
                </button>
              </div>
              
              {/* Divider */}
              <div className="divider">
                <span>Why Google?</span>
              </div>
              
              {/* Benefits List */}
              <div className="benefits-list">
                <div className="benefit-item">
                  <CheckCircle size={18} />
                  <span>One-click sign in</span>
                </div>
                <div className="benefit-item">
                  <CheckCircle size={18} />
                  <span>No password to remember</span>
                </div>
                <div className="benefit-item">
                  <CheckCircle size={18} />
                  <span>Enhanced security</span>
                </div>
              </div>
              
              {/* Privacy Notice */}
              <div className="privacy-notice">
                <Shield size={16} />
                <p>
                  We only access your basic profile information. 
                  <a href="#" className="privacy-link"> Learn more</a>
                </p>
              </div>
              
              {/* Guest Option */}
              <div className="guest-option">
                <p>Just exploring?</p>
                <button 
                  className="guest-btn"
                  onClick={() => navigate('/app')}
                >
                  <span>Continue as Guest</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
            
            {/* Footer */}
            <div className="login-footer">
              <div className="footer-links">
                <a href="#" className="footer-link">
                  <span>Privacy Policy</span>
                  <ExternalLink size={12} />
                </a>
                <a href="#" className="footer-link">
                  <span>Terms of Service</span>
                  <ExternalLink size={12} />
                </a>
                <a href="#" className="footer-link">
                  <span>Help Center</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="copyright">
                © {new Date().getFullYear()} CivicConnect. Making communities better.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;