# AI Call System Deployment Guide

## 🚀 Complete Setup Instructions

### Step 1: Environment Variables ✅
Your `.env` file has been updated with all necessary AI call configuration variables including:
- Twilio credentials and phone number
- OpenAI API key for conversational AI
- Agent phone numbers for handoffs
- AI call settings and timeouts

### Step 2: Deploy Supabase Edge Functions

Run these commands to deploy the AI call handling functions:

```bash
# Deploy the main AI voice handler function
supabase functions deploy ai-voice-handler

# Deploy the call analytics function
supabase functions deploy call-analytics

# Deploy the follow-up scheduler (if needed)
supabase functions deploy schedule-follow-ups
```

### Step 3: Configure Twilio Voice Webhook

1. **Log into Twilio Console**
   - Go to [Twilio Console](https://console.twilio.com)
   - Navigate to Phone Numbers → Manage → Active Numbers
   - Click on your phone number: `+18778064677`

2. **Configure Voice Webhook**
   - **Webhook URL**: `https://melvin@sofiesentrepreneurialgroup.com.functions.supabase.co/ai-voice-handler`
   - **HTTP Method**: `POST`
   - **Primary Handler**: Voice
   - **Fallback URL**: (Optional) Same URL for redundancy

3. **Configure Status Callbacks** (Optional)
   - **Status Callback URL**: Same as webhook URL
   - **Status Callback Method**: `POST`
   - **Status Callback Events**: Select all events

### Step 4: Test the System

#### Test 1: Webhook Connectivity
```bash
# Test if the webhook endpoint is accessible
curl -X POST https://melvin@sofiesentrepreneurialgroup.com.functions.supabase.co/ai-voice-handler \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test&From=%2B15551234567&To=%2B18778064677&CallStatus=ringing"
```

#### Test 2: Make a Test Call
1. Call your Twilio number: `+18778064677`
2. Verify the AI greeting plays
3. Test speech recognition by saying "foreclosure help"
4. Check the admin dashboard for call logs

#### Test 3: Admin Dashboard
1. Go to Admin → AI Calls tab
2. Verify call appears in real-time
3. Check transcript and analytics

### Step 5: Verify Database Schema

Ensure the AI call tables exist in your Supabase database:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ai_calls', 'call_transcripts', 'call_intents', 'agent_handoffs');
```

If tables don't exist, run the migration:
```bash
supabase db reset
```

### Step 6: Monitor and Debug

#### Check Function Logs
```bash
# View real-time logs
supabase functions logs ai-voice-handler --follow

# View analytics logs
supabase functions logs call-analytics --follow
```

#### Common Issues and Solutions

**Issue**: Webhook not receiving calls
- **Solution**: Verify webhook URL is exactly: `https://melvin@sofiesentrepreneurialgroup.com.functions.supabase.co/ai-voice-handler`
- **Check**: Ensure HTTP method is POST
- **Test**: Use Twilio's webhook debugger

**Issue**: AI not responding
- **Solution**: Check OpenAI API key is valid and has credits
- **Verify**: Function logs for error messages
- **Test**: API connectivity manually

**Issue**: Database errors
- **Solution**: Ensure Supabase service role key is set
- **Check**: RLS policies allow function access
- **Verify**: Tables exist and have correct schema

### Step 7: Production Checklist

- [ ] Environment variables configured
- [ ] Supabase functions deployed
- [ ] Twilio webhook configured
- [ ] Test call successful
- [ ] Admin dashboard showing calls
- [ ] Database tables created
- [ ] Function logs clean
- [ ] OpenAI API working
- [ ] Agent handoff tested

## 🎯 Expected Call Flow

1. **Incoming Call** → Twilio receives call on `+18778064677`
2. **Webhook Trigger** → Twilio sends POST to your Supabase function
3. **AI Greeting** → Function returns TwiML with greeting
4. **Speech Processing** → OpenAI processes caller's speech
5. **Intent Detection** → AI identifies what caller needs
6. **Response Generation** → AI provides helpful response
7. **Handoff Decision** → Transfer to human if needed
8. **Database Logging** → All interactions stored for analytics

## 📞 Test Scenarios

### Scenario 1: Foreclosure Help
- **Caller says**: "I need help with foreclosure"
- **Expected**: AI provides foreclosure assistance information
- **Action**: Offers to schedule consultation

### Scenario 2: Speak to Agent
- **Caller says**: "I want to speak to a human"
- **Expected**: AI transfers to agent phone number
- **Action**: Call forwarded to `+18778064677`

### Scenario 3: Case Status
- **Caller says**: "Check my case status"
- **Expected**: AI asks for identifying information
- **Action**: Provides status or transfers to agent

## 🔧 Troubleshooting Commands

```bash
# Check function deployment status
supabase functions list

# Test function locally
supabase functions serve ai-voice-handler

# Check database connection
supabase db ping

# View recent function invocations
supabase functions logs ai-voice-handler --limit 50
```

Your AI call answering system is now configured and ready for deployment! 🚀