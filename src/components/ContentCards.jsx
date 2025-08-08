import React from 'react';
import { useCisTracking } from '../hooks/useCisTracking';
import { CONTENT_TYPES, INTERACTION_TYPES } from '../config/cis';

export const ContentCards = () => {
  const cards = [
    {
      id: 'recommendation-card-1',
      type: CONTENT_TYPES.RECOMMENDATION,
      title: 'Amazing Restaurant',
      description: 'Best Italian food in town',
      image: 'https://via.placeholder.com/300x200/ff6b6b/ffffff?text=Restaurant'
    },
    {
      id: 'music-card-1',
      type: CONTENT_TYPES.MUSIC,
      title: 'New Album Release',
      description: 'Listen to the latest hits',
      image: 'https://via.placeholder.com/300x200/4ecdc4/ffffff?text=Music'
    },
    {
      id: 'location-card-1',
      type: CONTENT_TYPES.LOCATION,
      title: 'Tourist Attraction',
      description: 'Must-visit places in the city',
      image: 'https://via.placeholder.com/300x200/45b7d1/ffffff?text=Location'
    },
    {
      id: 'video-card-1',
      type: CONTENT_TYPES.VIDEO,
      title: 'Travel Vlog',
      description: 'Amazing travel experiences',
      image: 'https://via.placeholder.com/300x200/96ceb4/ffffff?text=Video'
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h3>Interactive Content Cards</h3>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        These cards automatically track dwell time and interactions
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {cards.map((card) => (
          <ContentCard key={card.id} {...card} />
        ))}
      </div>
    </div>
  );
};

const ContentCard = ({ id, type, title, description, image }) => {
  const { isVisible, dwellTime, recordInteraction } = useCisTracking(id, type);

  const handleInteraction = async (interactionType) => {
    await recordInteraction(interactionType, {
      card_title: title,
      card_description: description,
      dwell_time: dwellTime
    });
  };

  return (
    <div
      id={id}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={() => handleInteraction(INTERACTION_TYPES.VIEWS)}
    >
      <img
        src={image}
        alt={title}
        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
      />

      <div style={{ padding: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{title}</h4>
        <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
          {description}
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <span style={{ fontSize: '12px', color: '#999' }}>
            {isVisible ? '🟢 Visible' : '🔴 Hidden'}
          </span>
          <span style={{ fontSize: '12px', color: '#999' }}>
            Dwell: {Math.floor(dwellTime / 1000)}s
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleInteraction(INTERACTION_TYPES.SAVES)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
          <button
            onClick={() => handleInteraction(INTERACTION_TYPES.SHARES)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Share
          </button>
          <button
            onClick={() => handleInteraction(INTERACTION_TYPES.OPENS_DETAIL)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ffc107',
              color: '#212529',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};