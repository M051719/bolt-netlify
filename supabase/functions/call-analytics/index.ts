import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'dashboard'

    switch (action) {
      case 'dashboard':
        return await getCallAnalyticsDashboard(supabaseClient)
      case 'call-details':
        const callId = url.searchParams.get('callId')
        return await getCallDetails(supabaseClient, callId)
      case 'intent-analysis':
        return await getIntentAnalysis(supabaseClient)
      case 'agent-performance':
        return await getAgentPerformance(supabaseClient)
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Error in call analytics:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function getCallAnalyticsDashboard(supabaseClient: any) {
  // Get call statistics
  const { data: callStats } = await supabaseClient
    .from('ai_calls')
    .select('call_status, priority_level, created_at, call_duration')

  // Get intent distribution
  const { data: intentStats } = await supabaseClient
    .from('call_intents')
    .select('intent_name, confidence_score, fulfilled')

  // Get handoff statistics
  const { data: handoffStats } = await supabaseClient
    .from('agent_handoffs')
    .select('reason, resolution_time, handoff_time')

  // Calculate metrics
  const totalCalls = callStats?.length || 0
  const completedCalls = callStats?.filter(call => call.call_status === 'completed').length || 0
  const transferredCalls = callStats?.filter(call => call.call_status === 'transferred').length || 0
  const avgDuration = callStats?.reduce((sum, call) => sum + (call.call_duration || 0), 0) / totalCalls || 0

  const today = new Date().toISOString().split('T')[0]
  const todayCalls = callStats?.filter(call => call.created_at.startsWith(today)).length || 0

  const urgentCalls = callStats?.filter(call => call.priority_level === 'urgent').length || 0
  const highPriorityCalls = callStats?.filter(call => call.priority_level === 'high').length || 0

  // Intent fulfillment rate
  const totalIntents = intentStats?.length || 0
  const fulfilledIntents = intentStats?.filter(intent => intent.fulfilled).length || 0
  const fulfillmentRate = totalIntents > 0 ? (fulfilledIntents / totalIntents) * 100 : 0

  // Most common intents
  const intentCounts = intentStats?.reduce((acc: any, intent) => {
    acc[intent.intent_name] = (acc[intent.intent_name] || 0) + 1
    return acc
  }, {}) || {}

  const topIntents = Object.entries(intentCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)

  // Handoff analysis
  const avgResolutionTime = handoffStats?.filter(h => h.resolution_time)
    .reduce((sum, handoff) => {
      const resolutionTime = new Date(handoff.resolution_time).getTime() - new Date(handoff.handoff_time).getTime()
      return sum + resolutionTime
    }, 0) / (handoffStats?.filter(h => h.resolution_time).length || 1) || 0

  const dashboard = {
    overview: {
      totalCalls,
      completedCalls,
      transferredCalls,
      todayCalls,
      urgentCalls,
      highPriorityCalls,
      avgDuration: Math.round(avgDuration),
      transferRate: totalCalls > 0 ? Math.round((transferredCalls / totalCalls) * 100) : 0
    },
    aiPerformance: {
      fulfillmentRate: Math.round(fulfillmentRate),
      topIntents,
      avgConfidence: intentStats?.reduce((sum, intent) => sum + intent.confidence_score, 0) / totalIntents || 0
    },
    handoffAnalysis: {
      totalHandoffs: handoffStats?.length || 0,
      avgResolutionTime: Math.round(avgResolutionTime / (1000 * 60)), // Convert to minutes
      commonReasons: getTopReasons(handoffStats || [])
    },
    recentCalls: callStats?.slice(0, 10) || []
  }

  return new Response(JSON.stringify(dashboard), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getCallDetails(supabaseClient: any, callId: string | null) {
  if (!callId) {
    return new Response(JSON.stringify({ error: 'Call ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Get call information
  const { data: call } = await supabaseClient
    .from('ai_calls')
    .select('*')
    .eq('id', callId)
    .single()

  // Get transcript
  const { data: transcript } = await supabaseClient
    .from('call_transcripts')
    .select('*')
    .eq('call_id', callId)
    .order('timestamp_offset')

  // Get intents
  const { data: intents } = await supabaseClient
    .from('call_intents')
    .select('*')
    .eq('call_id', callId)
    .order('created_at')

  // Get handoff information
  const { data: handoff } = await supabaseClient
    .from('agent_handoffs')
    .select('*')
    .eq('call_id', callId)
    .single()

  const callDetails = {
    call,
    transcript,
    intents,
    handoff
  }

  return new Response(JSON.stringify(callDetails), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getIntentAnalysis(supabaseClient: any) {
  const { data: intents } = await supabaseClient
    .from('call_intents')
    .select('intent_name, confidence_score, fulfilled, created_at')

  const analysis = {
    intentDistribution: getIntentDistribution(intents || []),
    confidenceAnalysis: getConfidenceAnalysis(intents || []),
    fulfillmentTrends: getFulfillmentTrends(intents || []),
    lowConfidenceIntents: (intents || []).filter((intent: any) => intent.confidence_score < 0.7)
  }

  return new Response(JSON.stringify(analysis), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getAgentPerformance(supabaseClient: any) {
  const { data: handoffs } = await supabaseClient
    .from('agent_handoffs')
    .select(`
      *,
      agent:agent_id(email, raw_user_meta_data)
    `)

  const performance = {
    agentStats: getAgentStats(handoffs || []),
    resolutionTimes: getResolutionTimes(handoffs || []),
    handoffReasons: getHandoffReasons(handoffs || [])
  }

  return new Response(JSON.stringify(performance), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

function getTopReasons(handoffs: any[]) {
  const reasons = handoffs.reduce((acc: any, handoff) => {
    acc[handoff.reason] = (acc[handoff.reason] || 0) + 1
    return acc
  }, {})

  return Object.entries(reasons)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
}

function getIntentDistribution(intents: any[]) {
  const distribution = intents.reduce((acc: any, intent) => {
    acc[intent.intent_name] = (acc[intent.intent_name] || 0) + 1
    return acc
  }, {})

  return Object.entries(distribution).map(([name, count]) => ({
    intent: name,
    count,
    percentage: Math.round((count as number / intents.length) * 100)
  }))
}

function getConfidenceAnalysis(intents: any[]) {
  const confidenceRanges = {
    high: intents.filter(i => i.confidence_score >= 0.8).length,
    medium: intents.filter(i => i.confidence_score >= 0.6 && i.confidence_score < 0.8).length,
    low: intents.filter(i => i.confidence_score < 0.6).length
  }

  return {
    ranges: confidenceRanges,
    average: intents.reduce((sum, intent) => sum + intent.confidence_score, 0) / intents.length
  }
}

function getFulfillmentTrends(intents: any[]) {
  // Group by date and calculate fulfillment rate
  const dailyStats = intents.reduce((acc: any, intent) => {
    const date = intent.created_at.split('T')[0]
    if (!acc[date]) {
      acc[date] = { total: 0, fulfilled: 0 }
    }
    acc[date].total++
    if (intent.fulfilled) acc[date].fulfilled++
    return acc
  }, {})

  return Object.entries(dailyStats).map(([date, stats]: [string, any]) => ({
    date,
    fulfillmentRate: Math.round((stats.fulfilled / stats.total) * 100),
    totalIntents: stats.total
  }))
}

function getAgentStats(handoffs: any[]) {
  const agentStats = handoffs.reduce((acc: any, handoff) => {
    const agentId = handoff.agent_id
    if (!acc[agentId]) {
      acc[agentId] = {
        handoffs: 0,
        totalResolutionTime: 0,
        resolvedCases: 0,
        agent: handoff.agent
      }
    }
    acc[agentId].handoffs++
    if (handoff.resolution_time) {
      acc[agentId].resolvedCases++
      const resolutionTime = new Date(handoff.resolution_time).getTime() - new Date(handoff.handoff_time).getTime()
      acc[agentId].totalResolutionTime += resolutionTime
    }
    return acc
  }, {})

  return Object.values(agentStats).map((stats: any) => ({
    ...stats,
    avgResolutionTime: stats.resolvedCases > 0 ? Math.round(stats.totalResolutionTime / stats.resolvedCases / (1000 * 60)) : 0,
    resolutionRate: Math.round((stats.resolvedCases / stats.handoffs) * 100)
  }))
}

function getResolutionTimes(handoffs: any[]) {
  return handoffs
    .filter(h => h.resolution_time)
    .map(handoff => {
      const resolutionTime = new Date(handoff.resolution_time).getTime() - new Date(handoff.handoff_time).getTime()
      return {
        handoffId: handoff.id,
        resolutionTimeMinutes: Math.round(resolutionTime / (1000 * 60)),
        reason: handoff.reason
      }
    })
}

function getHandoffReasons(handoffs: any[]) {
  const reasons = handoffs.reduce((acc: any, handoff) => {
    acc[handoff.reason] = (acc[handoff.reason] || 0) + 1
    return acc
  }, {})

  return Object.entries(reasons)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .map(([reason, count]) => ({ reason, count }))
}