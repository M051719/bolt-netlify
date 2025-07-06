import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Weather API providers
const WEATHER_PROVIDERS = {
  openweathermap: 'https://api.openweathermap.org/data/2.5',
  weatherapi: 'https://api.weatherapi.com/v1',
  visualcrossing: 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Parse request parameters
    const url = new URL(req.url);
    const provider = url.searchParams.get('provider') || 'openweathermap';
    const location = url.searchParams.get('location');
    const units = url.searchParams.get('units') || 'metric'; // metric, imperial
    const forecast = url.searchParams.get('forecast') === 'true';
    const days = url.searchParams.get('days') || '5';
    const storeResult = url.searchParams.get('store') === 'true';
    
    // Validate request
    if (!location) {
      return new Response(
        JSON.stringify({ error: 'Location parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!WEATHER_PROVIDERS[provider]) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid provider. Supported providers: ${Object.keys(WEATHER_PROVIDERS).join(', ')}` 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get API key from environment variables based on provider
    const apiKeyEnvVar = `${provider.toUpperCase()}_API_KEY`;
    const apiKey = Deno.env.get(apiKeyEnvVar);
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `API key for ${provider} not configured` }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Build the API URL based on the provider
    let apiUrl;
    let requestOptions: RequestInit = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    switch (provider) {
      case 'openweathermap':
        apiUrl = new URL(forecast ? 'forecast' : 'weather', WEATHER_PROVIDERS[provider]);
        apiUrl.searchParams.append('q', location);
        apiUrl.searchParams.append('units', units);
        apiUrl.searchParams.append('appid', apiKey);
        break;
        
      case 'weatherapi':
        apiUrl = new URL(forecast ? 'forecast.json' : 'current.json', WEATHER_PROVIDERS[provider]);
        apiUrl.searchParams.append('q', location);
        apiUrl.searchParams.append('days', days);
        apiUrl.searchParams.append('key', apiKey);
        break;
        
      case 'visualcrossing':
        // Visual Crossing uses a different URL structure
        apiUrl = new URL(`${location}`, WEATHER_PROVIDERS[provider]);
        apiUrl.searchParams.append('unitGroup', units === 'metric' ? 'metric' : 'us');
        apiUrl.searchParams.append('key', apiKey);
        apiUrl.searchParams.append('contentType', 'json');
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported weather provider' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
    }

    // Make the API request
    const response = await fetch(apiUrl.toString(), requestOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ 
          error: `Weather API error: ${response.status} ${response.statusText}`,
          details: errorText
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    const weatherData = await response.json();

    // Store result in database if requested
    if (storeResult) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        await supabaseClient.from('weather_queries').insert({
          location,
          provider,
          forecast: forecast,
          units,
          response_data: weatherData,
          queried_at: new Date().toISOString()
        });
      } catch (dbError) {
        console.error('Failed to store weather data:', dbError);
      }
    }

    // Process and standardize the response based on provider
    const processedData = processWeatherData(weatherData, provider, forecast);

    // Return the weather data
    return new Response(
      JSON.stringify({
        success: true,
        provider,
        location,
        units,
        forecast: forecast,
        data: processedData
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error in weather API function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

// Helper function to standardize weather data across different providers
function processWeatherData(data: any, provider: string, forecast: boolean): any {
  // This function normalizes data from different providers into a standard format
  // You can customize this based on your application's needs
  
  switch (provider) {
    case 'openweathermap':
      if (forecast) {
        return {
          location: {
            name: data.city?.name,
            country: data.city?.country,
            coordinates: data.city?.coord
          },
          current: data.list?.[0] ? {
            temp: data.list[0].main?.temp,
            feels_like: data.list[0].main?.feels_like,
            humidity: data.list[0].main?.humidity,
            wind_speed: data.list[0].wind?.speed,
            condition: {
              text: data.list[0].weather?.[0]?.description,
              icon: data.list[0].weather?.[0]?.icon
            }
          } : null,
          forecast: data.list?.map((item: any) => ({
            date: item.dt_txt,
            temp: item.main?.temp,
            feels_like: item.main?.feels_like,
            humidity: item.main?.humidity,
            wind_speed: item.wind?.speed,
            condition: {
              text: item.weather?.[0]?.description,
              icon: item.weather?.[0]?.icon
            }
          }))
        };
      } else {
        return {
          location: {
            name: data.name,
            country: data.sys?.country,
            coordinates: data.coord
          },
          current: {
            temp: data.main?.temp,
            feels_like: data.main?.feels_like,
            humidity: data.main?.humidity,
            wind_speed: data.wind?.speed,
            condition: {
              text: data.weather?.[0]?.description,
              icon: data.weather?.[0]?.icon
            }
          },
          forecast: null
        };
      }
      
    case 'weatherapi':
      return {
        location: data.location,
        current: data.current ? {
          temp: data.current.temp_c,
          feels_like: data.current.feelslike_c,
          humidity: data.current.humidity,
          wind_speed: data.current.wind_kph,
          condition: data.current.condition
        } : null,
        forecast: data.forecast?.forecastday?.map((day: any) => ({
          date: day.date,
          temp: {
            max: day.day?.maxtemp_c,
            min: day.day?.mintemp_c,
            avg: day.day?.avgtemp_c
          },
          condition: day.day?.condition,
          hourly: day.hour?.map((hour: any) => ({
            time: hour.time,
            temp: hour.temp_c,
            condition: hour.condition
          }))
        }))
      };
      
    case 'visualcrossing':
      return {
        location: {
          name: data.address,
          coordinates: {
            latitude: data.latitude,
            longitude: data.longitude
          }
        },
        current: data.currentConditions ? {
          temp: data.currentConditions.temp,
          feels_like: data.currentConditions.feelslike,
          humidity: data.currentConditions.humidity,
          wind_speed: data.currentConditions.windspeed,
          condition: {
            text: data.currentConditions.conditions,
            icon: data.currentConditions.icon
          }
        } : null,
        forecast: data.days?.map((day: any) => ({
          date: day.datetime,
          temp: {
            max: day.tempmax,
            min: day.tempmin
          },
          condition: {
            text: day.conditions,
            icon: day.icon
          },
          precipitation: day.precip,
          humidity: day.humidity
        }))
      };
      
    default:
      // Return the raw data if provider is not recognized
      return data;
  }
}