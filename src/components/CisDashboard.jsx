import React, { useState, useEffect } from 'react';
import { cisApi, cisUtils } from '../services/cisApi';

export const CisDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const stats = await cisApi.getInteractionStats();
      setAnalytics(stats);
    } catch (error) {
      setError('Failed to fetch analytics: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !analytics) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading analytics...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>CIS Analytics Dashboard</h2>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {analytics && (
        <div>
          {/* Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Total Interactions</h3>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#1976d2' }}>
                {analytics.total}
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#f3e5f5',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#7b1fa2' }}>Content Types</h3>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#7b1fa2' }}>
                {Object.keys(analytics.byContent).length}
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#e8f5e8',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#388e3c' }}>Interaction Types</h3>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#388e3c' }}>
                {Object.keys(analytics.byType).length}
              </div>
            </div>
          </div>

          {/* Recent Interactions */}
          <div style={{ marginBottom: '30px' }}>
            <h3>Recent Interactions ({analytics.recent.length})</h3>
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}>
              {analytics.recent.map((interaction) => (
                <div key={interaction.id} style={{
                  borderBottom: '1px solid #eee',
                  padding: '15px',
                  backgroundColor: '#fff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#007bff' }}>
                        {cisUtils.getInteractionTypeName(interaction.interaction_type)}
                      </strong>
                      <span style={{ color: '#666', marginLeft: '10px' }}>
                        on {interaction.content_type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9em', color: '#666' }}>
                      {new Date(interaction.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ marginTop: '5px', fontSize: '0.9em', color: '#666' }}>
                    Content: {interaction.content_id}
                    {interaction.dwell_time_ms && (
                      <span style={{ marginLeft: '10px' }}>
                        • Dwell: {cisUtils.formatDwellTime(interaction.dwell_time_ms)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interaction Type Breakdown */}
          <div style={{ marginBottom: '30px' }}>
            <h3>Interaction Type Breakdown</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '10px'
            }}>
              {Object.entries(analytics.byType).map(([type, count]) => (
                <div key={type} style={{
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#007bff' }}>
                    {cisUtils.getInteractionTypeName(type)}
                  </div>
                  <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#111827' }}>
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};