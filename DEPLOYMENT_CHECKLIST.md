# 🚀 AI Voice Handler Deployment Checklist

## Step 1: Find Your Supabase Project Reference

Your Supabase project reference is needed for the webhook URL. Find it by:

1. **Check your .env file** for `VITE_SUPABASE_URL`
2. **Go to Supabase Dashboard** → Your project → Settings → General → Reference ID
3. **Look at browser URL** when in Supabase dashboard: `https://supabase.com/dashboard/project/[PROJECT_REF]`

## Step 2: Deploy Supabase Functions

Run these commands in your local terminal (not WebContainer):

```bash
# Login to Supabase
supabase login

# Link to your project (replace with your actual project ref)
supabase link --project-ref [YOUR_PROJECT_REF]

# Deploy the AI voice handler function
supabase functions deploy ai-voice-handler

# Deploy supporting functions
supabase functions deploy call-analytics
supabase functions deploy send-notification-email
supabase functions deploy schedule-follow-ups

# Verify deployment
supabase functions list
```

## Step 3: Set Environment Variables in Supabase

```bash
# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=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

# Set Twilio credentials
supabase secrets set TWILIO_ACCOUNT_SID=ACe525412ae7e0751b4d9533d48b348066
supabase secrets set TWILIO_AUTH_TOKEN=4f1f31f680db649380efc82b041129a0

# Set phone numbers for agent handoff
supabase secrets set AGENT_PHONE_NUMBER=+18778064677
supabase secrets set SCHEDULING_PHONE_NUMBER=+18778064677

# Set OpenAI model
supabase secrets set OPENAI_MODEL=gpt-3.5-turbo

# Verify all secrets are set
supabase secrets list
```

## Step 4: Configure Twilio Webhook

1. **Go to Twilio Console**: https://console.twilio.com
2. **Navigate to**: Phone Numbers → Manage → Active Numbers
3. **Click on**: `+18778064677`
4. **Configure Voice Webhook**:
   ```
   Webhook URL: https://[YOUR_PROJECT_REF].functions.supabase.co/ai-voice-handler
   HTTP Method: POST
   ```
5. **Save Configuration**

## Step 5: Test Your System

### Test 1: Function Accessibility
```bash
# Replace [YOUR_PROJECT_REF] with your actual project reference
curl -X POST https://[YOUR_PROJECT_REF].functions.supabase.co/ai-voice-handler \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test123&From=%2B15551234567&To=%2B18778064677&CallStatus=ringing"
```

### Test 2: Live Phone Call
1. Call: `+18778064677`
2. Should hear: "Hello and thank you for calling RepMotivatedSeller..."
3. Say: "foreclosure help" or "I need assistance"
4. Verify AI responds appropriately

### Test 3: Admin Dashboard
1. Go to your app → Admin → AI Calls tab
2. Verify call appears with transcript and analytics

## Step 6: Monitor and Debug

```bash
# Watch function logs in real-time
supabase functions logs ai-voice-handler --follow

# Check for any errors
supabase functions logs ai-voice-handler | grep "ERROR"
```

## 🎯 Success Indicators

- ✅ Functions deploy without errors
- ✅ Webhook URL responds with TwiML
- ✅ Phone calls connect and AI greeting plays
- ✅ Speech recognition works
- ✅ Admin dashboard shows call data
- ✅ Database logging functional

## 🚨 Common Issues

**Issue**: "Application error" when calling
**Solution**: Check function logs and verify environment variables

**Issue**: Music plays instead of AI greeting
**Solution**: Ensure Twilio is configured for "Webhook" not "TwiML App"

**Issue**: AI doesn't respond
**Solution**: Verify OpenAI API key is valid and has credits

## 📞 Your AI Call System Features

Once deployed, your system will:
- Answer calls with AI greeting
- Process speech with OpenAI
- Detect caller intents (foreclosure help, speak to agent, etc.)
- Provide helpful responses
- Transfer to human agents when needed
- Store all interactions in database
- Provide analytics in admin dashboard

Your AI call answering system is production-ready! 🚀