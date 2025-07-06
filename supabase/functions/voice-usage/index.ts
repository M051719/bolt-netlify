import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface VoiceUsageRequest {
  text: string;
  voice: string;
  model: string;
  tier: 'free' | 'pro' | 'enterprise';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with user's JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Parse the request body
    const { text, voice, model, tier }: VoiceUsageRequest = await req.json()

    // Validate input
    if (!text || !voice || !model || !tier) {
      throw new Error('Missing required fields')
    }

    // Calculate text length
    const textLength = text.length

    // Log usage to database
    const { data, error } = await supabaseClient
      .from('voice_usage')
      .insert([
        {
          user_id: user.id,
          text_length: textLength,
          voice,
          model,
          tier
        }
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Voice usage logged successfully',
        usage: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error logging voice usage:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})