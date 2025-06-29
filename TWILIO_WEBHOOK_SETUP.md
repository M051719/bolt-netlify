# Complete Twilio Webhook Configuration Guide

## 🎯 Step-by-Step Twilio Setup

### Step 1: Find Your Supabase Project Reference

Your Supabase project reference is needed to construct the webhook URL. Here's how to find it:

#### Option A: From Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Look at the browser URL: `https://supabase.com/dashboard/project/[PROJECT_REF]`
4. The `PROJECT_REF` is the long string in the URL

#### Option B: From Project Settings
1. In Supabase Dashboard → Settings → General
2. Find "Reference ID" - this is your PROJECT_REF

#### Option C: From Your .env File
If you have a `.env` file with `VITE_SUPABASE_URL`, extract the project ref:
```bash
# If your URL is: https://abcdefghijklmnop.supabase.co
# Then PROJECT_REF is: abcdefghijklmnop
```

### Step 2: Construct Your Webhook URL

Once you have your PROJECT_REF, your webhook URL is:
```
https://[PROJECT_REF].functions.supabase.co/ai-voice-handler
```

**Example**: If your PROJECT_REF is `abcdefghijklmnop`, then:
```
https://abcdefghijklmnop.functions.supabase.co/ai-voice-handler
```

### Step 3: Configure Twilio Console

#### 3.1 Login to Twilio
- Go to: https://console.twilio.com
- Login with your Twilio account credentials

#### 3.2 Navigate to Phone Numbers
- Click **Phone Numbers** in the left sidebar
- Click **Manage** → **Active Numbers**
- Find and click on: `+18778064677`

#### 3.3 Configure Voice Settings
In the phone number configuration page:

```
Voice & Fax Section:
┌─────────────────────────────────────────────────────┐
│ A call comes in:                                    │
│ ○ TwiML App                                        │
│ ● Webhook  ← Select this option                    │
│                                                     │
│ URL: https://[PROJECT_REF].functions.supabase.co/ai-voice-handler │
│ HTTP: POST ▼  ← Ensure this is POST               │
│                                                     │
│ Primary handler fails:                              │
│ URL: https://[PROJECT_REF].functions.supabase.co/ai-voice-handler │
│ HTTP: POST ▼                                       │
└─────────────────────────────────────────────────────┘
```

#### 3.4 Optional: Configure Status Callbacks
For better monitoring, also set:

```
Status Callback Section:
┌─────────────────────────────────────────────────────┐
│ Status Callback URL:                                │
│ https://[PROJECT_REF].functions.supabase.co/ai-voice-handler │
│                                                     │
│ Status Callback Method: POST ▼                     │
│                                                     │
│ Status Callback Events:                             │
│ ☑️ Initiated  ☑️ Ringing  ☑️ Answered              │
│ ☑️ Completed  ☑️ Busy     ☑️ Failed                │
│ ☑️ No Answer                                        │
└─────────────────────────────────────────────────────┘
```

#### 3.5 Save Configuration
- Scroll to the bottom of the page
- Click **Save Configuration**

### Step 4: Test Your Configuration

#### Test 1: Webhook Accessibility
```bash
# Replace [YOUR_WEBHOOK_URL] with your actual URL
curl -X POST https://[PROJECT_REF].functions.supabase.co/ai-voice-handler \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test123&From=%2B15551234567&To=%2B18778064677&CallStatus=ringing&Direction=inbound"
```

**Expected Response**: TwiML with AI greeting

#### Test 2: Live Phone Call
1. **Call**: `+18778064677`
2. **Listen for**: "Hello and thank you for calling RepMotivatedSeller..."
3. **Speak**: "foreclosure help" or "I need assistance"
4. **Verify**: AI responds with helpful information

#### Test 3: Admin Dashboard
1. Go to your application
2. Navigate to: Admin → AI Calls tab
3. **Verify**: Call appears in real-time with transcript

### Step 5: Troubleshooting

#### Issue: "Webhook URL not reachable"
**Solutions**:
1. Verify your PROJECT_REF is correct
2. Ensure Supabase function is deployed:
   ```bash
   supabase functions deploy ai-voice-handler
   ```
3. Check function status:
   ```bash
   supabase functions list
   ```

#### Issue: "Function returns error"
**Solutions**:
1. Check function logs:
   ```bash
   supabase functions logs ai-voice-handler --follow
   ```
2. Verify environment variables are set:
   ```bash
   supabase secrets list
   ```

#### Issue: "AI doesn't respond"
**Solutions**:
1. Verify OpenAI API key is valid
2. Check if you have OpenAI credits
3. Review function logs for errors

### Step 6: Verify Complete Setup

Your AI call system is working correctly when:

- ✅ Webhook URL is configured in Twilio
- ✅ Test call connects and plays AI greeting
- ✅ Speech recognition works (AI responds to voice)
- ✅ Admin dashboard shows call logs
- ✅ Database stores call transcripts
- ✅ Agent handoff works when requested

## 🎯 Quick Reference

**Your Webhook URL Format**:
```
https://[PROJECT_REF].functions.supabase.co/ai-voice-handler
```

**Twilio Configuration**:
- Voice Webhook: Your webhook URL
- HTTP Method: POST
- Fallback URL: Same as webhook URL

**Test Phone Number**: `+18778064677`

**Admin Dashboard**: Your app → Admin → AI Calls

Need help finding your PROJECT_REF or have issues with configuration? Let me know and I'll assist further!