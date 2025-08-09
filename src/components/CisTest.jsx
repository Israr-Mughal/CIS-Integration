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
    <div className="card" style={{ margin: '20px' }}>
      <h3 className="text-xl font-semibold mb-4">CIS Integration Test</h3>
      <div className="flex space-x-2 mb-3">
        <button
          onClick={testConnection}
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        <button
          onClick={testInteraction}
          disabled={loading}
          className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Recording...' : 'Test Interaction'}
        </button>
      </div>
      <p className="input-field" style={{ margin: 0 }}>
        {status || 'Click buttons to test CIS integration'}
      </p>
    </div>
  );
};