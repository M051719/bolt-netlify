# Supabase Function URL Configuration

## 🔍 Finding Your Exact Webhook URL

### Method 1: Check Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Edge Functions** in the sidebar
4. Find the `ai-voice-handler` function
5. Copy the function URL

### Method 2: Use Supabase CLI
```bash
# Get your project reference
supabase projects list

# Get function details
supabase functions list
```

### Method 3: Construct URL Manually
Your webhook URL format should be:
```
https://[PROJECT_REF].functions.supabase.co/ai-voice-handler
```

## 🔧 Complete Twilio Configuration

### Step 1: Configure Voice Webhook in Twilio Console

1. **Login to Twilio Console**
   - Go to: https://console.twilio.com
   - Navigate to: **Phone Numbers** → **Manage** → **Active Numbers**

2. **Select Your Phone Number**
   - Click on: `+18778064677`

3. **Configure Voice Settings**
   ```
   Voice Configuration:
   ├── Webhook: [YOUR_SUPABASE_FUNCTION_URL]
   ├── HTTP Method: POST
   ├── Primary Handler: Voice
   └── Fallback URL: (Same as webhook URL)
   ```

4. **Configure Status Callbacks** (Optional but recommended)
   ```
   Status Callback Configuration:
   ├── Status Callback URL: [YOUR_SUPABASE_FUNCTION_URL]
   ├── Status Callback Method: POST
   └── Status Callback Events: ☑️ All Events
   ```

### Step 2: Test Webhook Connectivity

```bash
# Test if your function is accessible
curl -X POST [YOUR_SUPABASE_FUNCTION_URL] \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test123&From=%2B15551234567&To=%2B18778064677&CallStatus=ringing&Direction=inbound"
```

Expected response: TwiML with AI greeting

### Step 3: Verify Environment Variables

Ensure these are set in your Supabase project:

```bash
# Check if environment variables are set in Supabase
supabase secrets list
```

Required secrets:
- `OPENAI_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `AGENT_PHONE_NUMBER`

### Step 4: Set Supabase Secrets

```bash
# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=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

# Set Twilio credentials
supabase secrets set TWILIO_ACCOUNT_SID=ACe525412ae7e0751b4d9533d48b348066
supabase secrets set TWILIO_AUTH_TOKEN=4f1f31f680db649380efc82b041129a0

# Set agent phone number
supabase secrets set AGENT_PHONE_NUMBER=+18778064677
supabase secrets set SCHEDULING_PHONE_NUMBER=+18778064677

# Set OpenAI model
supabase secrets set OPENAI_MODEL=gpt-3.5-turbo
```

## 🧪 Testing Your AI Call System

### Test 1: Function Deployment
```bash
# Verify functions are deployed
supabase functions list

# Check function logs
supabase functions logs ai-voice-handler --follow
```

### Test 2: Make a Test Call
1. **Call**: `+18778064677`
2. **Listen for**: "Hello and thank you for calling RepMotivatedSeller..."
3. **Say**: "foreclosure help" or "I need assistance"
4. **Verify**: AI responds appropriately

### Test 3: Check Admin Dashboard
1. Go to: `/admin` in your application
2. Click: **AI Calls** tab
3. Verify: Call appears with transcript and analytics

### Test 4: Agent Handoff
1. **Call**: `+18778064677`
2. **Say**: "I want to speak to an agent" or "human"
3. **Verify**: Call transfers to agent number

## 🔍 Troubleshooting

### Common Issues:

**1. Webhook Not Receiving Calls**
```bash
# Check if function is accessible
curl -I [YOUR_SUPABASE_FUNCTION_URL]

# Verify Twilio webhook configuration
# Ensure URL is exactly correct with no extra characters
```

**2. AI Not Responding**
```bash
# Check OpenAI API key
supabase secrets list | grep OPENAI

# Check function logs for errors
supabase functions logs ai-voice-handler --limit 20
```

**3. Database Errors**
```bash
# Verify tables exist
supabase db ping

# Check if migration ran
psql [CONNECTION_STRING] -c "\dt"
```

**4. Function Timeout**
```bash
# Check function execution time
supabase functions logs ai-voice-handler | grep "duration"
```

## 📊 Monitoring and Analytics

### View Call Analytics
- Go to Admin Dashboard → AI Calls
- Monitor real-time call activity
- Review conversation transcripts
- Analyze intent detection accuracy

### Function Logs
```bash
# Real-time monitoring
supabase functions logs ai-voice-handler --follow

# View recent errors
supabase functions logs ai-voice-handler | grep "ERROR"
```

## 🎯 Success Indicators

✅ **Function deployed successfully**
✅ **Webhook URL configured in Twilio**
✅ **Environment variables set**
✅ **Test call connects and AI responds**
✅ **Admin dashboard shows call data**
✅ **Agent handoff works**
✅ **Database logging functional**

Your AI call system should now be fully operational! 🚀