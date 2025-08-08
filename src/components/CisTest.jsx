import React, { useState } from 'react';
import { cisApi } from '../services/cisApi';

export const CisTest = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await cisApi.testConnection();
      if (result.success) {
        setStatus(`✅ Connected! Found ${result.data.length} interactions`);
      } else {
        setStatus(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testInteraction = async () => {
    setLoading(true);
    try {
      const testData = {
        content_id: `test-content-${Date.now()}`,
        content_type: 'recommendation',
        interaction_type: 'views',
        content_location: 'portal',
        dwell_time_ms: 5000,
        extra_data: { test: true, timestamp: Date.now() }
      };

      const response = await cisApi.recordInteraction(testData);
      setStatus(`✅ Interaction recorded! ID: ${response.data.id}`);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ccc',
      margin: '20px',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>CIS Integration Test</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button
          onClick={testConnection}
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        <button
          onClick={testInteraction}
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Recording...' : 'Test Interaction'}
        </button>
      </div>
      <p style={{
        padding: '10px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        margin: 0
      }}>
        {status || 'Click buttons to test CIS integration'}
      </p>
    </div>
  );
};