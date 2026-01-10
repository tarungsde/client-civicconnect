// components/UpvoteButton.jsx
import { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';

function UpvoteButton({ reportId, initialUpvotes = 0 }) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(initialUpvotes);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user already upvoted
    const checkUpvoteStatus = async () => {
      try {
        const response = await reportAPI.checkUpvote(reportId);
        setUpvoted(response.data.upvoted);
      } catch (error) {
        console.error('Failed to check upvote status:', error);
      }
    };
    
    checkUpvoteStatus();
  }, [reportId]);

  const handleUpvote = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await reportAPI.upvoteReport(reportId);
      setUpvoted(response.data.upvoted);
      setUpvoteCount(response.data.upvoteCount);
    } catch (error) {
      console.error('Upvote failed:', error);
      alert('Failed to upvote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: upvoted ? '#ff4444' : '#666',
        fontSize: '14px'
      }}
    >
      <span style={{ fontSize: '18px' }}>
        {upvoted ? '❤️' : '🤍'}
      </span>
      <span>{upvoteCount}</span>
      {loading && <span>...</span>}
    </button>
  );
}

export default UpvoteButton;