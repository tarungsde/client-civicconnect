import React from 'react';

function AdminSidebar({ filters, setFilters, viewMode, setViewMode }) {
  const statusOptions = ['', 'Pending', 'In-progress', 'Resolved', 'Rejected'];
  const categoryOptions = ['', 'pothole', 'garbage', 'streetlight', 'water', 'traffic', 'other'];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  return (
    <div style={{
      width: '280px',
      background: '#f8f9fa',
      borderRight: '1px solid #dee2e6',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <h3 style={{ marginBottom: '20px' }}>Admin Dashboard</h3>
      
      {/* View Mode Selector */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ marginBottom: '10px' }}>View Mode</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => setViewMode('map')}
            style={{
              padding: '10px',
              background: viewMode === 'map' ? '#007bff' : '#e9ecef',
              color: viewMode === 'map' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            📍 Map View
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '10px',
              background: viewMode === 'table' ? '#007bff' : '#e9ecef',
              color: viewMode === 'table' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            📋 Table View
          </button>
          <button
            onClick={() => setViewMode('stats')}
            style={{
              padding: '10px',
              background: viewMode === 'stats' ? '#007bff' : '#e9ecef',
              color: viewMode === 'stats' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            📊 Statistics
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Filters
          <button
            onClick={clearFilters}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status === '' ? 'All Status' : status}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {categoryOptions.map(category => (
              <option key={category} value={category}>
                {category === '' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Date From</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Date To</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ 
        background: 'white', 
        padding: '15px', 
        borderRadius: '6px',
        border: '1px solid #dee2e6'
      }}>
        <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>Quick Actions</h4>
        <button
          onClick={() => setFilters({...filters, status: 'Pending'})}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '8px',
            background: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          View Pending Reports
        </button>
        <button
          onClick={() => setFilters({...filters, status: 'Resolved'})}
          style={{
            width: '100%',
            padding: '8px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          View Resolved Reports
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;