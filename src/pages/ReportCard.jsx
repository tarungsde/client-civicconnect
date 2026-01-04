import React, { useState, useEffect } from 'react';
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
  const [preview, setPreview] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || '');
      setDescription(editing.description || '');
      setCategory(editing.category || '');
      setUrgency(editing.urgency || 'medium');
    }
  }, [editing]);

  useEffect(() => {
    return () => {
      preview.forEach(url => URL.revokeObjectURL(url));
    };
  }, [preview]);


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

      let photoUrls = [];
      if (selectedFiles.length > 0) {
        photoUrls = await uploadImages(selectedFiles);
      }

      const reportData = {
        title: title.trim(),
        description: description.trim(),
        category,
        urgency,
        latitude: editing ? editing.latitude : latitude,
        longitude: editing ? editing.longitude : longitude,
        photos: photoUrls
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

  const handleImageInputs = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return false;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert(`${file.name} exceeds 5MB limit`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 5) {
      alert('Maximum 5 images allowed');
      validFiles.splice(5);
    }

    const imageUrls = files.map((file) => 
      URL.createObjectURL(file)
    );

    setPreview(imageUrls);
    setSelectedFiles(validFiles);
  }

  const uploadImages = async (files) => {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('images', file); // 'images' matches backend
    });
    
    try {
      const response = await reportAPI.uploadImages(formData);
      return response.data.urls; // Array of image URLs
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload images');
    }
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(preview[index]);
    const newPreview = [...preview];
    newPreview.splice(index, 1);
    setPreview(newPreview);
    
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{editing ? 'Edit Report' : 'Submit New Report'}</h2>
      
      {error && <div style={{color: 'red'}}>{error}</div>}

      <div className='form-group'>
        <label htmlFor="title">Title</label>
        <input 
          id='title'
          type='text'
          placeholder='Brief title of the issue'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          maxLength={50}
          required
        />
      </div>

      <div className='form-group'>
        <label htmlFor="description">Description</label>
        <textarea 
          id='description'
          placeholder="Detailed description about the issue."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          rows={4}
          maxLength={500}
          required
        />
      </div>

      <div className='form-group'>
        <label htmlFor="category">Category</label>
        <select
          id='category'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading}
          required
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

      <div>
        <label htmlFor="issue-image">Upload Image</label>
        <input 
          id='issue-image' 
          type='file' 
          accept='image/*'
          onChange={handleImageInputs}
          multiple
          required
        />

        <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
          {preview.map((src, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <img
                src={src}
                alt={`Preview ${index}`}
                style={{ 
                  width: 100, 
                  height: 100, 
                  objectFit: 'cover',
                  borderRadius: '5px'
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                style={{
                  position: 'absolute',
                  top: -5,
                  right: -5,
                  background: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
          ))}
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
          {loading ? 'Saving...' : (editing ? 'Update' : 'Submit')}
        </button>
      </div>

      {editing && (
        <button onClick={() => {
          setEditingReport(null);
          setShowReportForm(false);
        }}>
          Cancel Edit
        </button>
      )}
    </form>
  );
  
}

export default ReportCard;