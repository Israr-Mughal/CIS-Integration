export interface CISInteraction {
    id?: string;
    user_id?: string;
    content_id: string;
    content_type: ContentType;
    content_location: ContentLocation;
    interaction_type: InteractionType;
    timestamp: string;
    dwell_time?: number;
    metadata?: Record<string, any>;
}

export interface CISBatchInteraction {
    interactions: CISInteraction[];
}

export interface CISUserAnalytics {
    total_interactions: number;
    unique_content_count: number;
    average_dwell_time: number;
    interactions_by_type: Record<InteractionType, number>;
    interactions_by_content_type: Record<ContentType, number>;
    recent_interactions: CISInteraction[];
}

export interface CISContentAnalytics {
    content_id: string;
    total_views: number;
    total_interactions: number;
    average_dwell_time: number;
    interactions_by_type: Record<InteractionType, number>;
    recent_interactions: CISInteraction[];
}

export type ContentType =
    | 'recommendation'
    | 'location'
    | 'music'
    | 'video'
    | 'podcast'
    | 'article'
    | 'share';

export type ContentLocation =
    | 'portal'
    | 'prompt'
    | 'chat'
    | 'direct_url';

export type InteractionType =
    | 'opens'
    | 'views'
    | 'saves'
    | 'opens_detail'
    | 'opens_outbound_link_web'
    | 'opens_outbound_app'
    | 'taps_call_cta'
    | 'taps_directions_cta'
    | 'starts_audio'
    | 'plays_entire_audio'
    | 'shares_genie'
    | 'shares_ios'
    | 'takes_screenshot'
    | 'requests_reminder'
    | 'asks_follow_up'
    | 'repeat_views';

export interface CISApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface CISServiceConfig {
    baseUrl: string;
    authToken: string;
    retryAttempts?: number;
    retryDelay?: number;
}

export interface DwellTimeTracker {
    contentId: string;
    startTime: number;
    endTime?: number;
    isActive: boolean;
    observer?: IntersectionObserver;
}

export interface InteractionHistory {
    id: string;
    interaction: CISInteraction;
    timestamp: string;
    status: 'success' | 'error' | 'pending';
    error?: string;
}