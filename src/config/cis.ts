// CIS Configuration for React App
export const CIS_CONFIG = {
    BASE_URL: '',
    ENDPOINTS: {
        SINGLE_INTERACTION: '/cis/interactions',
        BATCH_INTERACTIONS: '/cis/interactions/batch',
        USER_ANALYTICS: '/cis/interactions/me',
        CONTENT_ANALYTICS: '/cis/interactions/content'
    },
    AUTH_TOKEN: 'test-token',
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    BATCH_SIZE: 10,
    HEARTBEAT_INTERVAL: 30000,
    DWELL_TIME_UPDATE_INTERVAL: 5000
};

export const CONTENT_TYPES = {
    RECOMMENDATION: 'recommendation',
    MESSAGE: 'message',
    LOCATION: 'location',
    SHARE: 'share',
    MUSIC: 'music',
    VIDEO: 'video',
    PODCAST: 'podcast',
    ARTICLE: 'article',
    LLM_CHAT: 'llm_chat'
};

export const INTERACTION_TYPES = {
    OPENS: 'opens',
    VIEWS: 'views',
    SAVES: 'saves',
    OPENS_DETAIL: 'opens_detail',
    OPENS_OUTBOUND_LINK: 'opens_outbound_link',
    TAPS_CALL_CTA: 'taps_call_cta',
    TAPS_DIRECTIONS_CTA: 'taps_directions_cta',
    STARTS_AUDIO: 'starts_audio',
    PLAYS_ENTIRE_AUDIO: 'plays_entire_audio',
    SHARES: 'shares',
    TAKES_SCREENSHOT: 'takes_screenshot',
    REQUESTS_REMINDER: 'requests_reminder',
    ASKS_FOLLOWUP: 'asks_followup',
    REPEAT_VIEWS: 'repeat_views'
};

export const CONTENT_LOCATIONS = {
    PORTAL: 'portal',
    PROMPT: 'prompt',
    CHAT: 'chat',
    DIRECT_URL: 'direct_url'
};