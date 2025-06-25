import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ForeclosureFormData {
  // Contact Information
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  
  // Situation Questions
  situation_length: string;
  payment_difficulty_date: string;
  lender: string;
  payment_status: string;
  missed_payments: string;
  nod: string;
  property_type: string;
  relief_contacted: string;
  home_value: string;
  mortgage_balance: string;
  liens: string;
  
  // Problem Questions
  challenge: string;
  lender_issue: string;
  impact: string;
  options_narrowing: string;
  third_party_help: string;
  overwhelmed: string;
  
  // Implication Questions
  implication_credit: string;
  implication_loss: string;
  implication_stay_duration: string;
  legal_concerns: string;
  future_impact: string;
  financial_risk: string;
  
  // Need-Payoff Questions
  interested_solution: string;
  negotiation_help: string;
  sell_feelings: string;
  credit_importance: string;
  resolution_peace: string;
  open_options: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
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
    const formData: ForeclosureFormData = await req.json()

    // Prepare the data for insertion
    const responseData = {
      user_id: user.id,
      ...formData,
      missed_payments: formData.missed_payments ? parseInt(formData.missed_payments) : 0,
      payment_difficulty_date: formData.payment_difficulty_date || null,
    }

    // Insert the foreclosure response
    const { data, error } = await supabaseClient
      .from('foreclosure_responses')
      .insert([responseData])
      .select()
      .single()

    if (error) {
      throw error
    }

    // Send email notification (optional)
    try {
      await sendEmailNotification(formData, user.email || '')
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
      // Don't fail the entire request if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Foreclosure questionnaire submitted successfully',
        id: data.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing foreclosure form:', error)
    
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

async function sendEmailNotification(formData: ForeclosureFormData, userEmail: string) {
  // This is a placeholder for email notification
  // You can integrate with services like SendGrid, Mailgun, or Resend
  
  const emailBody = `
New Foreclosure Questionnaire Submission

Contact Information:
- Name: ${formData.contact_name || 'Not provided'}
- Email: ${formData.contact_email || userEmail}
- Phone: ${formData.contact_phone || 'Not provided'}

Situation Assessment:
- Time in home: ${formData.situation_length}
- Payment difficulty started: ${formData.payment_difficulty_date}
- Lender: ${formData.lender}
- Payment status: ${formData.payment_status}
- Missed payments: ${formData.missed_payments}
- Notice of Default: ${formData.nod}
- Property type: ${formData.property_type}
- Contacted lender for relief: ${formData.relief_contacted}
- Estimated home value: ${formData.home_value}
- Mortgage balance: ${formData.mortgage_balance}
- Second mortgages/liens: ${formData.liens}

Problem Identification:
- Biggest challenge: ${formData.challenge}
- Lender assistance difficulty: ${formData.lender_issue}
- Family impact: ${formData.impact}
- Options shrinking: ${formData.options_narrowing}
- Third party help: ${formData.third_party_help}
- Feeling overwhelmed: ${formData.overwhelmed}

Impact Analysis:
- Credit/housing concerns: ${formData.implication_credit}
- Impact of losing home: ${formData.implication_loss}
- Time remaining in home: ${formData.implication_stay_duration}
- Legal concerns: ${formData.legal_concerns}
- Future housing impact: ${formData.future_impact}
- Financial security concerns: ${formData.financial_risk}

Solution Planning:
- Interested in solution: ${formData.interested_solution}
- Want negotiation help: ${formData.negotiation_help}
- Feelings about selling: ${formData.sell_feelings}
- Credit importance: ${formData.credit_importance}
- Peace of mind from resolution: ${formData.resolution_peace}
- Open to options: ${formData.open_options}
  `

  console.log('Email notification would be sent:', emailBody)
  
  // TODO: Implement actual email sending
  // Example with Resend:
  // const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
  // await resend.emails.send({
  //   from: 'noreply@repmotivatedseller.org',
  //   to: 'admin@repmotivatedseller.org',
  //   subject: 'New Foreclosure Questionnaire Submission',
  //   text: emailBody,
  // })
}