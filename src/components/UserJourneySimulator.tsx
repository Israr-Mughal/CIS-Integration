import React, { useState, useEffect, useCallback } from 'react';
import { useCIS } from '../hooks/useCIS';
import type { InteractionType, ContentType, ContentLocation } from '../types/cis';
import {
  Play,
  CheckCircle,
  Circle,
  Clock,
  User,
  MapPin,
  Music,
  Video,
  FileText,
  Share,
  Phone,
  ArrowRight,
  RotateCcw,
  Zap
} from 'lucide-react';

interface JourneyStep {
  id: string;
  name: string;
  description: string;
  interactionType: InteractionType;
  contentType: ContentType;
  contentLocation: ContentLocation;
  contentId: string;
  delay: number;
  icon: React.ComponentType<any>;
  status: 'pending' | 'active' | 'completed' | 'error';
  error?: string;
}

interface JourneyTemplate {
  id: string;
  name: string;
  description: string;
  steps: Omit<JourneyStep, 'status' | 'error'>[];
  estimatedDuration: number;
}

const JOURNEY_TEMPLATES: JourneyTemplate[] = [
  {
    id: 'music-discovery',
    name: 'Music Discovery Journey',
    description: 'Complete music discovery and interaction flow',
    estimatedDuration: 45,
    steps: [
      {
        id: 'music-1',
        name: 'Discover Music',
        description: 'User discovers a music recommendation',
        interactionType: 'opens',
        contentType: 'music',
        contentLocation: 'portal',
        contentId: 'music-discovery-001',
        delay: 2000,
        icon: Music
      },
      {
        id: 'music-2',
        name: 'View Details',
        description: 'User opens detailed music view',
        interactionType: 'opens_detail',
        contentType: 'music',
        contentLocation: 'portal',
        contentId: 'music-discovery-001',
        delay: 3000,
        icon: FileText
      },
      {
        id: 'music-3',
        name: 'Start Playback',
        description: 'User starts audio playback',
        interactionType: 'starts_audio',
        contentType: 'music',
        contentLocation: 'portal',
        contentId: 'music-discovery-001',
        delay: 5000,
        icon: Play
      },
      {
        id: 'music-4',
        name: 'Save to Library',
        description: 'User saves the music to their library',
        interactionType: 'saves',
        contentType: 'music',
        contentLocation: 'portal',
        contentId: 'music-discovery-001',
        delay: 2000,
        icon: CheckCircle
      },
      {
        id: 'music-5',
        name: 'Share with Friends',
        description: 'User shares the music with friends',
        interactionType: 'shares_genie',
        contentType: 'music',
        contentLocation: 'portal',
        contentId: 'music-discovery-001',
        delay: 2000,
        icon: Share
      }
    ]
  },
  {
    id: 'location-exploration',
    name: 'Location Exploration Journey',
    description: 'Location discovery and navigation flow',
    estimatedDuration: 60,
    steps: [
      {
        id: 'location-1',
        name: 'Discover Location',
        description: 'User discovers a location recommendation',
        interactionType: 'opens',
        contentType: 'location',
        contentLocation: 'portal',
        contentId: 'location-exploration-001',
        delay: 2000,
        icon: MapPin
      },
      {
        id: 'location-2',
        name: 'View Details',
        description: 'User opens detailed location view',
        interactionType: 'opens_detail',
        contentType: 'location',
        contentLocation: 'portal',
        contentId: 'location-exploration-001',
        delay: 3000,
        icon: FileText
      },
      {
        id: 'location-3',
        name: 'Get Directions',
        description: 'User requests directions to the location',
        interactionType: 'taps_directions_cta',
        contentType: 'location',
        contentLocation: 'portal',
        contentId: 'location-exploration-001',
        delay: 2000,
        icon: ArrowRight
      },
      {
        id: 'location-4',
        name: 'Call Business',
        description: 'User calls the business',
        interactionType: 'taps_call_cta',
        contentType: 'location',
        contentLocation: 'portal',
        contentId: 'location-exploration-001',
        delay: 3000,
        icon: Phone
      },
      {
        id: 'location-5',
        name: 'Save Location',
        description: 'User saves the location for later',
        interactionType: 'saves',
        contentType: 'location',
        contentLocation: 'portal',
        contentId: 'location-exploration-001',
        delay: 2000,
        icon: CheckCircle
      }
    ]
  },
  {
    id: 'video-engagement',
    name: 'Video Engagement Journey',
    description: 'Video content engagement flow',
    estimatedDuration: 75,
    steps: [
      {
        id: 'video-1',
        name: 'Discover Video',
        description: 'User discovers a video recommendation',
        interactionType: 'opens',
        contentType: 'video',
        contentLocation: 'portal',
        contentId: 'video-engagement-001',
        delay: 2000,
        icon: Video
      },
      {
        id: 'video-2',
        name: 'Start Watching',
        description: 'User starts video playback',
        interactionType: 'views',
        contentType: 'video',
        contentLocation: 'portal',
        contentId: 'video-engagement-001',
        delay: 10000,
        icon: Play
      },
      {
        id: 'video-3',
        name: 'Watch Entire Video',
        description: 'User watches the complete video',
        interactionType: 'plays_entire_audio',
        contentType: 'video',
        contentLocation: 'portal',
        contentId: 'video-engagement-001',
        delay: 15000,
        icon: CheckCircle
      },
      {
        id: 'video-4',
        name: 'Take Screenshot',
        description: 'User takes a screenshot of the video',
        interactionType: 'takes_screenshot',
        contentType: 'video',
        contentLocation: 'portal',
        contentId: 'video-engagement-001',
        delay: 2000,
        icon: FileText
      },
      {
        id: 'video-5',
        name: 'Share Video',
        description: 'User shares the video with others',
        interactionType: 'shares_ios',
        contentType: 'video',
        contentLocation: 'portal',
        contentId: 'video-engagement-001',
        delay: 2000,
        icon: Share
      }
    ]
  }
];

export const UserJourneySimulator: React.FC = () => {
  const { trackInteraction } = useCIS();

  const [selectedTemplate, setSelectedTemplate] = useState<JourneyTemplate | null>(null);
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completionStats, setCompletionStats] = useState({
    totalSteps: 0,
    completedSteps: 0,
    failedSteps: 0,
    totalDuration: 0
  });

  // Timer for elapsed time
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const startJourney = useCallback(async (template: JourneyTemplate) => {
    setSelectedTemplate(template);
    setJourneySteps(template.steps.map(step => ({ ...step, status: 'pending' as const })));
    setCurrentStepIndex(-1);
    setIsRunning(true);
    setStartTime(new Date());
    setElapsedTime(0);
    setCompletionStats({
      totalSteps: template.steps.length,
      completedSteps: 0,
      failedSteps: 0,
      totalDuration: 0
    });
  }, []);

  const executeStep = useCallback(async (step: JourneyStep) => {
    try {
      setJourneySteps(prev =>
        prev.map(s => s.id === step.id ? { ...s, status: 'active' } : s)
      );

      await trackInteraction(
        step.contentId,
        step.contentType,
        step.contentLocation,
        step.interactionType
      );

      setJourneySteps(prev =>
        prev.map(s => s.id === step.id ? { ...s, status: 'completed' } : s)
      );

      setCompletionStats(prev => ({
        ...prev,
        completedSteps: prev.completedSteps + 1
      }));

    } catch (error: any) {
      setJourneySteps(prev =>
        prev.map(s => s.id === step.id ? {
          ...s,
          status: 'error',
          error: error.message
        } : s)
      );

      setCompletionStats(prev => ({
        ...prev,
        failedSteps: prev.failedSteps + 1
      }));
    }
  }, [trackInteraction]);

  const runJourney = useCallback(async () => {
    if (!selectedTemplate) return;

    for (let i = 0; i < journeySteps.length; i++) {
      setCurrentStepIndex(i);
      const step = journeySteps[i];

      await executeStep(step);

      // Wait for the specified delay before next step
      if (i < journeySteps.length - 1) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }
    }

    // Journey completed
    setIsRunning(false);
    setCurrentStepIndex(-1);
    setCompletionStats(prev => ({
      ...prev,
      totalDuration: elapsedTime
    }));
  }, [selectedTemplate, journeySteps, executeStep, elapsedTime]);

  const stopJourney = () => {
    setIsRunning(false);
    setCurrentStepIndex(-1);
  };

  const resetJourney = () => {
    setSelectedTemplate(null);
    setJourneySteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);
    setCompletionStats({
      totalSteps: 0,
      completedSteps: 0,
      failedSteps: 0,
      totalDuration: 0
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Journey Simulator</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Simulate complete user interaction flows with realistic timing
          </p>
        </div>
        {isRunning && (
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Elapsed: {formatTime(elapsedTime)}
            </div>
            <button
              onClick={stopJourney}
              className="btn-error"
            >
              Stop Journey
            </button>
          </div>
        )}
      </div>

      {/* Journey Templates */}
      {!selectedTemplate && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {JOURNEY_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => startJourney(template)}
            >
              <div className="flex items-center space-x-3 mb-4">
                                 <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                   <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                 </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {template.estimatedDuration}s estimated
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {template.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {template.steps.length} steps
                </span>
                <button className="btn-primary">
                  Start Journey
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Journey Progress */}
      {selectedTemplate && (
        <div className="space-y-6">
          {/* Journey Header */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedTemplate.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedTemplate.description}
                </p>
              </div>
              <button
                onClick={resetJourney}
                className="btn-secondary"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </button>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {completionStats.completedSteps}/{completionStats.totalSteps}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-error-600">
                  {completionStats.failedSteps}
                </div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-gray-500">Elapsed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">
                  {selectedTemplate.estimatedDuration}s
                </div>
                <div className="text-sm text-gray-500">Estimated</div>
              </div>
            </div>

            {/* Start Button */}
            {!isRunning && (
              <div className="mt-4 text-center">
                <button
                  onClick={runJourney}
                  className="btn-primary text-lg px-8 py-3"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Journey Simulation
                </button>
              </div>
            )}
          </div>

          {/* Journey Steps */}
          <div className="space-y-3">
            {journeySteps.map((step, index) => (
              <div
                key={step.id}
                className={`
                  card transition-all duration-300
                                     ${currentStepIndex === index && isRunning ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                                     ${step.status === 'completed' ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : ''}
                   ${step.status === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : ''}
                `}
              >
                <div className="flex items-center space-x-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {step.status === 'pending' && (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                    {step.status === 'active' && (
                      <div className="h-6 w-6 text-primary-500 animate-pulse">
                        <Clock className="h-6 w-6" />
                      </div>
                    )}
                    {step.status === 'completed' && (
                      <CheckCircle className="h-6 w-6 text-success-500" />
                    )}
                    {step.status === 'error' && (
                      <div className="h-6 w-6 text-error-500">
                        <Zap className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500">
                        Step {index + 1}
                      </span>
                      <step.icon className="h-4 w-4 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {step.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                    {step.error && (
                      <p className="text-sm text-error-600 mt-1">
                        Error: {step.error}
                      </p>
                    )}
                  </div>

                  {/* Step Details */}
                  <div className="text-right text-sm text-gray-500">
                    <div>{step.interactionType.replace(/_/g, ' ')}</div>
                    <div>{step.contentType}</div>
                    <div>{step.delay}ms delay</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};