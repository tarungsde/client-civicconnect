import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

function StatsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month', 'year'

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'day': return 'Last 24 Hours';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'year': return 'Last Year';
      default: return 'Last 7 Days';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%' 
      }}>
        Loading statistics...
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%' 
      }}>
        Failed to load statistics
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3>Statistics Dashboard</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ marginBottom: '10px', color: '#6c757d' }}>Total Reports</h4>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff' }}>
            {stats.totalReports}
          </div>
        </div>

        {stats.statusStats && stats.statusStats.map((stat, index) => {
          const colors = ['#ffc107', '#17a2b8', '#28a745', '#dc3545'];
          return (
            <div key={stat._id} style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ marginBottom: '10px', color: '#6c757d' }}>
                {stat._id || 'Unknown'} Status
              </h4>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: 'bold',
                color: colors[index] || '#6c757d'
              }}>
                {stat.count}
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '5px' }}>
                {Math.round((stat.count / stats.totalReports) * 100)}% of total
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts/Data Sections */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* Category Distribution */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ marginBottom: '15px' }}>Category Distribution</h4>
          <div>
            {stats.categoryStats && stats.categoryStats.map((category, index) => (
              <div key={category._id} style={{ marginBottom: '10px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '5px'
                }}>
                  <span>{category._id || 'Unknown'}</span>
                  <span>{category.count} ({Math.round((category.count / stats.totalReports) * 100)}%)</span>
                </div>
                <div style={{ 
                  height: '8px', 
                  background: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${(category.count / stats.totalReports) * 100}%`,
                    background: `hsl(${index * 60}, 70%, 50%)`
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency Distribution */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ marginBottom: '15px' }}>Urgency Distribution</h4>
          <div>
            {stats.urgencyStats && stats.urgencyStats.map((urgency) => {
              const colorMap = {
                'high': '#dc3545',
                'medium': '#ffc107',
                'low': '#28a745'
              };
              return (
                <div key={urgency._id} style={{ marginBottom: '10px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '5px'
                  }}>
                    <span style={{ 
                      textTransform: 'capitalize',
                      color: colorMap[urgency._id] || '#6c757d'
                    }}>
                      {urgency._id || 'Unknown'}
                    </span>
                    <span>{urgency.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          gridColumn: '1 / -1'
        }}>
          <h4 style={{ marginBottom: '15px' }}>Recent Activity ({getTimeRangeText()})</h4>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end',
            height: '200px',
            gap: '10px',
            padding: '10px 0'
          }}>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((day, index) => {
                const maxCount = Math.max(...stats.recentActivity.map(d => d.count));
                const height = (day.count / maxCount) * 150;
                return (
                  <div key={day._id} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ 
                      height: `${height}px`,
                      background: '#007bff',
                      borderRadius: '4px 4px 0 0',
                      marginBottom: '5px'
                    }} />
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      {day._id.split('-').slice(1).join('/')}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {day.count}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ 
                textAlign: 'center', 
                width: '100%', 
                color: '#6c757d'
              }}>
                No activity data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsDashboard;