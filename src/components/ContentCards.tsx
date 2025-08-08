import React, { useRef, useEffect, useState } from 'react';
import { useCIS } from '../hooks/useCIS';
import type { ContentType, InteractionType } from '../types/cis';
import {
  Heart,
  Share,
  Phone,
  MapPin,
  Play,
  Pause,
  Music,
  Video,
  FileText,
  Camera,
  Bell,
  MessageCircle,
  ExternalLink,
  Smartphone
} from 'lucide-react';

interface ContentCardProps {
  id: string;
  type: ContentType;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  metadata?: Record<string, any>;
}

const ContentCard: React.FC<ContentCardProps> = ({ id, type, title, subtitle, description, image, metadata }) => {
  const {
    trackInteraction,
    startDwellTracking,
    stopDwellTracking,
    getDwellTime
  } = useCIS();

  const cardRef = useRef<HTMLDivElement>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dwellTime, setDwellTime] = useState(0);

  // Start dwell tracking when component mounts
  useEffect(() => {
    if (cardRef.current) {
      startDwellTracking(id, cardRef as React.RefObject<HTMLElement>);
    }

    return () => {
      stopDwellTracking(id);
    };
  }, [id, startDwellTracking, stopDwellTracking]);

  // Update dwell time display
  useEffect(() => {
    const interval = setInterval(() => {
      setDwellTime(getDwellTime(id));
    }, 1000);

    return () => clearInterval(interval);
  }, [id, getDwellTime]);

  const handleInteraction = async (interactionType: InteractionType) => {
    await trackInteraction(
      id,
      type,
      'portal',
      interactionType,
      dwellTime,
      { ...metadata, ui_interaction: true }
    );

    // Handle UI state changes
    if (interactionType === 'saves') {
      setIsLiked(!isLiked);
    } else if (interactionType === 'starts_audio' || interactionType === 'plays_entire_audio') {
      setIsPlaying(!isPlaying);
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'music': return Music;
      case 'video': return Video;
      case 'location': return MapPin;
      case 'article': return FileText;
      case 'podcast': return FileText;
      case 'share': return Share;
      default: return FileText;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'music': return 'bg-purple-500';
      case 'video': return 'bg-red-500';
      case 'location': return 'bg-blue-500';
      case 'article': return 'bg-green-500';
      case 'podcast': return 'bg-orange-500';
      case 'share': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

  const TypeIcon = getTypeIcon();

  return (
    <div
      ref={cardRef}
      className="card hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => handleInteraction('opens')}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${getTypeColor()} text-white`}>
            <TypeIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {dwellTime > 0 && `${dwellTime}s`}
        </div>
      </div>

      {/* Image */}
      {image && (
        <div className="mb-3">
          <img
            src={image}
            alt={title}
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {description}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Primary action based on content type */}
          {type === 'music' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleInteraction(isPlaying ? 'plays_entire_audio' : 'starts_audio');
              }}
              className="btn-primary text-sm px-3 py-1"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          )}

          {type === 'video' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleInteraction('views');
              }}
              className="btn-primary text-sm px-3 py-1"
            >
              <Play className="h-4 w-4" />
            </button>
          )}

          {type === 'location' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleInteraction('taps_directions_cta');
              }}
              className="btn-primary text-sm px-3 py-1"
            >
              <MapPin className="h-4 w-4" />
            </button>
          )}

          {type === 'article' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleInteraction('opens_detail');
              }}
              className="btn-primary text-sm px-3 py-1"
            >
              <FileText className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {/* Save/Like */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleInteraction('saves');
            }}
            className={`p-2 rounded-lg transition-colors ${
              isLiked
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
            }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          {/* Share */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleInteraction('shares_genie');
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Share className="h-4 w-4" />
          </button>

          {/* Screenshot */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleInteraction('takes_screenshot');
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Additional actions for specific content types */}
      {type === 'location' && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleInteraction('taps_call_cta');
            }}
            className="btn-secondary text-sm px-3 py-1 w-full"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call
          </button>
        </div>
      )}

      {type === 'music' && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleInteraction('opens_outbound_app');
              }}
              className="btn-secondary text-sm px-3 py-1 flex-1"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Open in App
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleInteraction('requests_reminder');
              }}
              className="btn-secondary text-sm px-3 py-1"
            >
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {type === 'article' && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleInteraction('opens_outbound_link_web');
              }}
              className="btn-secondary text-sm px-3 py-1 flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Link
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleInteraction('asks_follow_up');
              }}
              className="btn-secondary text-sm px-3 py-1"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Sample content data
const SAMPLE_CONTENT: ContentCardProps[] = [
  {
    id: 'music-001',
    type: 'music',
    title: 'Midnight City',
    subtitle: 'M83',
    description: 'An electronic masterpiece that captures the essence of urban nightlife with its dreamy synths and driving beat.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
    metadata: { artist: 'M83', album: 'Hurry Up, We\'re Dreaming', year: 2011 }
  },
  {
    id: 'location-001',
    type: 'location',
    title: 'Blue Bottle Coffee',
    subtitle: 'Artisan Coffee Shop',
    description: 'Premium coffee experience with carefully sourced beans and expertly crafted beverages in a modern, minimalist setting.',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=200&fit=crop',
    metadata: { address: '123 Main St', rating: 4.8, category: 'Coffee Shop' }
  },
  {
    id: 'video-001',
    type: 'video',
    title: 'The Art of Photography',
    subtitle: 'Masterclass Series',
    description: 'Learn advanced photography techniques from world-renowned photographers in this comprehensive video series.',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=200&fit=crop',
    metadata: { duration: '45:30', instructor: 'Sarah Johnson', level: 'Advanced' }
  },
  {
    id: 'article-001',
    type: 'article',
    title: 'The Future of AI in Healthcare',
    subtitle: 'Technology Trends',
    description: 'Exploring how artificial intelligence is revolutionizing healthcare delivery and patient outcomes.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
    metadata: { author: 'Dr. Michael Chen', readTime: '8 min', category: 'Healthcare' }
  },
  {
    id: 'podcast-001',
    type: 'podcast',
    title: 'The Daily Tech Brief',
    subtitle: 'Daily Technology News',
    description: 'Your daily dose of technology news, trends, and insights from industry experts and thought leaders.',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=200&fit=crop',
    metadata: { host: 'Alex Rivera', duration: '25:15', category: 'Technology' }
  },
  {
    id: 'share-001',
    type: 'share',
    title: 'Amazing Sunset View',
    subtitle: 'Shared by @naturelover',
    description: 'Breathtaking sunset captured during golden hour at the beach. Nature at its finest!',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
    metadata: { author: '@naturelover', location: 'Malibu Beach', likes: 1247 }
  }
];

export const ContentGallery: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');

  const filteredContent = selectedType === 'all'
    ? SAMPLE_CONTENT
    : SAMPLE_CONTENT.filter(content => content.type === selectedType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-green-700">Content Gallery</h2>
          <p className="text-green-600">
            Sample content with dwell time tracking and interaction testing
          </p>
        </div>

        {/* Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as ContentType | 'all')}
          className="input-field w-auto"
        >
          <option value="all">All Types</option>
          <option value="music">Music</option>
          <option value="location">Location</option>
          <option value="video">Video</option>
          <option value="article">Article</option>
          <option value="podcast">Podcast</option>
          <option value="share">Share</option>
        </select>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((content) => (
          <ContentCard key={content.id} {...content} />
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No content found for the selected type</p>
        </div>
      )}
    </div>
  );
};