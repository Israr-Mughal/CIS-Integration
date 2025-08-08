import axios from "axios";
import { CIS_CONFIG } from "../config/cis";

const api = axios.create({
  baseURL: CIS_CONFIG.BASE_URL,
  headers: {
    Authorization: `Bearer ${CIS_CONFIG.AUTH_TOKEN}`,
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 CIS API Request: ${config.method?.toUpperCase()} ${config.url}`,
      config.data
    );
    return config;
  },
  (error) => {
    console.error("❌ CIS API Request Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(
      `✅ CIS API Response: ${response.status} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    console.error(
      "❌ CIS API Response Error:",
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

const retryRequest = async (requestFn, retries = CIS_CONFIG.RETRY_ATTEMPTS) => {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0 && (error.response?.status >= 500 || !error.response)) {
      console.log(`🔄 Retrying request... (${retries} attempts left)`);
      await new Promise((resolve) =>
        setTimeout(resolve, CIS_CONFIG.RETRY_DELAY)
      );
      return retryRequest(requestFn, retries - 1);
    }
    throw error;
  }
};

export const cisApi = {
  recordInteraction: async (data) => {
    return retryRequest(() =>
      api.post(CIS_CONFIG.ENDPOINTS.SINGLE_INTERACTION, data)
    );
  },

  recordBatchInteractions: async (interactions) => {
    return retryRequest(() =>
      api.post(CIS_CONFIG.ENDPOINTS.BATCH_INTERACTIONS, interactions)
    );
  },

  getUserAnalytics: async (params = {}) => {
    return retryRequest(() =>
      api.get(CIS_CONFIG.ENDPOINTS.USER_ANALYTICS, { params })
    );
  },

  getContentAnalytics: async (contentId, params = {}) => {
    return retryRequest(() =>
      api.get(`${CIS_CONFIG.ENDPOINTS.CONTENT_ANALYTICS}/${contentId}`, {
        params,
      })
    );
  },

  testConnection: async () => {
    try {
      const response = await api.get(CIS_CONFIG.ENDPOINTS.USER_ANALYTICS, {
        params: { limit: 1 },
        timeout: 5000,
      });
      return {
        success: true,
        message: "CIS API connection successful",
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || error.message,
        error: error,
      };
    }
  },

  getInteractionStats: async () => {
    try {
      const response = await api.get(CIS_CONFIG.ENDPOINTS.USER_ANALYTICS, {
        params: { limit: 1000 },
      });

      const interactions = response.data;
      const stats = {
        total: interactions.length,
        byType: {},
        byContent: {},
        recent: interactions.slice(0, 10),
      };

      interactions.forEach((interaction) => {
        stats.byType[interaction.interaction_type] =
          (stats.byType[interaction.interaction_type] || 0) + 1;
        stats.byContent[interaction.content_type] =
          (stats.byContent[interaction.content_type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error("Failed to get interaction stats:", error);
      throw error;
    }
  },
};

export const cisUtils = {
  createInteraction: (
    contentId,
    contentType,
    interactionType,
    options = {}
  ) => ({
    content_id: contentId,
    content_type: contentType,
    interaction_type: interactionType,
    content_location: options.contentLocation || "portal",
    dwell_time_ms: options.dwellTime || null,
    extra_data: options.extraData || null,
  }),

  createBatch: (interactions) => {
    if (interactions.length > CIS_CONFIG.BATCH_SIZE) {
      console.warn(
        `Batch size (${interactions.length}) exceeds limit (${CIS_CONFIG.BATCH_SIZE})`
      );
    }
    return interactions;
  },

  formatDwellTime: (ms) => {
    if (!ms) return "N/A";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  },

  getInteractionTypeName: (type) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  },
};

export default cisApi;
