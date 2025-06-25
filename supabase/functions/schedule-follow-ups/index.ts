import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Get submissions that need follow-up reminders
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    // Find submissions that need reminders
    const { data: submissions, error } = await supabaseClient
      .from('foreclosure_responses')
      .select('*')
      .in('status', ['submitted', 'reviewed'])
      .or(`created_at.eq.${oneDayAgo.toISOString().split('T')[0]},created_at.eq.${threeDaysAgo.toISOString().split('T')[0]},created_at.eq.${sevenDaysAgo.toISOString().split('T')[0]},created_at.eq.${fourteenDaysAgo.toISOString().split('T')[0]}`)

    if (error) throw error

    const reminders = []

    for (const submission of submissions || []) {
      const submissionDate = new Date(submission.created_at)
      const daysSince = Math.floor((now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24))

      if ([1, 3, 7, 14].includes(daysSince)) {
        // Send follow-up reminder
        await supabaseClient.functions.invoke('send-notification-email', {
          body: {
            submissionId: submission.id,
            type: 'follow_up_reminder',
            customData: { daysSince }
          }
        })

        reminders.push({
          submissionId: submission.id,
          clientName: submission.contact_name,
          daysSince
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${reminders.length} follow-up reminders`,
        reminders 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing follow-up reminders:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})