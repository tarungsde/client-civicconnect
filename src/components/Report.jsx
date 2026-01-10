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
      setPreview([]);
      setSelectedFiles([]);
    } else {
      setTitle('');
      setDescription('');
      setCategory('');
      setUrgency('medium');
      setPreview([]);
      setSelectedFiles([]);
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
      if (editing && editing.photos) {
        photoUrls = [...editing.photos];
      }

      if (selectedFiles.length > 0) {
        const newPhotoUrls = await uploadImages(selectedFiles);
        photoUrls = [...photoUrls, ...newPhotoUrls];
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
        setPreview([]);
        setSelectedFiles([]);
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

    const imageUrls = validFiles.map((file) => 
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

      {editing && editing.photos && editing.photos.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Existing Photos ({editing.photos.length})
          </label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {editing.photos.map((photo, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <img
                  src={photo}
                  alt={`Existing ${index}`}
                  style={{ 
                    width: 80, 
                    height: 80, 
                    objectFit: 'cover',
                    borderRadius: '5px',
                    border: '2px solid #ddd'
                  }}
                />
                <div style={{
                  fontSize: '10px',
                  textAlign: 'center',
                  marginTop: '2px',
                  color: '#666'
                }}>
                  Existing
                </div>
              </div>
            ))}
          </div>
          <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
            Note: You cannot remove existing photos. Add new ones below.
          </small>
        </div>
      )}


      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="issue-image" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          {editing ? 'Add More Images' : 'Upload Images'} (Optional)
        </label>
        <input 
          id='issue-image' 
          type='file' 
          accept='image/*'
          onChange={handleImageInputs}
          multiple
          style={{
            width: '100%',
            padding: '5px',
            marginBottom: '10px'
          }}
        />

        {preview.length > 0 && (
          <>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
              {preview.map((src, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img
                    src={src}
                    alt={`Preview ${index}`}
                    style={{ 
                      width: 80, 
                      height: 80, 
                      objectFit: 'cover',
                      borderRadius: '5px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      background: 'red',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              {preview.length} new image(s) selected
            </small>
          </>
        )}
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
        <small style={{ color: '#666' }}>
          <strong>Location:</strong> {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
          {editing && (
            <div style={{ marginTop: '5px' }}>
              <em>Location cannot be changed when editing a report.</em>
            </div>
          )}
        </small>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            opacity: loading ? 0.6 : 1
          }}
        >
          Cancel
        </button>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: editing ? '#007bff' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Saving...' : (editing ? 'Update Report' : 'Submit Report')}
        </button>
      </div>
    </form>
  );
  
}

export default ReportCard;