import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface VoiceUsageRequest {
  text_length: number;
  voice: string;
  model: string;
  tier?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    // Create Supabase client with auth context from request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Parse request body
    const { text_length, voice, model, tier = 'free' }: VoiceUsageRequest = await req.json();

    // Validate required fields
    if (!text_length || !voice || !model) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text_length, voice, model' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate tier value
    if (!['free', 'pro', 'enterprise'].includes(tier)) {
      return new Response(
        JSON.stringify({ error: 'Invalid tier value. Must be one of: free, pro, enterprise' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Log voice usage to database
    const { data, error: insertError } = await supabaseClient
      .from('voice_usage')
      .insert([
        {
          user_id: user.id,
          text_length,
          voice,
          model,
          tier
        }
      ]);

    if (insertError) {
      console.error('Error logging voice usage:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to log voice usage', details: insertError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get user's current usage statistics
    const { data: usageStats, error: usageError } = await supabaseClient
      .from('voice_usage')
      .select('text_length')
      .eq('user_id', user.id)
      .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString());

    if (usageError) {
      console.error('Error fetching usage statistics:', usageError);
    }

    // Calculate total usage in the last 30 days
    const totalUsage = usageStats?.reduce((sum, record) => sum + record.text_length, 0) || 0;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Voice usage logged successfully',
        usage: {
          current: text_length,
          total_30_days: totalUsage,
          tier
        }
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    console.error('Error processing voice usage request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});