import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authAPI } from '../services/api';

function Login() {

  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await authAPI.googleLogin(credentialResponse.credential);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.dispatchEvent(new Event('authStateChange'));
      navigate('/app');
    } catch (error) {
      console.error('Token decoding failed:', error);
      setError('Failed to process login. Please try again.');
    }
  }

  return (
    <div className='login-container'>
      <div className='login-card'>   
        <h2 className="login-title">Welcom to Civic Connect!</h2>   
        <p className="login-subtitle">Sign in to continue.</p>

        <div className="google-button-wrapper">
          <GoogleLogin 
            onSuccess={handleSuccess}
            onError={() => {
              console.error('Login Failed');
              setError('Google login failed. Please try again.');
            }}
            // useOneTap={true}
          />
        </div>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <div className="login-footer">
          <p className="privacy-note">
            By signing in, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>     
    </div>
  );
}

export default Login;