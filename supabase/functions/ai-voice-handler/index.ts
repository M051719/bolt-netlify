import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface TwilioVoiceRequest {
  CallSid: string;
  From: string;
  To: string;
  CallStatus: string;
  Direction: string;
  SpeechResult?: string;
  Confidence?: string;
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

    const formData = await req.formData()
    const twilioData: TwilioVoiceRequest = {
      CallSid: formData.get('CallSid') as string,
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      CallStatus: formData.get('CallStatus') as string,
      Direction: formData.get('Direction') as string,
      SpeechResult: formData.get('SpeechResult') as string || undefined,
      Confidence: formData.get('Confidence') as string || undefined,
    }

    // Handle different call events
    switch (twilioData.CallStatus) {
      case 'ringing':
        return handleIncomingCall(supabaseClient, twilioData)
      case 'in-progress':
        return handleCallInProgress(supabaseClient, twilioData)
      case 'completed':
        return handleCallCompleted(supabaseClient, twilioData)
      default:
        return generateTwiMLResponse('Thank you for calling RepMotivatedSeller. Please hold while we connect you.')
    }
  } catch (error) {
    console.error('Error handling voice request:', error)
    return generateTwiMLResponse('We apologize, but we are experiencing technical difficulties. Please try calling back in a few minutes.')
  }
})

async function handleIncomingCall(supabaseClient: any, twilioData: TwilioVoiceRequest) {
  // Create new call record
  const { data: callRecord, error } = await supabaseClient
    .from('ai_calls')
    .insert([{
      call_sid: twilioData.CallSid,
      phone_number: twilioData.From,
      call_status: 'in-progress',
      priority_level: 'medium'
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating call record:', error)
  }

  // Generate initial greeting TwiML
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Hello and thank you for calling RepMotivatedSeller, your trusted foreclosure assistance partner. 
    I'm your AI assistant, and I'm here to help you with your foreclosure questions and concerns.
    
    To better assist you, please tell me in a few words what you're calling about today. 
    For example, you can say "foreclosure help", "check my case status", "speak to an agent", or "schedule an appointment".
  </Say>
  <Gather input="speech" timeout="10" speechTimeout="3" action="/functions/v1/ai-voice-handler" method="POST">
    <Say voice="alice">Please speak now.</Say>
  </Gather>
  <Say voice="alice">I didn't hear anything. Let me transfer you to one of our specialists.</Say>
  <Dial>
    <Number>${Deno.env.get('AGENT_PHONE_NUMBER') || '+15551234567'}</Number>
  </Dial>
</Response>`

  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml' }
  })
}

async function handleCallInProgress(supabaseClient: any, twilioData: TwilioVoiceRequest) {
  if (!twilioData.SpeechResult) {
    return generateTwiMLResponse('I didn\'t catch that. Could you please repeat what you need help with?')
  }

  // Process speech with AI
  const aiResponse = await processWithAI(twilioData.SpeechResult, twilioData.CallSid)
  
  // Store transcript
  await supabaseClient
    .from('call_transcripts')
    .insert([{
      call_id: await getCallId(supabaseClient, twilioData.CallSid),
      speaker: 'caller',
      message: twilioData.SpeechResult,
      confidence_score: parseFloat(twilioData.Confidence || '0'),
      timestamp_offset: 0 // This would need to be calculated from call start
    }])

  await supabaseClient
    .from('call_transcripts')
    .insert([{
      call_id: await getCallId(supabaseClient, twilioData.CallSid),
      speaker: 'ai',
      message: aiResponse.message,
      timestamp_offset: 0
    }])

  // Store detected intent
  if (aiResponse.intent) {
    await supabaseClient
      .from('call_intents')
      .insert([{
        call_id: await getCallId(supabaseClient, twilioData.CallSid),
        intent_name: aiResponse.intent.name,
        confidence_score: aiResponse.intent.confidence,
        entities: aiResponse.intent.entities,
        response_provided: aiResponse.message
      }])
  }

  // Check if human handoff is needed
  if (aiResponse.requiresHandoff) {
    return handleAgentHandoff(supabaseClient, twilioData, aiResponse.handoffReason)
  }

  // Generate appropriate TwiML response
  return generateConversationalTwiML(aiResponse)
}

async function handleCallCompleted(supabaseClient: any, twilioData: TwilioVoiceRequest) {
  // Update call record
  await supabaseClient
    .from('ai_calls')
    .update({
      call_status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('call_sid', twilioData.CallSid)

  return new Response('OK', { status: 200 })
}

async function processWithAI(speechText: string, callSid: string) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
  
  if (!openaiApiKey) {
    return {
      message: 'I apologize, but our AI system is currently unavailable. Let me connect you with one of our specialists.',
      intent: null,
      requiresHandoff: true,
      handoffReason: 'AI system unavailable'
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: Deno.env.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for RepMotivatedSeller, a foreclosure assistance company. 

Your role is to:
1. Help callers with foreclosure-related questions
2. Collect basic information for case assessment
3. Schedule appointments with specialists
4. Provide general information about foreclosure processes
5. Identify when to transfer to human agents

Available intents:
- foreclosure_help: General foreclosure assistance
- case_status: Check existing case status
- schedule_appointment: Book consultation
- financial_hardship: Discuss financial difficulties
- property_valuation: Property value questions
- legal_questions: Legal advice (transfer to agent)
- speak_to_agent: Direct request for human agent

Respond with a JSON object containing:
{
  "message": "Your response to the caller",
  "intent": {
    "name": "detected_intent",
    "confidence": 0.95,
    "entities": {"key": "value"}
  },
  "requiresHandoff": false,
  "handoffReason": "reason if handoff needed",
  "nextAction": "suggested next step"
}

Keep responses conversational, empathetic, and under 50 words. Always be helpful and understanding about their foreclosure situation.`
          },
          {
            role: 'user',
            content: speechText
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    })

    if (!response.ok) {
      throw new Error('OpenAI API request failed')
    }

    const data = await response.json()
    const aiContent = data.choices[0].message.content

    try {
      return JSON.parse(aiContent)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return {
        message: aiContent,
        intent: { name: 'general_inquiry', confidence: 0.5, entities: {} },
        requiresHandoff: false,
        handoffReason: null,
        nextAction: 'continue_conversation'
      }
    }
  } catch (error) {
    console.error('Error processing with AI:', error)
    return {
      message: 'I apologize, but I\'m having trouble understanding. Let me connect you with one of our foreclosure specialists who can better assist you.',
      intent: null,
      requiresHandoff: true,
      handoffReason: 'AI processing error'
    }
  }
}

async function handleAgentHandoff(supabaseClient: any, twilioData: TwilioVoiceRequest, reason: string) {
  // Create handoff record
  await supabaseClient
    .from('agent_handoffs')
    .insert([{
      call_id: await getCallId(supabaseClient, twilioData.CallSid),
      reason: reason,
      ai_summary: 'Caller requested human assistance or AI determined handoff necessary'
    }])

  // Update call status
  await supabaseClient
    .from('ai_calls')
    .update({
      call_status: 'transferred',
      requires_human_followup: true
    })
    .eq('call_sid', twilioData.CallSid)

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    I understand you need to speak with one of our specialists. Let me connect you now. 
    Please hold while I transfer your call.
  </Say>
  <Dial timeout="30" record="record-from-answer">
    <Number>${Deno.env.get('AGENT_PHONE_NUMBER') || '+15551234567'}</Number>
  </Dial>
  <Say voice="alice">
    I apologize, but all our specialists are currently busy. 
    Please leave your name and phone number after the beep, and we'll call you back within one hour.
  </Say>
  <Record timeout="60" transcribe="true" action="/functions/v1/ai-voice-handler" />
</Response>`

  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml' }
  })
}

function generateConversationalTwiML(aiResponse: any) {
  let twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${aiResponse.message}</Say>`

  // Continue conversation or end based on intent
  if (aiResponse.nextAction === 'continue_conversation') {
    twiml += `
  <Gather input="speech" timeout="10" speechTimeout="3" action="/functions/v1/ai-voice-handler" method="POST">
    <Say voice="alice">How else can I help you today?</Say>
  </Gather>
  <Say voice="alice">Thank you for calling RepMotivatedSeller. Have a great day!</Say>`
  } else if (aiResponse.nextAction === 'schedule_appointment') {
    twiml += `
  <Say voice="alice">
    I'll connect you with our scheduling system to book your consultation.
  </Say>
  <Dial>
    <Number>${Deno.env.get('SCHEDULING_PHONE_NUMBER') || '+15551234567'}</Number>
  </Dial>`
  }

  twiml += `
</Response>`

  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml' }
  })
}

function generateTwiMLResponse(message: string) {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${message}</Say>
</Response>`

  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml' }
  })
}

async function getCallId(supabaseClient: any, callSid: string): Promise<string> {
  const { data } = await supabaseClient
    .from('ai_calls')
    .select('id')
    .eq('call_sid', callSid)
    .single()
  
  return data?.id || ''
}