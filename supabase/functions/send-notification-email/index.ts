import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailNotificationData {
  submissionId: string;
  type: 'new_submission' | 'status_update' | 'urgent_case' | 'follow_up_reminder' | 'welcome_sequence';
  recipientEmail?: string;
  customData?: any;
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

    const { submissionId, type, recipientEmail, customData }: EmailNotificationData = await req.json()

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
        await addToMailerLiteList(submission, 'new_leads')
        break
      case 'status_update':
        await sendStatusUpdateEmail(submission, recipientEmail)
        break
      case 'urgent_case':
        await sendUrgentCaseEmail(submission)
        await addToMailerLiteList(submission, 'urgent_cases')
        break
      case 'follow_up_reminder':
        await sendFollowUpReminder(submission, customData)
        break
      case 'welcome_sequence':
        await triggerWelcomeSequence(submission)
        break
    }

    // Log to CRM
    await logToCRM(submission, type, customData)

    // Schedule follow-up reminders
    await scheduleFollowUpReminders(submission)

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

  const emailBody = generateNewSubmissionEmailTemplate(submission, urgencyLevel)

  await sendMailerLiteEmail({
    to: Deno.env.get('ADMIN_EMAIL') || 'admin@repmotivatedseller.org',
    subject,
    html: emailBody,
    tags: ['admin_notification', `priority_${urgencyLevel}`]
  })

  // Send copy to urgent email if high priority
  if (urgencyLevel === 'high') {
    await sendMailerLiteEmail({
      to: Deno.env.get('URGENT_EMAIL') || 'urgent@repmotivatedseller.org',
      subject,
      html: emailBody,
      tags: ['urgent_notification', 'high_priority']
    })
  }
}

async function sendStatusUpdateEmail(submission: any, recipientEmail?: string) {
  const email = recipientEmail || submission.contact_email
  if (!email) return

  const subject = `Update on Your Foreclosure Assistance Request - ${submission.status.toUpperCase()}`
  const emailBody = generateStatusUpdateEmailTemplate(submission)

  await sendMailerLiteEmail({
    to: email,
    subject,
    html: emailBody,
    tags: ['status_update', `status_${submission.status}`]
  })
}

async function sendUrgentCaseEmail(submission: any) {
  const subject = `🚨 URGENT: High Priority Foreclosure Case - ${submission.contact_name}`
  const emailBody = generateUrgentCaseEmailTemplate(submission)

  const urgentRecipients = [
    Deno.env.get('ADMIN_EMAIL') || 'admin@repmotivatedseller.org',
    Deno.env.get('URGENT_EMAIL') || 'urgent@repmotivatedseller.org',
    Deno.env.get('MANAGER_EMAIL') || 'manager@repmotivatedseller.org'
  ]

  for (const recipient of urgentRecipients.filter(Boolean)) {
    await sendMailerLiteEmail({
      to: recipient,
      subject,
      html: emailBody,
      tags: ['urgent_case', 'immediate_action_required']
    })
  }
}

async function sendFollowUpReminder(submission: any, customData: any) {
  const daysSinceSubmission = Math.floor((Date.now() - new Date(submission.created_at).getTime()) / (1000 * 60 * 60 * 24))
  const subject = `Follow-up Reminder: ${submission.contact_name} - Day ${daysSinceSubmission}`
  
  const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Follow-up Reminder</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
    .reminder { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
    .action-items { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .button { background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Follow-up Reminder</h1>
      <p>RepMotivatedSeller - Client Follow-up System</p>
    </div>
    
    <div class="content">
      <div class="reminder">
        <h2>📅 ${daysSinceSubmission} Days Since Submission</h2>
        <p><strong>Client:</strong> ${submission.contact_name}</p>
        <p><strong>Status:</strong> ${submission.status.toUpperCase()}</p>
        <p><strong>Priority:</strong> ${getUrgencyLevel(submission).toUpperCase()}</p>
      </div>

      <div class="action-items">
        <h3>📋 Recommended Actions:</h3>
        <ul>
          ${daysSinceSubmission === 1 ? '<li>Initial contact within 24 hours</li>' : ''}
          ${daysSinceSubmission === 3 ? '<li>Follow-up call if no response</li>' : ''}
          ${daysSinceSubmission === 7 ? '<li>Send additional resources and options</li>' : ''}
          ${daysSinceSubmission === 14 ? '<li>Final outreach before case review</li>' : ''}
          <li>Update case status and notes</li>
          <li>Schedule next follow-up if needed</li>
        </ul>
      </div>

      <p><strong>Contact Information:</strong></p>
      <ul>
        <li>📧 Email: ${submission.contact_email || 'Not provided'}</li>
        <li>📞 Phone: ${submission.contact_phone || 'Not provided'}</li>
      </ul>

      <a href="${Deno.env.get('SITE_URL')}/admin" class="button">
        View Full Case Details
      </a>
    </div>
  </div>
</body>
</html>
  `

  await sendMailerLiteEmail({
    to: Deno.env.get('ADMIN_EMAIL') || 'admin@repmotivatedseller.org',
    subject,
    html: emailBody,
    tags: ['follow_up_reminder', `day_${daysSinceSubmission}`]
  })
}

async function triggerWelcomeSequence(submission: any) {
  if (!submission.contact_email) return

  // Add to welcome automation sequence in MailerLite
  await addToMailerLiteAutomation(submission.contact_email, 'welcome_sequence', {
    name: submission.contact_name,
    urgency_level: getUrgencyLevel(submission),
    submission_date: submission.created_at
  })
}

async function sendMailerLiteEmail({ to, subject, html, tags = [] }: {
  to: string;
  subject: string;
  html: string;
  tags?: string[];
}) {
  const mailerLiteApiKey = Deno.env.get('MAILERLITE_API_KEY')
  
  if (!mailerLiteApiKey) {
    console.log('No MailerLite API key configured. Email would be sent to:', to)
    console.log('Subject:', subject)
    return
  }

  try {
    const response = await fetch('https://connect.mailerlite.com/api/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mailerLiteApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        to: [{ email: to }],
        from: {
          email: Deno.env.get('FROM_EMAIL') || 'noreply@repmotivatedseller.org',
          name: 'RepMotivatedSeller'
        },
        subject,
        html,
        tags,
        track_opens: true,
        track_clicks: true,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`MailerLite API error: ${response.statusText} - ${errorData}`)
    }

    const result = await response.json()
    console.log('Email sent successfully via MailerLite:', result.data?.id)
  } catch (error) {
    console.error('Failed to send email via MailerLite:', error)
    throw error
  }
}

async function addToMailerLiteList(submission: any, listName: string) {
  const mailerLiteApiKey = Deno.env.get('MAILERLITE_API_KEY')
  if (!mailerLiteApiKey || !submission.contact_email) return

  try {
    // First, get or create the group
    const groupId = await getOrCreateMailerLiteGroup(listName)
    
    // Add subscriber to group
    const response = await fetch(`https://connect.mailerlite.com/api/subscribers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mailerLiteApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: submission.contact_email,
        fields: {
          name: submission.contact_name || '',
          phone: submission.contact_phone || '',
          home_value: submission.home_value || '',
          mortgage_balance: submission.mortgage_balance || '',
          lender: submission.lender || '',
          missed_payments: submission.missed_payments || 0,
          urgency_level: getUrgencyLevel(submission),
          submission_date: submission.created_at,
          property_type: submission.property_type || '',
          nod_received: submission.nod === 'yes' ? 'Yes' : 'No'
        },
        groups: [groupId],
        status: 'active'
      }),
    })

    if (response.ok) {
      console.log(`Successfully added ${submission.contact_email} to MailerLite list: ${listName}`)
    } else {
      const errorData = await response.text()
      console.error('Failed to add to MailerLite list:', errorData)
    }
  } catch (error) {
    console.error('MailerLite list addition error:', error)
  }
}

async function getOrCreateMailerLiteGroup(groupName: string): Promise<string> {
  const mailerLiteApiKey = Deno.env.get('MAILERLITE_API_KEY')
  if (!mailerLiteApiKey) throw new Error('MailerLite API key not configured')

  try {
    // Try to get existing group
    const response = await fetch('https://connect.mailerlite.com/api/groups', {
      headers: {
        'Authorization': `Bearer ${mailerLiteApiKey}`,
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      const groups = await response.json()
      const existingGroup = groups.data?.find((group: any) => group.name === groupName)
      if (existingGroup) {
        return existingGroup.id
      }
    }

    // Create new group if it doesn't exist
    const createResponse = await fetch('https://connect.mailerlite.com/api/groups', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mailerLiteApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: groupName,
      }),
    })

    if (createResponse.ok) {
      const newGroup = await createResponse.json()
      return newGroup.data.id
    } else {
      throw new Error('Failed to create MailerLite group')
    }
  } catch (error) {
    console.error('Error managing MailerLite group:', error)
    throw error
  }
}

async function addToMailerLiteAutomation(email: string, automationName: string, customFields: any) {
  const mailerLiteApiKey = Deno.env.get('MAILERLITE_API_KEY')
  if (!mailerLiteApiKey) return

  try {
    // Add subscriber with automation trigger
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mailerLiteApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        fields: customFields,
        automation_triggers: [automationName]
      }),
    })

    if (response.ok) {
      console.log(`Successfully triggered automation ${automationName} for ${email}`)
    }
  } catch (error) {
    console.error('Failed to trigger MailerLite automation:', error)
  }
}

async function logToCRM(submission: any, eventType: string, customData?: any) {
  const crmType = Deno.env.get('CRM_TYPE') || 'hubspot' // hubspot, salesforce, pipedrive, custom
  
  switch (crmType.toLowerCase()) {
    case 'hubspot':
      await logToHubSpot(submission, eventType, customData)
      break
    case 'salesforce':
      await logToSalesforce(submission, eventType, customData)
      break
    case 'pipedrive':
      await logToPipedrive(submission, eventType, customData)
      break
    case 'custom':
      await logToCustomCRM(submission, eventType, customData)
      break
    default:
      console.log('No CRM configured. Would log:', { submission: submission.id, eventType, customData })
  }
}

async function logToHubSpot(submission: any, eventType: string, customData?: any) {
  const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY')
  if (!hubspotApiKey) return

  try {
    const contactData = {
      properties: {
        email: submission.contact_email,
        firstname: submission.contact_name?.split(' ')[0] || '',
        lastname: submission.contact_name?.split(' ').slice(1).join(' ') || '',
        phone: submission.contact_phone,
        foreclosure_status: submission.status,
        home_value: submission.home_value,
        mortgage_balance: submission.mortgage_balance,
        missed_payments: submission.missed_payments,
        lender: submission.lender,
        submission_date: submission.created_at,
        urgency_level: getUrgencyLevel(submission),
        lead_source: 'Foreclosure Questionnaire',
        property_type: submission.property_type,
        nod_received: submission.nod === 'yes',
        last_event_type: eventType,
        last_event_date: new Date().toISOString()
      }
    }

    // Create or update contact
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    })

    if (response.ok) {
      const contact = await response.json()
      console.log('Successfully logged to HubSpot:', contact.id)
      
      // Create activity/note
      await createHubSpotActivity(contact.id, eventType, submission, customData)
    } else {
      console.error('HubSpot logging failed:', await response.text())
    }
  } catch (error) {
    console.error('HubSpot integration error:', error)
  }
}

async function createHubSpotActivity(contactId: string, eventType: string, submission: any, customData?: any) {
  const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY')
  if (!hubspotApiKey) return

  const activityData = {
    properties: {
      hs_timestamp: Date.now(),
      hubspot_owner_id: Deno.env.get('HUBSPOT_OWNER_ID'),
      hs_activity_type: 'EMAIL',
      hs_body: `
Event: ${eventType}
Submission ID: ${submission.id}
Status: ${submission.status}
Urgency: ${getUrgencyLevel(submission)}
${customData ? `Additional Data: ${JSON.stringify(customData)}` : ''}
      `
    },
    associations: [
      {
        to: { id: contactId },
        types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 198 }]
      }
    ]
  }

  try {
    await fetch('https://api.hubapi.com/crm/v3/objects/activities', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activityData),
    })
  } catch (error) {
    console.error('Failed to create HubSpot activity:', error)
  }
}

async function logToSalesforce(submission: any, eventType: string, customData?: any) {
  // Salesforce integration implementation
  console.log('Salesforce integration - would log:', { submission: submission.id, eventType })
}

async function logToPipedrive(submission: any, eventType: string, customData?: any) {
  // Pipedrive integration implementation
  console.log('Pipedrive integration - would log:', { submission: submission.id, eventType })
}

async function logToCustomCRM(submission: any, eventType: string, customData?: any) {
  const customCrmUrl = Deno.env.get('CUSTOM_CRM_URL')
  const customCrmApiKey = Deno.env.get('CUSTOM_CRM_API_KEY')
  
  if (!customCrmUrl || !customCrmApiKey) return

  try {
    await fetch(customCrmUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${customCrmApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        submission,
        eventType,
        customData,
        timestamp: new Date().toISOString()
      }),
    })
  } catch (error) {
    console.error('Custom CRM integration error:', error)
  }
}

async function scheduleFollowUpReminders(submission: any) {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  // Schedule follow-up reminders at 1, 3, 7, and 14 days
  const reminderDays = [1, 3, 7, 14]
  
  for (const days of reminderDays) {
    const reminderDate = new Date(submission.created_at)
    reminderDate.setDate(reminderDate.getDate() + days)
    
    // In a real implementation, you'd use a job queue or cron job
    // For now, we'll log the scheduled reminders
    console.log(`Scheduled follow-up reminder for ${submission.contact_name} on ${reminderDate.toISOString()}`)
  }
}

function getUrgencyLevel(submission: any): 'high' | 'medium' | 'low' {
  const missedPayments = submission.missed_payments || 0
  const hasNOD = submission.nod === 'yes'
  const isOverwhelmed = submission.overwhelmed === 'yes'
  
  if (hasNOD || missedPayments >= 3 || isOverwhelmed) return 'high'
  if (missedPayments >= 1) return 'medium'
  return 'low'
}

function generateNewSubmissionEmailTemplate(submission: any, urgencyLevel: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Foreclosure Submission</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); color: white; padding: 30px 20px; text-align: center; }
    .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .content { padding: 30px 20px; }
    .urgency-high { background: #fee2e2; border-left: 6px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .urgency-medium { background: #fef3c7; border-left: 6px solid #d97706; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .urgency-low { background: #d1fae5; border-left: 6px solid #059669; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .section { margin: 25px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
    .section h3 { margin-top: 0; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .info-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .label { font-weight: 600; color: #374151; }
    .value { color: #6b7280; }
    .button { 
      display: inline-block; 
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
      color: white; 
      padding: 15px 30px; 
      text-decoration: none; 
      border-radius: 8px; 
      font-weight: 600; 
      margin: 20px 0; 
      box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
    }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
    .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🏠 RepMotivatedSeller</div>
      <h1>New Foreclosure Submission</h1>
      <p>Professional Foreclosure Assistance Platform</p>
    </div>
    
    <div class="content">
      <div class="urgency-${urgencyLevel}">
        <h2>🚨 Priority Level: <span class="highlight">${urgencyLevel.toUpperCase()}</span></h2>
        ${urgencyLevel === 'high' ? '<p><strong>⚠️ IMMEDIATE ATTENTION REQUIRED</strong><br>NOD received, 3+ missed payments, or client overwhelmed</p>' : ''}
        ${urgencyLevel === 'medium' ? '<p><strong>📅 FOLLOW UP WITHIN 24 HOURS</strong><br>1-2 missed payments detected</p>' : ''}
        ${urgencyLevel === 'low' ? '<p><strong>✅ STANDARD FOLLOW-UP TIMELINE</strong><br>Anticipating trouble, proactive inquiry</p>' : ''}
      </div>

      <div class="section">
        <h3>👤 Contact Information</h3>
        <div class="info-item">
          <span class="label">Full Name:</span>
          <span class="value">${submission.contact_name || 'Not provided'}</span>
        </div>
        <div class="info-item">
          <span class="label">Email Address:</span>
          <span class="value">${submission.contact_email || 'Not provided'}</span>
        </div>
        <div class="info-item">
          <span class="label">Phone Number:</span>
          <span class="value">${submission.contact_phone || 'Not provided'}</span>
        </div>
      </div>

      <div class="section">
        <h3>💰 Financial Overview</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Home Value:</span>
            <span class="value">${submission.home_value || 'Not provided'}</span>
          </div>
          <div class="info-item">
            <span class="label">Mortgage Balance:</span>
            <span class="value">${submission.mortgage_balance || 'Not provided'}</span>
          </div>
          <div class="info-item">
            <span class="label">Lender:</span>
            <span class="value">${submission.lender || 'Not provided'}</span>
          </div>
          <div class="info-item">
            <span class="label">Missed Payments:</span>
            <span class="value">${submission.missed_payments || 0}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>🏡 Property & Situation Details</h3>
        <div class="info-item">
          <span class="label">Property Type:</span>
          <span class="value">${submission.property_type || 'Not specified'}</span>
        </div>
        <div class="info-item">
          <span class="label">Notice of Default:</span>
          <span class="value">${submission.nod === 'yes' ? '🚨 YES' : '✅ No'}</span>
        </div>
        <div class="info-item">
          <span class="label">Time in Home:</span>
          <span class="value">${submission.situation_length || 'Not provided'}</span>
        </div>
        <div class="info-item">
          <span class="label">Payment Issues Started:</span>
          <span class="value">${submission.payment_difficulty_date || 'Not provided'}</span>
        </div>
      </div>

      <div class="section">
        <h3>📝 Client's Main Challenge</h3>
        <p style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
          "${submission.challenge || 'Not provided'}"
        </p>
      </div>

      <div class="section">
        <h3>💭 Family Impact Statement</h3>
        <p style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
          "${submission.impact || 'Not provided'}"
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${Deno.env.get('SITE_URL')}/admin" class="button">
          🔍 View Full Details in Admin Dashboard
        </a>
      </div>
    </div>

    <div class="footer">
      <p><strong>Submission Details:</strong></p>
      <p>📅 Submitted: ${new Date(submission.created_at).toLocaleString()}</p>
      <p>🆔 ID: ${submission.id}</p>
      <p>🔗 Admin Dashboard: ${Deno.env.get('SITE_URL')}/admin</p>
    </div>
  </div>
</body>
</html>
  `
}

function generateStatusUpdateEmailTemplate(submission: any): string {
  const statusMessages = {
    reviewed: 'Your submission has been carefully reviewed by our foreclosure assistance team.',
    contacted: 'We have attempted to contact you regarding your foreclosure situation. Please check your phone for missed calls.',
    closed: 'Your case has been successfully resolved. Thank you for trusting us with your foreclosure assistance needs.'
  }

  const statusColors = {
    reviewed: '#f59e0b',
    contacted: '#8b5cf6',
    closed: '#10b981'
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Status Update - RepMotivatedSeller</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, ${statusColors[submission.status as keyof typeof statusColors]} 0%, #1f2937 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .status-update { background: #f0f9ff; border: 2px solid ${statusColors[submission.status as keyof typeof statusColors]}; padding: 25px; margin: 20px 0; border-radius: 12px; text-align: center; }
    .section { margin: 25px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
    .contact-info { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Status Update</h1>
      <p>RepMotivatedSeller - Foreclosure Assistance</p>
    </div>
    
    <div class="content">
      <p style="font-size: 18px;">Dear ${submission.contact_name || 'Valued Client'},</p>
      
      <div class="status-update">
        <h2 style="margin-top: 0; color: ${statusColors[submission.status as keyof typeof statusColors]};">
          Status: ${submission.status.toUpperCase()}
        </h2>
        <p style="font-size: 16px; margin-bottom: 0;">
          ${statusMessages[submission.status as keyof typeof statusMessages] || 'Your submission status has been updated.'}
        </p>
      </div>

      ${submission.notes ? `
      <div class="section">
        <h3 style="color: #1f2937; margin-top: 0;">📝 Personal Message from Our Team</h3>
        <p style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; font-style: italic;">
          "${submission.notes}"
        </p>
      </div>
      ` : ''}

      <div class="section">
        <h3 style="color: #1f2937; margin-top: 0;">🎯 What Happens Next?</h3>
        <ul style="padding-left: 20px;">
          ${submission.status === 'reviewed' ? `
            <li>Our team will contact you within 24 hours</li>
            <li>We'll discuss your specific situation and options</li>
            <li>You'll receive a personalized action plan</li>
          ` : ''}
          ${submission.status === 'contacted' ? `
            <li>Please return our call at your earliest convenience</li>
            <li>We have time-sensitive options to discuss</li>
            <li>Our team is standing by to help</li>
          ` : ''}
          ${submission.status === 'closed' ? `
            <li>Your case file will remain available for reference</li>
            <li>Feel free to contact us for future assistance</li>
            <li>We appreciate your trust in our services</li>
          ` : ''}
        </ul>
      </div>

      <div class="contact-info">
        <h3 style="margin-top: 0; color: white;">📞 Need Immediate Assistance?</h3>
        <p style="margin: 10px 0; font-size: 18px; font-weight: bold;">Call: (555) 123-4567</p>
        <p style="margin: 10px 0; font-size: 16px;">Email: help@repmotivatedseller.org</p>
        <p style="margin-bottom: 0; font-size: 14px;">Available Monday-Friday, 8 AM - 8 PM EST</p>
      </div>

      <p style="margin-top: 30px; text-align: center; font-size: 16px;">
        We're here to help you through this challenging time.<br>
        <strong>The RepMotivatedSeller Team</strong>
      </p>
    </div>

    <div class="footer">
      <p>This is an automated message regarding your foreclosure assistance request.</p>
      <p>If you have questions about this update, please contact us using the information above.</p>
    </div>
  </div>
</body>
</html>
  `
}

function generateUrgentCaseEmailTemplate(submission: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>🚨 URGENT: High Priority Foreclosure Case</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .urgent-alert { background: #fee2e2; border: 3px solid #dc2626; padding: 25px; margin: 20px 0; border-radius: 12px; }
    .action-required { background: #fef3c7; border-left: 6px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; padding: 20px; border-radius: 8px; }
    .urgency-indicators { background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .button { 
      display: inline-block; 
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); 
      color: white; 
      padding: 15px 30px; 
      text-decoration: none; 
      border-radius: 8px; 
      font-weight: 600; 
      margin: 20px 0; 
      box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);
    }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 URGENT FORECLOSURE CASE</h1>
      <p style="font-size: 18px; margin: 0;">IMMEDIATE ACTION REQUIRED</p>
    </div>
    
    <div class="content">
      <div class="urgent-alert">
        <h2 style="margin-top: 0; color: #dc2626;">⚠️ HIGH PRIORITY CLIENT</h2>
        <div class="contact-grid">
          <div>
            <strong>Client:</strong><br>${submission.contact_name || 'Name not provided'}
          </div>
          <div>
            <strong>Phone:</strong><br>${submission.contact_phone || 'Not provided'}
          </div>
          <div>
            <strong>Email:</strong><br>${submission.contact_email || 'Not provided'}
          </div>
          <div>
            <strong>Missed Payments:</strong><br>${submission.missed_payments || 0}
          </div>
        </div>
      </div>

      <div class="urgency-indicators">
        <h3 style="margin-top: 0; color: #dc2626;">🔥 Critical Urgency Indicators</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${submission.missed_payments >= 3 ? '<li><strong>3+ missed payments detected</strong></li>' : ''}
          ${submission.nod === 'yes' ? '<li><strong>Notice of Default received</strong></li>' : ''}
          ${submission.overwhelmed === 'yes' ? '<li><strong>Client reports feeling overwhelmed</strong></li>' : ''}
          ${submission.lender_issue === 'yes' ? '<li><strong>Difficulty getting lender assistance</strong></li>' : ''}
          ${submission.options_narrowing === 'yes' ? '<li><strong>Client feels options are shrinking</strong></li>' : ''}
        </ul>
      </div>

      <div class="action-required">
        <h3 style="margin-top: 0; color: #f59e0b;">📋 IMMEDIATE ACTION PLAN</h3>
        <ol style="margin: 0; padding-left: 20px; font-weight: 600;">
          <li>Contact client within <strong>2 HOURS</strong></li>
          <li>Schedule emergency consultation</li>
          <li>Review all available foreclosure prevention options</li>
          <li>Escalate to senior team member if needed</li>
          <li>Document all contact attempts and outcomes</li>
        </ol>
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">📝 Client's Situation Summary</h3>
        <p><strong>Main Challenge:</strong> ${submission.challenge || 'Not provided'}</p>
        <p><strong>Family Impact:</strong> ${submission.impact || 'Not provided'}</p>
        <p><strong>Property Type:</strong> ${submission.property_type || 'Not specified'}</p>
        <p><strong>Home Value:</strong> ${submission.home_value || 'Not provided'}</p>
        <p><strong>Mortgage Balance:</strong> ${submission.mortgage_balance || 'Not provided'}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${Deno.env.get('SITE_URL')}/admin" class="button">
          🔍 VIEW FULL CASE DETAILS IMMEDIATELY
        </a>
      </div>

      <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px; text-align: center;">
        <h3 style="margin-top: 0;">⏰ TIME-SENSITIVE REMINDER</h3>
        <p style="margin-bottom: 0; font-size: 16px;">
          This client needs immediate attention. Delayed response could result in foreclosure proceedings.
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>This urgent notification was triggered automatically based on submission criteria.</strong></p>
      <p>📅 Submitted: ${new Date(submission.created_at).toLocaleString()}</p>
      <p>🆔 Case ID: ${submission.id}</p>
    </div>
  </div>
</body>
</html>
  `
}