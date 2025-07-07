import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ApiLimitCheckRequest {
  apiType: string;
  requestSize?: number;
}

interface ApiLimitResponse {
  allowed: boolean;
  currentUsage: {
    daily: number;
    monthly: number;
  };
  limits: {
    daily: number;
    monthly: number;
    maxRequestSize: number;
  };
  remaining: {
    daily: number;
    monthly: number;
  };
  message?: string;
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
    const { apiType, requestSize = 0 }: ApiLimitCheckRequest = await req.json()

    // Validate input
    if (!apiType) {
      throw new Error('API type is required')
    }

    // Get user's membership tier
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('membership_tier')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      throw new Error('Could not determine user membership tier')
    }

    const userTier = profile?.membership_tier || 'free'

    // Get API limits for the user's tier
    const { data: limits, error: limitsError } = await supabaseClient
      .from('api_usage_limits')
      .select('daily_limit, monthly_limit, max_request_size')
      .eq('api_type', apiType)
      .eq('tier', userTier)
      .single()

    if (limitsError) {
      console.error('Error fetching API limits:', limitsError)
      throw new Error(`No limits found for API type: ${apiType}`)
    }

    // Get current date
    const today = new Date().toISOString().split('T')[0]
    const firstDayOfMonth = new Date().toISOString().split('T')[0].substring(0, 8) + '01'

    // Get daily usage
    const { data: dailyUsage, error: dailyError } = await supabaseClient
      .from('daily_api_usage')
      .select('usage_count, total_characters')
      .eq('user_id', user.id)
      .eq('api_type', apiType)
      .eq('usage_date', today)
      .single()

    // Get monthly usage
    const { data: monthlyUsage, error: monthlyError } = await supabaseClient
      .rpc('get_monthly_api_usage', { 
        p_user_id: user.id, 
        p_api_type: apiType,
        p_start_date: firstDayOfMonth
      })

    // Calculate current usage
    const currentDailyUsage = dailyUsage?.total_characters || 0
    const currentMonthlyUsage = monthlyUsage || 0

    // Check if request exceeds limits
    const dailyRemaining = limits.daily_limit - currentDailyUsage
    const monthlyRemaining = limits.monthly_limit - currentMonthlyUsage
    const isRequestSizeAllowed = requestSize <= limits.max_request_size
    const isDailyLimitExceeded = requestSize > dailyRemaining
    const isMonthlyLimitExceeded = requestSize > monthlyRemaining

    // Prepare response
    const response: ApiLimitResponse = {
      allowed: isRequestSizeAllowed && !isDailyLimitExceeded && !isMonthlyLimitExceeded,
      currentUsage: {
        daily: currentDailyUsage,
        monthly: currentMonthlyUsage
      },
      limits: {
        daily: limits.daily_limit,
        monthly: limits.monthly_limit,
        maxRequestSize: limits.max_request_size
      },
      remaining: {
        daily: dailyRemaining,
        monthly: monthlyRemaining
      }
    }

    // Add message if not allowed
    if (!response.allowed) {
      if (!isRequestSizeAllowed) {
        response.message = `Request size (${requestSize}) exceeds maximum allowed size (${limits.max_request_size}) for your ${userTier} tier.`
      } else if (isDailyLimitExceeded) {
        response.message = `Request would exceed your daily limit. Remaining: ${dailyRemaining} characters.`
      } else if (isMonthlyLimitExceeded) {
        response.message = `Request would exceed your monthly limit. Remaining: ${monthlyRemaining} characters.`
      }
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error checking API limits:', error)
    
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