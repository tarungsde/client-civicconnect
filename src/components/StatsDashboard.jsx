import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  X,
  Clock,
} from 'lucide-react';

function StatsDashboard({ stats: initialStats }) {
  const [stats, setStats] = useState(initialStats);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialStats) {
      fetchStats();
    }
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats({ timeRange });
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

  if (loading && !stats) {
    return (
      <div className="admin-stats-loading">
        <div className="loading-spinner-large"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-stats-error">
        <AlertCircle size={48} />
        <p>Failed to load statistics</p>
        <button className="retry-btn" onClick={fetchStats}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-stats-dashboard">
      {/* Header */}
      <div className="stats-dashboard-header">
        <div className="header-left">
          <BarChart3 size={24} />
          <div>
            <h2>Analytics Dashboard</h2>
            <p className="time-range-text">{getTimeRangeText()}</p>
          </div>
        </div>
        <div className="header-right">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          <button className="refresh-stats-btn" onClick={fetchStats} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
          <button className="export-stats-btn">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-summary-cards">
        <div className="summary-card total">
          <div className="card-icon">
            <Target size={24} />
          </div>
          <div className="card-content">
            <span className="card-value">{stats.totalReports}</span>
            <span className="card-label">Total Reports</span>
          </div>
        </div>

        {stats.statusStats?.map((stat, index) => {
          const colors = ['#ef4444', '#f59e0b', '#10b981', '#6b7280'];
          const icons = [<AlertCircle />, <Clock />, <Target />, <X />];
          return (
            <div key={stat._id || index} className="summary-card" style={{ borderLeftColor: colors[index] }}>
              <div className="card-icon" style={{ color: colors[index] }}>
                {icons[index] || <Target />}
              </div>
              <div className="card-content">
                <span className="card-value" style={{ color: colors[index] }}>
                  {stat.count}
                </span>
                <span className="card-label">{stat._id || 'Unknown'}</span>
                <span className="card-percentage">
                  {Math.round((stat.count / stats.totalReports) * 100)}%
                </span>
              </div>
            </div>
          );
        })}

        <div className="summary-card users">
          <div className="card-icon">
            <Users size={24} />
          </div>
          <div className="card-content">
            <span className="card-value">{stats.uniqueReporters || 'N/A'}</span>
            <span className="card-label">Active Users</span>
          </div>
        </div>

        <div className="summary-card trend">
          <div className="card-icon">
            <TrendingUp size={24} />
          </div>
          <div className="card-content">
            <span className="card-value">{stats.averageResolutionTime || 'N/A'}</span>
            <span className="card-label">Avg. Resolution Time</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="stats-charts-grid">
        {/* Category Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h4>Category Distribution</h4>
            <span className="chart-subtitle">By report type</span>
          </div>
          <div className="category-chart">
            {stats.categoryStats?.map((category, index) => (
              <div key={category._id} className="category-chart-item">
                <div className="category-chart-label">
                  <span>{category._id || 'Other'}</span>
                  <span>{category.count}</span>
                </div>
                <div className="category-chart-bar">
                  <div 
                    className="category-chart-fill"
                    style={{ 
                      width: `${(category.count / stats.totalReports) * 100}%`,
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgency Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h4>Urgency Level</h4>
            <span className="chart-subtitle">Report priority breakdown</span>
          </div>
          <div className="urgency-chart">
            {stats.urgencyStats?.map((urgency) => {
              const colorMap = {
                'high': '#ef4444',
                'medium': '#f59e0b',
                'low': '#10b981'
              };
              return (
                <div key={urgency._id} className="urgency-chart-item">
                  <div className="urgency-chart-label">
                    <div className="urgency-dot" style={{ backgroundColor: colorMap[urgency._id] || '#6b7280' }} />
                    <span className="urgency-name">{urgency._id || 'Unknown'}</span>
                    <span className="urgency-count">{urgency.count}</span>
                  </div>
                  <div className="urgency-chart-bar">
                    <div 
                      className="urgency-chart-fill"
                      style={{ 
                        width: `${(urgency.count / stats.totalReports) * 100}%`,
                        backgroundColor: colorMap[urgency._id] || '#6b7280'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Chart */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h4>Report Activity</h4>
            <span className="chart-subtitle">{getTimeRangeText()}</span>
          </div>
          <div className="activity-chart">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="activity-bars">
                {stats.recentActivity.map((day, index) => {
                  const maxCount = Math.max(...stats.recentActivity.map(d => d.count));
                  const height = maxCount > 0 ? (day.count / maxCount) * 150 : 0;
                  return (
                    <div key={day._id} className="activity-bar-item">
                      <div className="activity-bar-container">
                        <div 
                          className="activity-bar"
                          style={{ height: `${height}px` }}
                        />
                        <div className="activity-count">{day.count}</div>
                      </div>
                      <div className="activity-label">
                        {day._id.split('-').slice(1).join('/')}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-activity">
                <Calendar size={48} />
                <p>No activity data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="chart-card">
          <div className="chart-header">
            <h4>Status Flow</h4>
            <span className="chart-subtitle">Report lifecycle</span>
          </div>
          <div className="status-flow">
            {stats.statusTimeline?.map((status, index) => (
              <div key={status._id} className="status-flow-item">
                <div className="status-flow-label">
                  <span>{status._id}</span>
                  <span>{status.count}</span>
                </div>
                <div className="status-flow-bar">
                  <div 
                    className="status-flow-fill"
                    style={{ 
                      width: `${(status.count / stats.totalReports) * 100}%`,
                      backgroundColor: `hsl(${index * 90}, 70%, 50%)`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Time */}
        <div className="chart-card">
          <div className="chart-header">
            <h4>Resolution Time</h4>
            <span className="chart-subtitle">Days to resolve</span>
          </div>
          <div className="resolution-stats">
            <div className="resolution-stat">
              <span className="resolution-label">Average</span>
              <span className="resolution-value">{stats.averageResolutionTime || 'N/A'} days</span>
            </div>
            <div className="resolution-stat">
              <span className="resolution-label">Median</span>
              <span className="resolution-value">{stats.medianResolutionTime || 'N/A'} days</span>
            </div>
            <div className="resolution-stat">
              <span className="resolution-label">Fastest</span>
              <span className="resolution-value">{stats.fastestResolution || 'N/A'} days</span>
            </div>
            <div className="resolution-stat">
              <span className="resolution-label">Longest</span>
              <span className="resolution-value">{stats.longestResolution || 'N/A'} days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsDashboard;