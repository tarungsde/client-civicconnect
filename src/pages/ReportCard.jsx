import React, {useState} from 'react';
import { reportAPI } from '../services/api';

function ReportCard({
  editing,
  latitude, 
  longitude,
  onSuccess,
  onCancel 
}) {

  const categories = ['pothole', 'garbage', 'streetlight', 'water', 'traffic', 'other'];
  const urgencies = ['low', 'medium', 'high'];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || '');
      setDescription(editing.description || '');
      setCategory(editing.category || '');
      setUrgency(editing.urgency || 'medium');
    }
  }, [editing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      setLoading(false);
      return;
    }

    if (!category) {
      setError('Please select a category');
      setLoading(false);
      return;
    }

    try {
      const reportData = {
        title: title.trim(),
        description: description.trim(),
        category,
        urgency,
        latitude: editing ? editing.latitude : latitude,
        longitude: editing ? editing.longitude : longitude
      };

      let result;

      if (editing) {
        result = await reportAPI.updateReport(editing._id, reportData);
      } else {
        result = await reportAPI.createReport(reportData);
      }

      if (onSuccess) {
        onSuccess(result.data.report);
      }

      if (!editing) {
        setTitle('');
        setDescription('');
        setCategory('');
        setUrgency('medium');
      }
    } catch (error) {
      console.error('Report submission error:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }

  }

  return (
    <form onSubmit={handleSubmit}>

      <h2>{editing ? 'Edit Report' : 'Submit New Report'}</h2>
      
      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className='report-form'>
        
        <div className='form-group'>
          <label htmlFor="title">Title *</label>
          <input 
            id='title'
            type='text'
            placeholder='Brief title of the issue'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            maxLength={100}
          />
        </div>

        <div className='form-group'>
          <label htmlFor="description">Description *</label>
          <input 
            id='description'
            type='text' 
            placeholder="Detailed description about the issue."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={4}
            maxLength={500}
          />
        </div>

        <div className='form-row'>
          <div className='form-group'>
            <label htmlFor="category">Category *</label>
            <select
              id='category'
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
            >
              <option value="">Select category</option>
              {categories.map((c, index) => (
                <option 
                  id={c}
                  key={index}
                  value={c}
                >
                  {c}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className='form-group'>
          <label htmlFor="urgency">Urgency</label>
          <select 
            id='urgency'
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="">Select a category</option>
            {urgencies.map((u, index) => (
              <option 
                id={u}
                key={index}
                value={u}
              >
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="location-info">
        <small>
          Location: {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
        </small>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="cancel-btn"
          >
            Cancel
          </button>
        )}
        
        <button 
          type="submit" 
          disabled={loading}
          className="submit-btn"
        >
          {loading ? 'Saving...' : (editing ? 'Update Report' : 'Submit Report')}
        </button>
      </div>
    </form>
  );
  
}

export default ReportCard;