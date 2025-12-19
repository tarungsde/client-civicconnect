import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Login() {

  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
      localStorage.setItem('user', JSON.stringify({
        email: decoded.email,
        name: decoded.name || decoded.given_name,
        picture: decoded.picture,
        id: decoded.sub
      }));
      navigate('/app');
    } catch (error) {
      console.error('Token decoding failed:', error);
      setError('Failed to process login. Please try again.');
    }
  }

  return (
    <div>
      {error && (
        <div>
          {error}
        </div>
      )}

      <GoogleLogin 
        onSuccess={handleSuccess}
        onError={() => {
          console.error('Login Failed');
          setError('Google login failed. Please try again.');
        }}
        useOneTap={true}
      />
    </div>
  );
}

export default Login;