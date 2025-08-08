import React, { useState, useEffect } from 'react';
import { useCIS } from '../hooks/useCIS';
import type { InteractionType, ContentType } from '../types/cis';
import {
  BarChart3,
  Clock,
  TrendingUp,
  RefreshCw,
  Filter,
  Activity,
  Users,
  Target,
  Zap
} from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, icon: Icon, color, subtitle, trend }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-green-600">{title}</p>
        <p className="text-2xl font-bold text-green-700">{value}</p>
        {subtitle && (
          <p className="text-xs text-green-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`h-4 w-4 mr-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color} text-white`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

interface InteractionChartProps {
  data: Record<string, number>;
  title: string;
  color: string;
}

const InteractionChart: React.FC<InteractionChartProps> = ({ data, title, color }) => {
  const maxValue = Math.max(...Object.values(data), 1);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-green-700 mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-green-600 capitalize">
              {key.replace(/_/g, ' ')}
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-green-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${color}`}
                  style={{ width: `${(value / maxValue) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-green-700 w-8 text-right">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnalyticsDashboard: React.FC = () => {
  const {
    userAnalytics,
    isLoading,
    error,
    refreshAnalytics,
    interactionHistory
  } = useCIS();

  const [selectedFilter, setSelectedFilter] = useState<'all' | InteractionType | ContentType>('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Auto-refresh timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    await refreshAnalytics();
    setLastRefresh(new Date());
  };

  const filteredHistory = interactionHistory.filter(entry => {
    if (selectedFilter === 'all') return true;
    return entry.interaction.interaction_type === selectedFilter ||
           entry.interaction.content_type === selectedFilter;
  });

  const recentInteractions = filteredHistory.slice(0, 10);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  if (isLoading && !userAnalytics) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 text-green-500 animate-spin mr-3" />
          <span className="text-lg text-green-600">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-green-700">Analytics Dashboard</h2>
          <p className="text-green-600">
            Real-time interaction analytics and insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-green-500">
            Last refresh: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn-primary flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      {userAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard
            title="Total Interactions"
            value={userAnalytics.total_interactions}
            icon={BarChart3}
            color="bg-blue-500"
            subtitle="All time"
            trend={{ value: 12, isPositive: true }}
          />
          <AnalyticsCard
            title="Unique Content"
            value={userAnalytics.unique_content_count}
            icon={Target}
            color="bg-green-500"
            subtitle="Different pieces"
          />
          <AnalyticsCard
            title="Avg Dwell Time"
            value={`${Math.round(userAnalytics.average_dwell_time)}s`}
            icon={Clock}
            color="bg-yellow-500"
            subtitle="Per interaction"
          />
          <AnalyticsCard
            title="Active Sessions"
            value={interactionHistory.filter(h => h.status === 'pending').length}
            icon={Users}
            color="bg-purple-500"
            subtitle="Currently tracking"
          />
        </div>
      )}

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interaction Types Chart */}
        {userAnalytics && (
          <InteractionChart
            data={userAnalytics.interactions_by_type}
            title="Interactions by Type"
            color="bg-blue-500"
          />
        )}

        {/* Content Types Chart */}
        {userAnalytics && (
          <InteractionChart
            data={userAnalytics.interactions_by_content_type}
            title="Interactions by Content Type"
            color="bg-green-500"
          />
        )}
      </div>

      {/* Recent Interactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-green-700">
            Recent Interactions
          </h3>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-green-500" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as any)}
              className="text-sm border border-green-200 rounded px-2 py-1 bg-white text-green-700"
            >
              <option value="all">All Types</option>
              <optgroup label="Interaction Types">
                <option value="opens">Opens</option>
                <option value="views">Views</option>
                <option value="saves">Saves</option>
                <option value="shares_genie">Shares (Genie)</option>
                <option value="shares_ios">Shares (iOS)</option>
              </optgroup>
              <optgroup label="Content Types">
                <option value="recommendation">Recommendation</option>
                <option value="location">Location</option>
                <option value="music">Music</option>
                <option value="video">Video</option>
                <option value="article">Article</option>
              </optgroup>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {recentInteractions.length === 0 ? (
            <div className="text-center py-8 text-green-500">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No interactions yet</p>
              <p className="text-sm">Start testing to see interactions here</p>
            </div>
          ) : (
            recentInteractions.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                    {entry.status}
                  </div>
                  <div>
                    <div className="font-medium text-green-700">
                      {entry.interaction.interaction_type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-green-500">
                      {entry.interaction.content_type} • {entry.interaction.content_id}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-500">
                    {formatTimeAgo(entry.timestamp)}
                  </div>
                  {entry.interaction.dwell_time && (
                    <div className="text-xs text-green-400">
                      {entry.interaction.dwell_time}s dwell
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {recentInteractions.length > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setSelectedFilter('all')}
              className="text-sm text-green-600 hover:text-green-700"
            >
              View all {interactionHistory.length} interactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};