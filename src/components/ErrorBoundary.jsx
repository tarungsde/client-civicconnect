import { useState, useEffect } from 'react';

function ErrorBoundary({ children, fallback = <div>Something went wrong</div> }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => {
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  if (hasError) {
    return fallback;
  }

  return children;
}

export default ErrorBoundary;