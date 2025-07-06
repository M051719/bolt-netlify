import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { RefreshCw, Cloud, Github, Twitter } from 'lucide-react';

interface ApiResponse {
  success: boolean;
  status: number;
  data: any;
  error?: string;
}

export const ApiIntegrationDemo: React.FC = () => {
  const [apiType, setApiType] = useState<string>('github');
  const [endpoint, setEndpoint] = useState<string>('users/octocat');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [params, setParams] = useState<string>('{}');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Weather API specific state
  const [location, setLocation] = useState<string>('New York');
  const [weatherProvider, setWeatherProvider] = useState<string>('openweathermap');
  const [units, setUnits] = useState<string>('metric');
  const [forecast, setForecast] = useState<boolean>(false);
  const [weatherResponse, setWeatherResponse] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const handleGeneralApiCall = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      let parsedParams = {};
      try {
        parsedParams = JSON.parse(params);
      } catch (e) {
        setError('Invalid JSON in params field');
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('external-api-integration', {
        body: {
          apiType,
          endpoint: apiType === 'custom' ? '' : endpoint,
          customUrl: apiType === 'custom' ? customUrl : '',
          method: 'GET',
          params: parsedParams,
          storeResult: true
        }
      });
      
      if (error) throw error;
      setResponse(data);
    } catch (err) {
      console.error('API call failed:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleWeatherApiCall = async () => {
    setWeatherLoading(true);
    setWeatherError(null);
    setWeatherResponse(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('weather-api', {
        body: {
          location,
          provider: weatherProvider,
          units,
          forecast,
          store: true
        }
      });
      
      if (error) throw error;
      setWeatherResponse(data);
    } catch (err) {
      console.error('Weather API call failed:', err);
      setWeatherError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setWeatherLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">API Integration Demo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General API Integration */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Github className="w-6 h-6 text-gray-700 mr-2" />
            <h2 className="text-xl font-semibold">External API Integration</h2>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Type
              </label>
              <select
                value={apiType}
                onChange={(e) => setApiType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="github">GitHub</option>
                <option value="twitter">Twitter</option>
                <option value="news">News API</option>
                <option value="custom">Custom URL</option>
              </select>
            </div>
            
            {apiType === 'custom' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom URL
                </label>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://api.example.com/endpoint"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endpoint
                </label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="users/octocat"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parameters (JSON)
              </label>
              <textarea
                value={params}
                onChange={(e) => setParams(e.target.value)}
                rows={3}
                placeholder='{"param1": "value1", "param2": "value2"}'
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <button
              onClick={handleGeneralApiCall}
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Loading...
                </span>
              ) : (
                'Make API Call'
              )}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {response && (
            <div>
              <h3 className="text-lg font-medium mb-2">Response:</h3>
              <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-sm">{JSON.stringify(response, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
        
        {/* Weather API Integration */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Cloud className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Weather API</h2>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City name or coordinates"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider
              </label>
              <select
                value={weatherProvider}
                onChange={(e) => setWeatherProvider(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="openweathermap">OpenWeatherMap</option>
                <option value="weatherapi">WeatherAPI.com</option>
                <option value="visualcrossing">Visual Crossing</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Units
                </label>
                <select
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="metric">Metric (°C)</option>
                  <option value="imperial">Imperial (°F)</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="forecast"
                  checked={forecast}
                  onChange={(e) => setForecast(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="forecast" className="ml-2 block text-sm text-gray-700">
                  Include Forecast
                </label>
              </div>
            </div>
            
            <button
              onClick={handleWeatherApiCall}
              disabled={weatherLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {weatherLoading ? (
                <span className="flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Loading...
                </span>
              ) : (
                'Get Weather'
              )}
            </button>
          </div>
          
          {weatherError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {weatherError}
            </div>
          )}
          
          {weatherResponse && (
            <div>
              <h3 className="text-lg font-medium mb-2">Weather Data:</h3>
              <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                <pre className="text-sm">{JSON.stringify(weatherResponse, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};