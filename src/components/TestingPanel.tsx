import React, { useState } from 'react';
import { useCIS } from '../hooks/useCIS';
import type { InteractionType, ContentType, ContentLocation } from '../types/cis';
import {
  Play,
  Eye,
  Heart,
  Share,
  Phone,
  MapPin,
  Music,
  Video,
  FileText,
  Camera,
  Bell,
  MessageCircle,
  RotateCcw,
  ExternalLink,
  Smartphone,
  Zap,
  AlertTriangle,
  Activity
} from 'lucide-react';

const INTERACTION_TYPES: Array<{
  type: InteractionType;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
}> = [
  { type: 'opens', label: 'Opens', icon: Eye, description: 'Content thumbnail appears', color: 'bg-blue-500' },
  { type: 'views', label: 'Views', icon: Eye, description: 'Full screen content viewing', color: 'bg-green-500' },
  { type: 'saves', label: 'Saves', icon: Heart, description: 'Bookmarking content', color: 'bg-red-500' },
  { type: 'opens_detail', label: 'Opens Detail', icon: FileText, description: 'Detailed content view', color: 'bg-purple-500' },
  { type: 'opens_outbound_link_web', label: 'Opens Web Link', icon: ExternalLink, description: 'External web links', color: 'bg-indigo-500' },
  { type: 'opens_outbound_app', label: 'Opens App', icon: Smartphone, description: 'External app links', color: 'bg-pink-500' },
  { type: 'taps_call_cta', label: 'Call CTA', icon: Phone, description: 'Call-to-action buttons', color: 'bg-green-600' },
  { type: 'taps_directions_cta', label: 'Directions CTA', icon: MapPin, description: 'Navigation buttons', color: 'bg-blue-600' },
  { type: 'starts_audio', label: 'Starts Audio', icon: Play, description: 'Audio playback initiation', color: 'bg-yellow-500' },
  { type: 'plays_entire_audio', label: 'Plays Entire Audio', icon: Music, description: 'Complete audio consumption', color: 'bg-orange-500' },
  { type: 'shares_genie', label: 'Shares (Genie)', icon: Share, description: 'In-app sharing', color: 'bg-teal-500' },
  { type: 'shares_ios', label: 'Shares (iOS)', icon: Share, description: 'Native iOS sharing', color: 'bg-gray-500' },
  { type: 'takes_screenshot', label: 'Takes Screenshot', icon: Camera, description: 'Screenshot capture', color: 'bg-gray-600' },
  { type: 'requests_reminder', label: 'Requests Reminder', icon: Bell, description: 'Reminder setting', color: 'bg-yellow-600' },
  { type: 'asks_follow_up', label: 'Asks Follow-up', icon: MessageCircle, description: 'Content-specific questions', color: 'bg-purple-600' },
  { type: 'repeat_views', label: 'Repeat Views', icon: RotateCcw, description: 'Subsequent content views', color: 'bg-cyan-500' },
];

const CONTENT_TYPES: Array<{ type: ContentType; label: string; icon: React.ComponentType<any> }> = [
  { type: 'recommendation', label: 'Recommendation', icon: Zap },
  { type: 'location', label: 'Location', icon: MapPin },
  { type: 'music', label: 'Music', icon: Music },
  { type: 'video', label: 'Video', icon: Video },
  { type: 'podcast', label: 'Podcast', icon: FileText },
  { type: 'article', label: 'Article', icon: FileText },
  { type: 'share', label: 'Share', icon: Share },
];

const CONTENT_LOCATIONS: Array<{ type: ContentLocation; label: string }> = [
  { type: 'portal', label: 'Portal' },
  { type: 'prompt', label: 'Prompt' },
  { type: 'chat', label: 'Chat' },
  { type: 'direct_url', label: 'Direct URL' },
];

export const TestingPanel: React.FC = () => {
  const {
    trackInteraction,
    trackBatchInteractions,
    isTracking,
    error,
    simulateNetworkFailure,
    simulateRateLimit
  } = useCIS();

  const [selectedContentType, setSelectedContentType] = useState<ContentType>('recommendation');
  const [selectedLocation, setSelectedLocation] = useState<ContentLocation>('portal');
  const [contentId, setContentId] = useState('test-content-001');
  const [batchSize, setBatchSize] = useState(10);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInteractionClick = async (interactionType: InteractionType) => {
    await trackInteraction(
      contentId,
      selectedContentType,
      selectedLocation,
      interactionType
    );
  };

  const handleBatchTest = async () => {
    const interactions = Array.from({ length: batchSize }, (_, i) => ({
      content_id: `${contentId}-batch-${i}`,
      content_type: selectedContentType,
      content_location: selectedLocation,
      interaction_type: INTERACTION_TYPES[i % INTERACTION_TYPES.length].type as InteractionType,
      timestamp: new Date(Date.now() - i * 1000).toISOString(),
      dwell_time: Math.floor(Math.random() * 300) + 10,
      metadata: { batch_test: true, index: i }
    }));

    await trackBatchInteractions(interactions);
  };

  const handleSimulateError = async (type: 'network' | 'rate-limit') => {
    if (type === 'network') {
      await simulateNetworkFailure();
    } else {
      await simulateRateLimit();
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-700">CIS Testing Panel</h2>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="btn-secondary"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Configuration Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-green-600 mb-2">
            Content Type
          </label>
          <select
            value={selectedContentType}
            onChange={(e) => setSelectedContentType(e.target.value as ContentType)}
            className="input-field"
          >
            {CONTENT_TYPES.map(({ type, label }) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-green-600 mb-2">
            Content Location
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value as ContentLocation)}
            className="input-field"
          >
            {CONTENT_LOCATIONS.map(({ type, label }) => (
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-green-600 mb-2">
            Content ID
          </label>
          <input
            type="text"
            value={contentId}
            onChange={(e) => setContentId(e.target.value)}
            className="input-field"
            placeholder="Enter content ID"
          />
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-green-700">Advanced Testing Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-600 mb-2">
                Batch Size
              </label>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value) || 10)}
                className="input-field"
                min="1"
                max="100"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleBatchTest}
                disabled={isTracking}
                className="btn-primary flex-1"
              >
                {isTracking ? 'Testing...' : `Test ${batchSize} Interactions`}
              </button>
            </div>
          </div>

          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => handleSimulateError('network')}
              className="btn-error"
            >
              Simulate Network Failure
            </button>
            <button
              onClick={() => handleSimulateError('rate-limit')}
              className="btn-error"
            >
              Simulate Rate Limit
            </button>
          </div>
        </div>
      )}

      {/* Interaction Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-700">
          Interaction Types ({INTERACTION_TYPES.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {INTERACTION_TYPES.map(({ type, label, icon: Icon, description, color }) => (
            <button
              key={type}
              onClick={() => handleInteractionClick(type)}
              disabled={isTracking}
              className={`
                relative p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600
                hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200
                ${isTracking ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                group
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-green-700 group-hover:text-green-600">
                    {label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {description}
                  </div>
                </div>
              </div>

              {/* Status indicator */}
              <div className="absolute top-2 right-2">
                <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300'}`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 dark:text-gray-400">
              Status: {isTracking ? 'Tracking...' : 'Ready'}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Content: {selectedContentType} • {selectedLocation}
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            ID: {contentId}
          </div>
        </div>
      </div>
    </div>
  );
};