import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailNotificationData {
  submissionId: string;
  type: 'new_submission' | 'status_update' | 'urgent_case';
  recipientEmail?: string;
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

    const { submissionId, type, recipientEmail }: EmailNotificationData = await req.json()

    // Fetch submission details
    const { data: submission, error } = await supabaseClient
      .from('foreclosure_responses')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (error || !submission) {
      throw new Error('Submission not found')
    }

    // Send email based on type
    switch (type) {
      case 'new_submission':
        await sendNewSubmissionEmail(submission)
        break
      case 'status_update':
        await sendStatusUpdateEmail(submission, recipientEmail)
        break
      case 'urgent_case':
        await sendUrgentCaseEmail(submission)
        break
    }

    // Log to CRM (optional integration)
    await logToCRM(submission, type)

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function sendNewSubmissionEmail(submission: any) {
  const urgencyLevel = getUrgencyLevel(submission)
  const subject = urgencyLevel === 'high' 
    ? `🚨 URGENT: New Foreclosure Submission - ${submission.contact_name}`
    : `📋 New Foreclosure Submission - ${submission.contact_name}`

  const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Foreclosure Submission</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .urgency-high { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
    .urgency-medium { background: #fef3c7; border-left: 4px solid #d97706; padding: 15px; margin: 15px 0; }
    .urgency-low { background: #d1fae5; border-left: 4px solid #059669; padding: 15px; margin: 15px 0; }
    .section { margin: 20px 0; }
    .label { font-weight: bold; color: #374151; }
    .value { margin-left: 10px; }
    .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏠 New Foreclosure Submission</h1>
      <p>RepMotivatedSeller - Admin Notification</p>
    </div>
    
    <div class="content">
      <div class="urgency-${urgencyLevel}">
        <strong>Priority Level: ${urgencyLevel.toUpperCase()}</strong>
        ${urgencyLevel === 'high' ? '<br>⚠️ Immediate attention required - NOD received or 3+ missed payments' : ''}
        ${urgencyLevel === 'medium' ? '<br>📅 Follow up within 24 hours - 1-2 missed payments' : ''}
        ${urgencyLevel === 'low' ? '<br>✅ Standard follow-up timeline' : ''}
      </div>

      <div class="section">
        <h3>📞 Contact Information</h3>
        <p><span class="label">Name:</span><span class="value">${submission.contact_name || 'Not provided'}</span></p>
        <p><span class="label">Email:</span><span class="value">${submission.contact_email || 'Not provided'}</span></p>
        <p><span class="label">Phone:</span><span class="value">${submission.contact_phone || 'Not provided'}</span></p>
      </div>

      <div class="section">
        <h3>💰 Financial Summary</h3>
        <p><span class="label">Home Value:</span><span class="value">${submission.home_value || 'Not provided'}</span></p>
        <p><span class="label">Mortgage Balance:</span><span class="value">${submission.mortgage_balance || 'Not provided'}</span></p>
        <p><span class="label">Lender:</span><span class="value">${submission.lender || 'Not provided'}</span></p>
        <p><span class="label">Missed Payments:</span><span class="value">${submission.missed_payments || 0}</span></p>
        <p><span class="label">Notice of Default:</span><span class="value">${submission.nod === 'yes' ? 'YES' : 'No'}</span></p>
      </div>

      <div class="section">
        <h3>🏡 Property Details</h3>
        <p><span class="label">Property Type:</span><span class="value">${submission.property_type || 'Not specified'}</span></p>
        <p><span class="label">Time in Home:</span><span class="value">${submission.situation_length || 'Not provided'}</span></p>
        <p><span class="label">Payment Difficulty Started:</span><span class="value">${submission.payment_difficulty_date || 'Not provided'}</span></p>
      </div>

      <div class="section">
        <h3>📝 Main Challenge</h3>
        <p>${submission.challenge || 'Not provided'}</p>
      </div>

      <div class="section">
        <h3>💭 Family Impact</h3>
        <p>${submission.impact || 'Not provided'}</p>
      </div>

      <a href="${Deno.env.get('SITE_URL')}/admin" class="button">
        View in Admin Dashboard
      </a>

      <div class="section" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        <p>Submitted: ${new Date(submission.created_at).toLocaleString()}</p>
        <p>Submission ID: ${submission.id}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `

  await sendEmail({
    to: Deno.env.get('ADMIN_EMAIL') || 'admin@repmotivatedseller.org',
    subject,
    html: emailBody
  })
}

async function sendStatusUpdateEmail(submission: any, recipientEmail?: string) {
  const email = recipientEmail || submission.contact_email
  if (!email) return

  const statusMessages = {
    reviewed: 'Your submission has been reviewed by our team.',
    contacted: 'We have attempted to contact you regarding your foreclosure situation.',
    closed: 'Your case has been resolved. Thank you for working with us.'
  }

  const subject = `Update on Your Foreclosure Assistance Request`
  const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Status Update</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .status-update { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; }
    .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Status Update</h1>
      <p>RepMotivatedSeller - Foreclosure Assistance</p>
    </div>
    
    <div class="content">
      <p>Dear ${submission.contact_name || 'Valued Client'},</p>
      
      <div class="status-update">
        <strong>Status: ${submission.status.toUpperCase()}</strong><br>
        ${statusMessages[submission.status as keyof typeof statusMessages] || 'Your submission status has been updated.'}
      </div>

      ${submission.notes ? `
      <div style="margin: 20px 0;">
        <h3>📝 Notes from our team:</h3>
        <p>${submission.notes}</p>
      </div>
      ` : ''}

      <p>If you have any questions or need immediate assistance, please don't hesitate to contact us:</p>
      
      <ul>
        <li>📞 Phone: (555) 123-4567</li>
        <li>📧 Email: help@repmotivatedseller.org</li>
      </ul>

      <p>We're here to help you through this challenging time.</p>
      
      <p>Best regards,<br>
      The RepMotivatedSeller Team</p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        <p>This is an automated message regarding your foreclosure assistance request.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `

  await sendEmail({
    to: email,
    subject,
    html: emailBody
  })
}

async function sendUrgentCaseEmail(submission: any) {
  const subject = `🚨 URGENT: High Priority Foreclosure Case - ${submission.contact_name}`
  const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Urgent Foreclosure Case</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .urgent { background: #fee2e2; border: 2px solid #dc2626; padding: 20px; margin: 15px 0; border-radius: 8px; }
    .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 URGENT FORECLOSURE CASE</h1>
      <p>Immediate Action Required</p>
    </div>
    
    <div class="content">
      <div class="urgent">
        <h2>⚠️ HIGH PRIORITY CASE</h2>
        <p><strong>Client:</strong> ${submission.contact_name}</p>
        <p><strong>Contact:</strong> ${submission.contact_phone || submission.contact_email}</p>
        <p><strong>Missed Payments:</strong> ${submission.missed_payments}</p>
        <p><strong>Notice of Default:</strong> ${submission.nod === 'yes' ? 'YES' : 'No'}</p>
        
        <h3>🔥 Urgency Indicators:</h3>
        <ul>
          ${submission.missed_payments >= 3 ? '<li>3+ missed payments</li>' : ''}
          ${submission.nod === 'yes' ? '<li>Notice of Default received</li>' : ''}
          ${submission.overwhelmed === 'yes' ? '<li>Client feeling overwhelmed</li>' : ''}
        </ul>
      </div>

      <p><strong>Recommended Actions:</strong></p>
      <ol>
        <li>Contact client within 2 hours</li>
        <li>Schedule immediate consultation</li>
        <li>Review all available options</li>
        <li>Escalate to senior team member if needed</li>
      </ol>

      <a href="${Deno.env.get('SITE_URL')}/admin" class="button">
        View Full Details in Admin Dashboard
      </a>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        <p>This urgent notification was triggered automatically based on submission criteria.</p>
        <p>Submitted: ${new Date(submission.created_at).toLocaleString()}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `

  // Send to multiple recipients for urgent cases
  const urgentRecipients = [
    Deno.env.get('ADMIN_EMAIL') || 'admin@repmotivatedseller.org',
    Deno.env.get('URGENT_EMAIL') || 'urgent@repmotivatedseller.org'
  ]

  for (const recipient of urgentRecipients) {
    await sendEmail({
      to: recipient,
      subject,
      html: emailBody
    })
  }
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // Using Resend as the email service (you can replace with SendGrid, Mailgun, etc.)
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  
  if (!resendApiKey) {
    console.log('No email service configured. Email would be sent to:', to)
    console.log('Subject:', subject)
    return
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RepMotivatedSeller <noreply@repmotivatedseller.org>',
        to: [to],
        subject,
        html,
      }),
    })

    if (!response.ok) {
      throw new Error(`Email service error: ${response.statusText}`)
    }

    console.log('Email sent successfully to:', to)
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

async function logToCRM(submission: any, eventType: string) {
  // Example CRM integration (replace with your CRM API)
  const crmApiKey = Deno.env.get('CRM_API_KEY')
  const crmApiUrl = Deno.env.get('CRM_API_URL')
  
  if (!crmApiKey || !crmApiUrl) {
    console.log('No CRM configured. Would log:', { submission: submission.id, eventType })
    return
  }

  try {
    // Example: HubSpot integration
    const crmData = {
      properties: {
        email: submission.contact_email,
        firstname: submission.contact_name?.split(' ')[0],
        lastname: submission.contact_name?.split(' ').slice(1).join(' '),
        phone: submission.contact_phone,
        foreclosure_status: submission.status,
        home_value: submission.home_value,
        mortgage_balance: submission.mortgage_balance,
        missed_payments: submission.missed_payments,
        lender: submission.lender,
        submission_date: submission.created_at,
        urgency_level: getUrgencyLevel(submission),
        lead_source: 'Foreclosure Questionnaire'
      }
    }

    const response = await fetch(`${crmApiUrl}/contacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${crmApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(crmData),
    })

    if (response.ok) {
      console.log('Successfully logged to CRM:', submission.id)
    } else {
      console.error('CRM logging failed:', response.statusText)
    }
  } catch (error) {
    console.error('CRM integration error:', error)
  }
}

function getUrgencyLevel(submission: any): 'high' | 'medium' | 'low' {
  const missedPayments = submission.missed_payments || 0
  const hasNOD = submission.nod === 'yes'
  
  if (hasNOD || missedPayments >= 3) return 'high'
  if (missedPayments >= 1) return 'medium'
  return 'low'
}