import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { 
  X, 
  Camera, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Tag,
  AlertTriangle,
  FileText,
  Trash2,
  Globe,
  CircleAlert,
  Lightbulb, 
  Droplets, 
  TrafficCone,
} from 'lucide-react';

function ReportCard({
  editing,
  latitude, 
  longitude,
  onSuccess,
  onCancel 
}) {

  const categories = [
    { 
      value: 'pothole', 
      label: 'Pothole', 
      icon: <CircleAlert size={24} />, 
      color: '#8B4513' 
    },
    { 
      value: 'garbage', 
      label: 'Garbage', 
      icon: <Trash2 size={24} />, 
      color: '#4CAF50' 
    },
    { 
      value: 'streetlight', 
      label: 'Street Light', 
      icon: <Lightbulb size={24} />, 
      color: '#FFC107' 
    },
    { 
      value: 'water', 
      label: 'Water Issue', 
      icon: <Droplets size={24} />, 
      color: '#2196F3' 
    },
    { 
      value: 'traffic', 
      label: 'Traffic', 
      icon: <TrafficCone size={24} />, 
      color: '#FF5722' 
    },
    { 
      value: 'other', 
      label: 'Other', 
      icon: <FileText size={24} />, 
      color: '#9C27B0' 
    }
  ];

  const urgencies = [
    { value: 'low', label: 'Low Priority', color: '#10B981', description: 'Minor inconvenience' },
    { value: 'medium', label: 'Medium Priority', color: '#F59E0B', description: 'Needs attention soon' },
    { value: 'high', label: 'High Priority', color: '#EF4444', description: 'Requires immediate action' }
  ];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [address, setAddress] = useState('');
  const [charCount, setCharCount] = useState({ title: 0, description: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || '');
      setDescription(editing.description || '');
      setCategory(editing.category || '');
      setUrgency(editing.urgency || 'medium');
      setCharCount({
        title: editing.title?.length || 0,
        description: editing.description?.length || 0
      });
      setPreview([]);
      setSelectedFiles([]);
    } else {
      setTitle('');
      setDescription('');
      setCategory('');
      setUrgency('medium');
      setCharCount({ title: 0, description: 0 });
      setPreview([]);
      setSelectedFiles([]);
    }
  }, [editing]);

  useEffect(() => {
    return () => {
      preview.forEach(url => URL.revokeObjectURL(url));
    };
  }, [preview]);

  useEffect(() => {
    if (latitude && longitude) {
      fetchAddress(latitude, longitude);
    }
  }, [latitude, longitude]);

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
        resetForm();
      }
    } catch (error) {
      console.error('Report submission error:', error);
      setError(error.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setUrgency('medium');
    setCharCount({ title: 0, description: 0 });
    setPreview([]);
    setSelectedFiles([]);
    setError('');
  };

  const handleImageInputs = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const processFiles = (files) => {
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

    setPreview(prev => [...prev, ...imageUrls]);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const uploadImages = async (files) => {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('images', file);
    });
    
    try {
      const response = await reportAPI.uploadImages(formData);
      return response.data.urls;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Failed to upload images');
    }
  };

  const removeImage = (index, isExisting = false) => {
    if (isExisting) {
      alert('Existing photos cannot be removed when editing. You can only add new photos.');
      return;
    }
    
    URL.revokeObjectURL(preview[index]);
    const newPreview = [...preview];
    newPreview.splice(index, 1);
    setPreview(newPreview);
    
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const fetchAddress = async (lat, lon) => {
    try {
      const result = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await result.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress('Address not found');
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
      setAddress('Address not found');
    }
  };

  const getSelectedCategory = () => {
    return categories.find(c => c.value === category);
  };

  const getSelectedUrgency = () => {
    return urgencies.find(u => u.value === urgency);
  };

  return (
    <div className="report-modal">
      <div className="modal-header">
        <div className="rheader-content">
          <div className="title-section">
            <h2>
              {editing ? (
                <>
                  <AlertCircle size={24} />
                  Edit Report
                </>
              ) : (
                <>
                  <FileText size={24} />
                  Submit New Report
                </>
              )}
            </h2>
            <p className="modal-subtitle">
              {editing ? 'Update your existing report' : 'Help improve your community'}
            </p>
          </div>
          <button 
            type="button" 
            className="close-btn"
            onClick={onCancel}
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        {error && (
          <div className="rerror-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Title Input */}
        <div className='form-section'>
          <div className="section-header">
            <label className='form-label'>
              <FileText size={18} />
              Issue Title
            </label>
            <span className={`char-count ${charCount.title > 45 ? 'warning' : ''}`}>
              {charCount.title}/50
            </span>
          </div>
          <input 
            type='text'
            placeholder='Brief, descriptive title of the issue'
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setCharCount(prev => ({ ...prev, title: e.target.value.length }));
            }}
            disabled={loading}
            maxLength={50}
            required
            className="form-input"
          />
          <div className="input-hint">
            Keep it concise and descriptive (e.g., "Large pothole on Main Street")
          </div>
        </div>

        {/* Description Input */}
        <div className='form-section'>
          <div className="section-header">
            <label className='form-label'>
              <FileText size={18} />
              Detailed Description
            </label>
            <span className={`char-count ${charCount.description > 450 ? 'warning' : ''}`}>
              {charCount.description}/500
            </span>
          </div>
          <textarea 
            placeholder="Provide detailed information about the issue. Include location specifics, size, potential hazards, and any other relevant details."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setCharCount(prev => ({ ...prev, description: e.target.value.length }));
            }}
            disabled={loading}
            rows={5}
            maxLength={500}
            required
            className="form-textarea"
          />
          <div className="input-hint">
            The more details you provide, the easier it is for authorities to address the issue.
          </div>
        </div>

        {/* Category & Urgency Grid */}
        <div className="form-grid">
          {/* Category Selector */}
          <div className='form-section'>
            <label className='form-label'>
              <Tag size={18} />
              Category
            </label>
            <div className="category-grid">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.value}
                  className={`category-option ${category === cat.value ? 'selected' : ''}`}
                  onClick={() => setCategory(cat.value)}
                  disabled={loading}
                  style={{
                    '--category-color': cat.color
                  }}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-label">{cat.label}</span>
                </button>
              ))}
            </div>
            {category && (
              <div className="selected-indicator">
                <span className="selected-icon" style={{ backgroundColor: getSelectedCategory()?.color }}>
                  {getSelectedCategory()?.icon}
                </span>
                <span className="selected-text">
                  Selected: <strong>{getSelectedCategory()?.label}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Urgency Selector */}
          <div className='form-section'>
            <label className='form-label'>
              <AlertTriangle size={18} />
              Urgency Level
            </label>
            <div className="urgency-grid">
              {urgencies.map((urg) => (
                <button
                  type="button"
                  key={urg.value}
                  className={`urgency-option ${urgency === urg.value ? 'selected' : ''}`}
                  onClick={() => setUrgency(urg.value)}
                  disabled={loading}
                  style={{
                    '--urgency-color': urg.color
                  }}
                >
                  <div className="urgency-dot" style={{ backgroundColor: urg.color }} />
                  <div className="urgency-content">
                    <span className="urgency-label">{urg.label}</span>
                    <span className="urgency-description">{urg.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className='form-section'>
          <div className="section-header">
            <label className='form-label'>
              <Camera size={18} />
              Photos
              <span className="optional-badge">Optional</span>
            </label>
            <span className="image-count">
              {preview.length + (editing?.photos?.length || 0)}/5 images
            </span>
          </div>

          {/* Existing Photos */}
          {editing && editing.photos && editing.photos.length > 0 && (
            <div className="existing-photos-section">
              <div className="photos-header">
                <h4>Existing Photos</h4>
                <small className="photo-count">({editing.photos.length} image(s))</small>
              </div>
              <div className="photos-grid">
                {editing.photos.map((photo, index) => (
                  <div key={`existing-${index}`} className="photo-item existing">
                    <img
                      src={photo}
                      alt={`Existing ${index}`}
                      className="photo-preview"
                    />
                    <div className="photo-label">
                      <CheckCircle size={12} />
                      <span>Existing</span>
                    </div>
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={() => removeImage(index, true)}
                      title="Cannot remove existing photos"
                      disabled
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div 
            className={`upload-area ${isDragging ? 'dragging' : ''} ${(preview.length + (editing?.photos?.length || 0)) >= 5 ? 'disabled' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              id='issue-image' 
              type='file' 
              accept='image/*'
              onChange={handleImageInputs}
              multiple
              disabled={loading || (preview.length + (editing?.photos?.length || 0)) >= 5}
              className="file-input"
            />
            
            <div className="upload-content">
              <Camera size={48} className="upload-icon" />
              <div className="upload-text">
                <h4>Drag & drop images here</h4>
                <p>or click to browse</p>
              </div>
              <p className="upload-hint">
                Upload up to 5 images (max 5MB each)
                <br />
                Supported formats: JPG, PNG, GIF
              </p>
            </div>
          </div>

          {/* Preview Grid */}
          {preview.length > 0 && (
            <div className="preview-section">
              <h4>New Photos ({preview.length})</h4>
              <div className="photos-grid">
                {preview.map((src, index) => (
                  <div key={`new-${index}`} className="photo-item new">
                    <img
                      src={src}
                      alt={`Preview ${index}`}
                      className="photo-preview"
                    />
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={() => removeImage(index)}
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Location Information */}
        <div className='form-section'>
          <label className='form-label'>
            <MapPin size={18} />
            Location Information
          </label>
          <div className="location-card">
            <div className="location-header">
              <Globe size={20} />
              <h4>Report Location</h4>
            </div>
            <div className="location-details">
              <div className="coordinate-item">
                <span className="coordinate-label">Latitude:</span>
                <span className="coordinate-value">{editing ? editing.latitude : latitude}</span>
              </div>
              <div className="coordinate-item">
                <span className="coordinate-label">Longitude:</span>
                <span className="coordinate-value">{editing ? editing.longitude : longitude}</span>
              </div>
              <div className="address-item">
                <span className="address-label">Address:</span>
                <span className="address-value">{editing?.address || address || 'Fetching address...'}</span>
              </div>
            </div>
            {editing && (
              <div className="location-note">
                <AlertCircle size={16} />
                <span>Location cannot be changed when editing a report</span>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rbtn rbtn-secondary"
          >
            <X size={18} />
            <span>Cancel</span>
          </button>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`rbtn rbtn-primary ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Processing...</span>
              </>
            ) : editing ? (
              <>
                <CheckCircle size={18} />
                <span>Update Report</span>
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                <span>Submit Report</span>
              </>
            )}
          </button>
        </div>

        {/* Form Footer */}
        <div className="form-footer">
          <div className="footer-note">
            <AlertCircle size={16} />
            <span>Your report will be reviewed by local authorities. You'll receive updates on its status.</span>
          </div>
          <div className="privacy-note">
            <span>By submitting, you agree to our </span>
            <a href="#" className="privacy-link">Privacy Policy</a>
            <span> and </span>
            <a href="#" className="privacy-link">Terms of Service</a>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ReportCard;