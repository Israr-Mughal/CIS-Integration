import { useState, useCallback, useRef, useEffect } from 'react';
import { cisService } from '../services/CISService';
import type {
  CISInteraction,
  InteractionType,
  ContentType,
  ContentLocation,
  DwellTimeTracker,
  InteractionHistory,
  CISUserAnalytics,
  CISContentAnalytics
} from '../types/cis';

interface UseCISOptions {
    autoRefreshAnalytics?: boolean;
    refreshInterval?: number;
    maxHistorySize?: number;
}

interface UseCISReturn {
    // Tracking functions
    trackInteraction: (
        contentId: string,
        contentType: ContentType,
        contentLocation: ContentLocation,
        interactionType: InteractionType,
        dwellTime?: number,
        metadata?: Record<string, any>
    ) => Promise<void>;

    trackBatchInteractions: (interactions: CISInteraction[]) => Promise<void>;

    // Dwell time tracking
    startDwellTracking: (contentId: string, elementRef: React.RefObject<HTMLElement>) => void;
    stopDwellTracking: (contentId: string) => void;
    getDwellTime: (contentId: string) => number;

    // Analytics
    userAnalytics: CISUserAnalytics | null;
    contentAnalytics: Record<string, CISContentAnalytics>;
    refreshAnalytics: () => Promise<void>;
    getContentAnalytics: (contentId: string) => Promise<void>;

    // State
    isTracking: boolean;
    isLoading: boolean;
    error: string | null;
    interactionHistory: InteractionHistory[];

    // Utility functions
    clearHistory: () => void;
    simulateNetworkFailure: () => Promise<void>;
    simulateRateLimit: () => Promise<void>;
}

export const useCIS = (options: UseCISOptions = {}): UseCISReturn => {
    const {
        autoRefreshAnalytics = true,
        refreshInterval = 5000,
        maxHistorySize = 100
    } = options;

    // State
    const [isTracking, setIsTracking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userAnalytics, setUserAnalytics] = useState<CISUserAnalytics | null>(null);
    const [contentAnalytics, setContentAnalytics] = useState<Record<string, CISContentAnalytics>>({});
    const [interactionHistory, setInteractionHistory] = useState<InteractionHistory[]>([]);

    // Refs
    const dwellTrackers = useRef<Map<string, DwellTimeTracker>>(new Map());
    const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Generate unique ID for history entries
    const generateHistoryId = useCallback(() => {
        return `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }, []);

    // Add interaction to history
    const addToHistory = useCallback((interaction: CISInteraction, status: 'success' | 'error' | 'pending', error?: string) => {
        const historyEntry: InteractionHistory = {
            id: generateHistoryId(),
            interaction,
            timestamp: new Date().toISOString(),
            status,
            error
        };

        setInteractionHistory(prev => {
            const newHistory = [historyEntry, ...prev];
            return newHistory.slice(0, maxHistorySize);
        });
    }, [generateHistoryId, maxHistorySize]);

    // Track single interaction
    const trackInteraction = useCallback(async (
        contentId: string,
        contentType: ContentType,
        contentLocation: ContentLocation,
        interactionType: InteractionType,
        dwellTime?: number,
        metadata?: Record<string, any>
    ) => {
        setIsTracking(true);
        setError(null);

        const interaction: CISInteraction = {
            content_id: contentId,
            content_type: contentType,
            content_location: contentLocation,
            interaction_type: interactionType,
            timestamp: new Date().toISOString(),
            dwell_time: dwellTime,
            metadata
        };

        // Add to history as pending
        addToHistory(interaction, 'pending');

        try {
            const response = await cisService.trackInteraction(
                contentId,
                contentType,
                contentLocation,
                interactionType,
                dwellTime,
                metadata
            );

            if (response.success) {
                addToHistory(interaction, 'success');
                console.log('[useCIS] Interaction tracked successfully:', interaction);
            } else {
                addToHistory(interaction, 'error', response.error);
                setError(response.error || 'Failed to track interaction');
                console.error('[useCIS] Failed to track interaction:', response.error);
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Unknown error occurred';
            addToHistory(interaction, 'error', errorMessage);
            setError(errorMessage);
            console.error('[useCIS] Error tracking interaction:', err);
        } finally {
            setIsTracking(false);
        }
    }, [addToHistory]);

    // Track batch interactions
    const trackBatchInteractions = useCallback(async (interactions: CISInteraction[]) => {
        setIsTracking(true);
        setError(null);
        setIsLoading(true);

        // Add all interactions to history as pending
        interactions.forEach(interaction => {
            addToHistory(interaction, 'pending');
        });

        try {
            const response = await cisService.trackBatchInteractions(interactions);

            if (response.success) {
                // Mark all interactions as successful
                interactions.forEach(interaction => {
                    addToHistory(interaction, 'success');
                });
                console.log('[useCIS] Batch interactions tracked successfully:', interactions.length);
            } else {
                // Mark all interactions as failed
                interactions.forEach(interaction => {
                    addToHistory(interaction, 'error', response.error);
                });
                setError(response.error || 'Failed to track batch interactions');
                console.error('[useCIS] Failed to track batch interactions:', response.error);
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Unknown error occurred';
            // Mark all interactions as failed
            interactions.forEach(interaction => {
                addToHistory(interaction, 'error', errorMessage);
            });
            setError(errorMessage);
            console.error('[useCIS] Error tracking batch interactions:', err);
        } finally {
            setIsTracking(false);
            setIsLoading(false);
        }
    }, [addToHistory]);

    // Start dwell time tracking
    const startDwellTracking = useCallback((contentId: string, elementRef: React.RefObject<HTMLElement>) => {
        if (!elementRef.current) return;

        // Stop existing tracking for this content
        stopDwellTracking(contentId);

        const tracker: DwellTimeTracker = {
            contentId,
            startTime: Date.now(),
            isActive: true
        };

        // Create intersection observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Content entered viewport
                        tracker.startTime = Date.now();
                        tracker.isActive = true;
                    } else {
                        // Content left viewport
                        if (tracker.isActive) {
                            tracker.endTime = Date.now();
                            tracker.isActive = false;

                            // Track dwell time interaction
                            const dwellTime = Math.floor((tracker.endTime - tracker.startTime) / 1000);
                            if (dwellTime > 0) {
                                trackInteraction(
                                    contentId,
                                    'recommendation', // Default content type
                                    'portal', // Default location
                                    'views',
                                    dwellTime,
                                    { dwell_tracking: true }
                                );
                            }
                        }
                    }
                });
            },
            { threshold: 0.5 } // Trigger when 50% of content is visible
        );

        observer.observe(elementRef.current);
        tracker.observer = observer;
        dwellTrackers.current.set(contentId, tracker);

        console.log('[useCIS] Started dwell tracking for content:', contentId);
    }, [trackInteraction]);

    // Stop dwell time tracking
    const stopDwellTracking = useCallback((contentId: string) => {
        const tracker = dwellTrackers.current.get(contentId);
        if (tracker) {
            if (tracker.observer) {
                tracker.observer.disconnect();
            }
            dwellTrackers.current.delete(contentId);
            console.log('[useCIS] Stopped dwell tracking for content:', contentId);
        }
    }, []);

    // Get dwell time for content
    const getDwellTime = useCallback((contentId: string): number => {
        const tracker = dwellTrackers.current.get(contentId);
        if (!tracker) return 0;

        if (tracker.isActive) {
            return Math.floor((Date.now() - tracker.startTime) / 1000);
        } else if (tracker.endTime) {
            return Math.floor((tracker.endTime - tracker.startTime) / 1000);
        }

        return 0;
    }, []);

    // Refresh analytics
    const refreshAnalytics = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await cisService.getUserAnalytics();
            if (response.success && response.data) {
                setUserAnalytics(response.data);
            } else {
                setError(response.error || 'Failed to fetch analytics');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch analytics');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Get content analytics
    const getContentAnalytics = useCallback(async (contentId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await cisService.getContentAnalytics(contentId);
            if (response.success && response.data) {
                setContentAnalytics(prev => ({
                    ...prev,
                    [contentId]: response.data!
                }));
            } else {
                setError(response.error || 'Failed to fetch content analytics');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch content analytics');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Clear history
    const clearHistory = useCallback(() => {
        setInteractionHistory([]);
    }, []);

    // Simulation functions
    const simulateNetworkFailure = useCallback(async () => {
        try {
            await cisService.simulateNetworkFailure();
        } catch (err: any) {
            setError(err.message);
        }
    }, []);

    const simulateRateLimit = useCallback(async () => {
        try {
            await cisService.simulateRateLimit();
        } catch (err: any) {
            setError(err.message);
        }
    }, []);

    // Auto-refresh analytics
    useEffect(() => {
        if (autoRefreshAnalytics) {
            refreshIntervalRef.current = setInterval(refreshAnalytics, refreshInterval);
            return () => {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
            };
        }
    }, [autoRefreshAnalytics, refreshInterval, refreshAnalytics]);

    // Initial analytics load
    useEffect(() => {
        refreshAnalytics();
    }, [refreshAnalytics]);

    // Cleanup dwell trackers on unmount
    useEffect(() => {
        return () => {
            dwellTrackers.current.forEach((tracker) => {
                if (tracker.observer) {
                    tracker.observer.disconnect();
                }
            });
            dwellTrackers.current.clear();
        };
    }, []);

    return {
        trackInteraction,
        trackBatchInteractions,
        startDwellTracking,
        stopDwellTracking,
        getDwellTime,
        userAnalytics,
        contentAnalytics,
        refreshAnalytics,
        getContentAnalytics,
        isTracking,
        isLoading,
        error,
        interactionHistory,
        clearHistory,
        simulateNetworkFailure,
        simulateRateLimit
    };
};