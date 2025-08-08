import React, { useState } from 'react';
import { cisApi } from '../services/cisApi';
import { INTERACTION_TYPES, CONTENT_TYPES } from '../config/cis';

const INTERACTION_TYPES_LIST = Object.values(INTERACTION_TYPES);
const CONTENT_TYPES_LIST = Object.values(CONTENT_TYPES);

export const InteractionTester = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testInteraction = async (interactionType) => {
    setLoading(true);
    try {
      const testData = {
        content_id: `test-${interactionType}-${Date.now()}`,
        content_type: 'recommendation',
        interaction_type: interactionType,
        content_location: 'portal',
        extra_data: {
          test: true,
          timestamp: Date.now(),
          interaction_type: interactionType
        }
      };

      await cisApi.recordInteraction(testData);
      setStatus(`✅ ${interactionType} recorded successfully!`);

      // Clear status after 2 seconds
      setTimeout(() => setStatus(''), 2000);
    } catch (error) {
      setStatus(`❌ Error recording ${interactionType}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Test All Interaction Types</h3>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Click any button to test that specific interaction type
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {INTERACTION_TYPES_LIST.map((type) => (
          <button
            key={type}
            onClick={() => testInteraction(type)}
            disabled={loading}
            style={{
              padding: '12px',
              border: '1px solid #007bff',
              borderRadius: '6px',
              background: loading ? '#ccc' : '#007bff',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!loading) e.target.style.backgroundColor = '#0056b3';
            }}
            onMouseOut={(e) => {
              if (!loading) e.target.style.backgroundColor = '#007bff';
            }}
          >
            {type.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {status && (
        <div style={{
          padding: '10px',
          backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${status.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          color: status.includes('✅') ? '#155724' : '#721c24'
        }}>
          {status}
        </div>
      )}
    </div>
  );
};