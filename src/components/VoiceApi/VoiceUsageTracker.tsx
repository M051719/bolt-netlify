import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { BarChart3, Calendar, Clock, FileText, Mic, Volume2 } from 'lucide-react';

interface VoiceUsage {
  id: number;
  text_length: number;
  voice: string;
  model: string;
  tier: string;
  created_at: string;
}

interface UsageSummary {
  totalCharacters: number;
  totalRequests: number;
  averageLength: number;
  mostUsedVoice: string;
  mostUsedModel: string;
  usageByDay: Record<string, number>;
}

export const VoiceUsageTracker: React.FC = () => {
  const [usageData, setUsageData] = useState<VoiceUsage[]>([]);
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const { user } = useAuthStore();
  const [usageLimits, setUsageLimits] = useState<any>(null);

  useEffect(() => {
    fetchUsageData();
    fetchUsageLimits();
  }, [timeframe]);

  const fetchUsageData = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('voice_usage')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply timeframe filter
      if (timeframe !== 'all') {
        const date = new Date();
        if (timeframe === 'week') {
          date.setDate(date.getDate() - 7);
        } else if (timeframe === 'month') {
          date.setMonth(date.getMonth() - 1);
        }
        query = query.gte('created_at', date.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setUsageData(data || []);
      calculateSummary(data || []);
    } catch (error) {
      console.error('Error fetching voice usage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsageLimits = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-api-limits', {
        body: {
          apiType: 'voice',
          requestSize: 0
        }
      });
      
      if (error) throw error;
      setUsageLimits(data);
    } catch (error) {
      console.error('Error fetching usage limits:', error);
    }
  };

  const calculateSummary = (data: VoiceUsage[]) => {
    if (!data.length) {
      setSummary(null);
      return;
    }

    // Calculate total characters and requests
    const totalCharacters = data.reduce((sum, item) => sum + item.text_length, 0);
    const totalRequests = data.length;
    const averageLength = Math.round(totalCharacters / totalRequests);

    // Find most used voice and model
    const voiceCounts: Record<string, number> = {};
    const modelCounts: Record<string, number> = {};
    const usageByDay: Record<string, number> = {};

    data.forEach(item => {
      // Count voices
      voiceCounts[item.voice] = (voiceCounts[item.voice] || 0) + 1;
      
      // Count models
      modelCounts[item.model] = (modelCounts[item.model] || 0) + 1;
      
      // Group by day
      const day = new Date(item.created_at).toISOString().split('T')[0];
      usageByDay[day] = (usageByDay[day] || 0) + item.text_length;
    });

    const mostUsedVoice = Object.entries(voiceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const mostUsedModel = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    setSummary({
      totalCharacters,
      totalRequests,
      averageLength,
      mostUsedVoice,
      mostUsedModel,
      usageByDay
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading usage data...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Volume2 className="w-5 h-5 mr-2 text-blue-600" />
          Voice API Usage
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeframe === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {summary ? (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Characters</p>
                  <p className="text-2xl font-bold text-blue-900">{summary.totalCharacters.toLocaleString()}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">API Requests</p>
                  <p className="text-2xl font-bold text-green-900">{summary.totalRequests.toLocaleString()}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Avg. Length</p>
                  <p className="text-2xl font-bold text-purple-900">{summary.averageLength.toLocaleString()} chars</p>
                </div>
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Most Used Voice</h3>
              <div className="flex items-center">
                <Mic className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-lg font-semibold text-gray-900">{summary.mostUsedVoice}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Most Used Model</h3>
              <div className="flex items-center">
                <Volume2 className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-lg font-semibold text-gray-900">{summary.mostUsedModel}</span>
              </div>
            </div>
          </div>

          {/* Usage by Day Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Usage by Day
            </h3>
            <div className="h-40">
              {Object.entries(summary.usageByDay).length > 0 ? (
                <div className="flex items-end h-32 space-x-2">
                  {Object.entries(summary.usageByDay)
                    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                    .slice(-14) // Show last 14 days max
                    .map(([date, count]) => {
                      const maxValue = Math.max(...Object.values(summary.usageByDay));
                      const percentage = (count / maxValue) * 100;
                      return (
                        <div key={date} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-blue-500 rounded-t"
                            style={{ height: `${percentage}%` }}
                          ></div>
                          <div className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No daily usage data available
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center mb-6">
          <Volume2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No voice API usage data available for this timeframe.</p>
        </div>
      )}

      {/* Usage Limits */}
      {usageLimits && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Usage Limits ({user?.membershipTier} tier)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Daily Usage</span>
                  <span className="text-gray-600">
                    {usageLimits.currentUsage.daily.toLocaleString()} / {usageLimits.limits.daily.toLocaleString()} chars
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      usageLimits.currentUsage.daily / usageLimits.limits.daily > 0.9 
                        ? 'bg-red-600' 
                        : usageLimits.currentUsage.daily / usageLimits.limits.daily > 0.7
                        ? 'bg-yellow-600'
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(100, (usageLimits.currentUsage.daily / usageLimits.limits.daily) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {usageLimits.remaining.daily.toLocaleString()} characters remaining today
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Monthly Usage</span>
                  <span className="text-gray-600">
                    {usageLimits.currentUsage.monthly.toLocaleString()} / {usageLimits.limits.monthly.toLocaleString()} chars
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      usageLimits.currentUsage.monthly / usageLimits.limits.monthly > 0.9 
                        ? 'bg-red-600' 
                        : usageLimits.currentUsage.monthly / usageLimits.limits.monthly > 0.7
                        ? 'bg-yellow-600'
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(100, (usageLimits.currentUsage.monthly / usageLimits.limits.monthly) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {usageLimits.remaining.monthly.toLocaleString()} characters remaining this month
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Tier Limits</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Request Size:</span>
                  <span className="font-medium">{usageLimits.limits.maxRequestSize.toLocaleString()} chars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Limit:</span>
                  <span className="font-medium">{usageLimits.limits.daily.toLocaleString()} chars</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Limit:</span>
                  <span className="font-medium">{usageLimits.limits.monthly.toLocaleString()} chars</span>
                </div>
                {user?.membershipTier === 'free' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <a 
                      href="/pricing" 
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Upgrade for higher limits
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Usage</h3>
        
        {usageData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Characters</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usageData.map((usage) => (
                  <tr key={usage.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(usage.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {usage.text_length.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {usage.voice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {usage.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        usage.tier === 'free' 
                          ? 'bg-gray-100 text-gray-800' 
                          : usage.tier === 'pro'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {usage.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent voice API usage found.
          </div>
        )}
      </div>

      {user?.membershipTier === 'free' && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Clock className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-900">Free Tier Limitations</h4>
              <p className="text-yellow-800 text-sm mt-1">
                Free tier accounts are limited to 5,000 characters per day and standard voices only.
                Upgrade to Pro or Enterprise for higher limits and HD voice quality.
              </p>
              <a 
                href="/pricing" 
                className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View Pricing Plans →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};