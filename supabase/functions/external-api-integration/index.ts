import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Adjust this to your frontend domain in production
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', // Added GET for flexibility
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Define supported API endpoints
const SUPPORTED_APIS: { [key: string]: string } = {
  github: 'https://api.github.com',
  twitter: 'https://api.twitter.com/2',
  news: 'https://newsapi.org/v2',
  custom: '' // Will be provided in the request, or can be a default if needed
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Ensure only POST or GET requests are processed for API calls
    if (req.method !== 'POST' && req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const {
      apiType,
      endpoint,
      method = 'GET',
      params = {},
      headers = {},
      body = null,
      storeResult = false,
      customUrl = ''
    } = req.method === 'POST' ? await req.json() : Object.fromEntries(new URL(req.url).searchParams);

    // Validate request
    if (!apiType || (!SUPPORTED_APIS[apiType] && apiType !== 'custom')) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing API type. Supported types: ' + Object.keys(SUPPORTED_APIS).join(', ') + ', custom' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!endpoint && apiType !== 'custom') {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint parameter for non-custom API type' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (apiType === 'custom' && !customUrl) {
      return new Response(
        JSON.stringify({ error: 'customUrl is required for custom API type' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get API key from environment variables (use a generic name or specific per API)
    const apiKey = Deno.env.get('EXTERNAL_API_KEY'); // Example: Use a generic EXTERNAL_API_KEY
    // You might want to use specific keys like GITHUB_API_KEY, TWITTER_API_KEY etc.
    // const githubApiKey = Deno.env.get('GITHUB_API_KEY');

    // Prepare URL
    let baseUrl = SUPPORTED_APIS[apiType];
    if (apiType === 'custom') {
      baseUrl = customUrl;
    }

    // Build URL with query parameters
    const url = new URL(apiType === 'custom' ? customUrl : `${baseUrl}/${endpoint}`);

    // Add query parameters
    if (method === 'GET' && params) {
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
    }

    // Prepare headers
    const requestHeaders = new Headers({
      'Content-Type': 'application/json',
      ...headers
    });

    // Add API key if available (adjust based on how the external API expects it)
    if (apiKey) {
      requestHeaders.append('Authorization', `Bearer ${apiKey}`);
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined
    };

    // Make the API request
    const response = await fetch(url.toString(), requestOptions);
    const data = await response.json();

    // Store result in database if requested
    if (storeResult && response.ok) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL')!, // Correct environment variable name
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // Use service role key for server-side operations
        );

        await supabaseClient.from('api_responses').insert({
          api_type: apiType,
          endpoint: endpoint || customUrl,
          response_data: data,
          status_code: response.status,
          requested_at: new Date().toISOString()
        });
      } catch (dbError) {
        console.error('Failed to store API response:', dbError);
      }
    }

    // Return the API response
    return new Response(
      JSON.stringify({
        success: response.ok,
        status: response.status,
        data
      }),
      {
        status: response.ok ? 200 : response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  } catch (error) {
    console.error('Error in external-api-integration function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});