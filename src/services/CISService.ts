import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type {
    CISInteraction,
    CISBatchInteraction,
    CISUserAnalytics,
    CISContentAnalytics,
    CISApiResponse,
    CISServiceConfig,
    InteractionType,
    ContentType,
    ContentLocation
} from '../types/cis';

export class CISService {
    private api: AxiosInstance;
    // Configuration is stored in retryAttempts and retryDelay
    private retryAttempts: number;
    private retryDelay: number;

    constructor(config: CISServiceConfig) {
        this.retryAttempts = config.retryAttempts || 3;
        this.retryDelay = config.retryDelay || 1000;

        this.api = axios.create({
            baseURL: config.baseUrl,
            headers: {
                'Authorization': `Bearer ${config.authToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });

        // Add request interceptor for logging
        this.api.interceptors.request.use(
            (config) => {
                console.log(`[CIS Service] ${config.method?.toUpperCase()} ${config.url}`, config.data);
                return config;
            },
            (error) => {
                console.error('[CIS Service] Request error:', error);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for logging
        this.api.interceptors.response.use(
            (response) => {
                console.log(`[CIS Service] Response ${response.status} ${response.config.url}`, response.data);
                return response;
            },
            (error) => {
                console.error('[CIS Service] Response error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    private async retryRequest<T>(
        requestFn: () => Promise<AxiosResponse<T>>,
        attempt: number = 1
    ): Promise<AxiosResponse<T>> {
        try {
            return await requestFn();
        } catch (error: any) {
            if (attempt < this.retryAttempts && this.shouldRetry(error)) {
                console.log(`[CIS Service] Retrying request (attempt ${attempt + 1}/${this.retryAttempts})`);
                await this.delay(this.retryDelay * attempt);
                return this.retryRequest(requestFn, attempt + 1);
            }
            throw error;
        }
    }

    private shouldRetry(error: any): boolean {
        // Retry on network errors or 5xx server errors
        return !error.response || (error.response.status >= 500 && error.response.status < 600);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private createInteraction(
        contentId: string,
        contentType: ContentType,
        contentLocation: ContentLocation,
        interactionType: InteractionType,
        dwellTime?: number,
        metadata?: Record<string, any>
    ): CISInteraction {
        return {
            content_id: contentId,
            content_type: contentType,
            content_location: contentLocation,
            interaction_type: interactionType,
            timestamp: new Date().toISOString(),
            dwell_time: dwellTime,
            metadata,
        };
    }

    async trackInteraction(
        contentId: string,
        contentType: ContentType,
        contentLocation: ContentLocation,
        interactionType: InteractionType,
        dwellTime?: number,
        metadata?: Record<string, any>
    ): Promise<CISApiResponse<CISInteraction>> {
        const interaction = this.createInteraction(
            contentId,
            contentType,
            contentLocation,
            interactionType,
            dwellTime,
            metadata
        );

        try {
            const response = await this.retryRequest(() =>
                this.api.post<CISApiResponse<CISInteraction>>('/cis/interactions', interaction)
            );
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error occurred',
            };
        }
    }

    async trackBatchInteractions(interactions: CISInteraction[]): Promise<CISApiResponse<CISBatchInteraction>> {
        const batchData: CISBatchInteraction = { interactions };

        try {
            const response = await this.retryRequest(() =>
                this.api.post<CISApiResponse<CISBatchInteraction>>('/cis/interactions/batch', batchData)
            );
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error occurred',
            };
        }
    }

    async getUserAnalytics(): Promise<CISApiResponse<CISUserAnalytics>> {
        try {
            const response = await this.retryRequest(() =>
                this.api.get<CISApiResponse<CISUserAnalytics>>('/cis/interactions/my')
            );
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error occurred',
            };
        }
    }

    async getContentAnalytics(contentId: string): Promise<CISApiResponse<CISContentAnalytics>> {
        try {
            const response = await this.retryRequest(() =>
                this.api.get<CISApiResponse<CISContentAnalytics>>(`/cis/interactions/content/${contentId}`)
            );
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error occurred',
            };
        }
    }

    // Utility method to create multiple interactions for testing
    createTestInteractions(
        contentId: string,
        contentType: ContentType,
        contentLocation: ContentLocation,
        count: number = 10
    ): CISInteraction[] {
        const interactionTypes: InteractionType[] = [
            'opens', 'views', 'saves', 'opens_detail', 'opens_outbound_link_web',
            'opens_outbound_app', 'taps_call_cta', 'taps_directions_cta', 'starts_audio',
            'plays_entire_audio', 'shares_genie', 'shares_ios', 'takes_screenshot',
            'requests_reminder', 'asks_follow_up', 'repeat_views'
        ];

        const interactions: CISInteraction[] = [];
        const now = Date.now();

        for (let i = 0; i < count; i++) {
            const interactionType = interactionTypes[i % interactionTypes.length];
            const timestamp = new Date(now - (count - i) * 60000).toISOString(); // Spread over time

            interactions.push({
                content_id: contentId,
                content_type: contentType,
                content_location: contentLocation,
                interaction_type: interactionType,
                timestamp,
                dwell_time: Math.floor(Math.random() * 300) + 10, // Random dwell time 10-310 seconds
                metadata: {
                    test: true,
                    batch_index: i,
                },
            });
        }

        return interactions;
    }

    // Method to simulate network failures for testing
    async simulateNetworkFailure(): Promise<never> {
        throw new Error('Simulated network failure');
    }

    // Method to simulate rate limiting for testing
    async simulateRateLimit(): Promise<never> {
        const error: any = new Error('Rate limit exceeded');
        error.response = { status: 429, data: { error: 'Too many requests' } };
        throw error;
    }
}

// Create a singleton instance
export const cisService = new CISService({
    baseUrl: 'http://54.198.209.187',
    authToken: 'test-token',
    retryAttempts: 3,
    retryDelay: 1000,
});