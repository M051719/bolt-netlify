# 🚨 Fix Twilio Webhook - No More Music!

## The Problem
Your Twilio number is playing music instead of the AI greeting because:
- Webhook URL might not be configured correctly
- Twilio might be using a TwiML app instead of webhook
- Function might not be deployed or accessible

## 🔧 Step-by-Step Fix

### Step 1: Find Your Exact Project Reference
From your previous message, your project name is: **ptqawicbwbenjhjkhcb**

Your webhook URL should be:
```
https://ptqawicbwbenjhjkhcb.functions.supabase.co/ai-voice-handler
```

### Step 2: Deploy the Function First
```bash
# Make sure the function is deployed
supabase functions deploy ai-voice-handler

# Verify it's deployed
supabase functions list
```

### Step 3: Test Function Accessibility
```bash
# Test if your function responds
curl -X POST https://ptqawicbwbenjhjkhcb.functions.supabase.co/ai-voice-handler \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test123&From=%2B15551234567&To=%2B18778064677&CallStatus=ringing&Direction=inbound"
```

**Expected Response**: Should return TwiML with AI greeting

### Step 4: Fix Twilio Configuration

1. **Go to Twilio Console**: https://console.twilio.com
2. **Navigate to**: Phone Numbers → Manage → Active Numbers
3. **Click on**: `+18778064677`
4. **In Voice Configuration section**:

```
CRITICAL: Make sure these settings are EXACTLY like this:

┌─────────────────────────────────────────────────────┐
│ A call comes in:                                    │
│ ○ TwiML App     ← MAKE SURE THIS IS NOT SELECTED   │
│ ● Webhook       ← SELECT THIS OPTION               │
│                                                     │
│ URL: https://ptqawicbwbenjhjkhcb.functions.supabase.co/ai-voice-handler │
│ HTTP: POST ▼                                       │
│                                                     │
│ Primary handler fails:                              │
│ URL: https://ptqawicbwbenjhjkhcb.functions.supabase.co/ai-voice-handler │
│ HTTP: POST ▼                                       │
└─────────────────────────────────────────────────────┘
```

5. **Click "Save Configuration"**

### Step 5: Verify Environment Variables
```bash
# Check if secrets are set in Supabase
supabase secrets list

# If missing, set them:
supabase secrets set OPENAI_API_KEY=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

supabase secrets set TWILIO_ACCOUNT_SID=ACe525412ae7e0751b4d9533d48b348066
supabase secrets set TWILIO_AUTH_TOKEN=4f1f31f680db649380efc82b041129a0
supabase secrets set AGENT_PHONE_NUMBER=+18778064677
```

### Step 6: Test Again
1. **Call**: `+18778064677`
2. **Should hear**: "Hello and thank you for calling RepMotivatedSeller..."
3. **No more music!**

## 🔍 If Still Having Issues

### Check Function Logs
```bash
# Watch logs in real-time
supabase functions logs ai-voice-handler --follow

# Then make a test call and see what happens
```

### Common Issues:

**Issue 1: Function not deployed**
```bash
supabase functions deploy ai-voice-handler
```

**Issue 2: Wrong webhook URL**
- Must be exactly: `https://ptqawicbwbenjhjkhcb.functions.supabase.co/ai-voice-handler`
- No extra characters or spaces

**Issue 3: TwiML App selected instead of Webhook**
- In Twilio console, make sure "Webhook" radio button is selected
- NOT "TwiML App"

**Issue 4: Function returns error**
- Check logs: `supabase functions logs ai-voice-handler`
- Verify environment variables are set

## 🎯 Success Indicators

✅ **No music playing**
✅ **AI greeting plays**: "Hello and thank you for calling RepMotivatedSeller..."
✅ **Speech recognition works**
✅ **Call appears in admin dashboard**

The key is making sure Twilio is configured to use **Webhook** not **TwiML App**!