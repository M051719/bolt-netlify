# 🔗 Webhook URL Configuration Guide

## Your Webhook URL Format

Once you deploy your Supabase function, your webhook URL will be:
```
https://[YOUR_PROJECT_REF].functions.supabase.co/ai-voice-handler
```

## Finding Your Project Reference

### Method 1: From .env File
```bash
# Look for this line in your .env file:
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co

# Example: if URL is https://abcdefghijklmnop.supabase.co
# Then PROJECT_REF is: abcdefghijklmnop
```

### Method 2: From Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Look at browser URL: `https://supabase.com/dashboard/project/[PROJECT_REF]`
4. The PROJECT_REF is the long string after `/project/`

### Method 3: From Project Settings
1. Supabase Dashboard → Settings → General
2. Find "Reference ID" - this is your PROJECT_REF

## Complete Twilio Configuration

### Step 1: Access Twilio Console
- Go to: https://console.twilio.com
- Login with your Twilio account

### Step 2: Configure Phone Number
1. Click **Phone Numbers** → **Manage** → **Active Numbers**
2. Click on: `+18778064677`
3. In the **Voice Configuration** section:

```
Voice Configuration:
┌─────────────────────────────────────────────────────┐
│ A call comes in:                                    │
│ ○ TwiML App                                        │
│ ● Webhook  ← Select this option                    │
│                                                     │
│ URL: https://[PROJECT_REF].functions.supabase.co/ai-voice-handler │
│ HTTP: POST ▼                                       │
│                                                     │
│ Primary handler fails:                              │
│ URL: https://[PROJECT_REF].functions.supabase.co/ai-voice-handler │
│ HTTP: POST ▼                                       │
└─────────────────────────────────────────────────────┘
```

4. Click **Save Configuration**

## Test Your Configuration

### Test 1: Function Accessibility
```bash
# Replace [PROJECT_REF] with your actual project reference
curl -X POST https://[PROJECT_REF].functions.supabase.co/ai-voice-handler \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test&From=%2B15551234567&To=%2B18778064677&CallStatus=ringing"
```

**Expected Response**: TwiML with AI greeting

### Test 2: Live Call
1. **Dial**: `+18778064677`
2. **Listen for**: "Hello and thank you for calling RepMotivatedSeller..."
3. **Speak**: "foreclosure help"
4. **Verify**: AI responds appropriately

## Troubleshooting

### Issue: "Webhook not accessible"
- Ensure function is deployed: `supabase functions deploy ai-voice-handler`
- Check PROJECT_REF is correct
- Verify URL has no extra characters

### Issue: "Application error"
- Check function logs: `supabase functions logs ai-voice-handler`
- Verify environment variables are set
- Ensure database tables exist

### Issue: Music plays instead of AI
- Verify "Webhook" is selected (not "TwiML App")
- Check webhook URL is exactly correct
- Ensure HTTP method is POST

## Success Indicators

✅ **Webhook URL configured in Twilio**
✅ **Function responds to test requests**
✅ **Phone calls connect to AI**
✅ **Speech recognition works**
✅ **Admin dashboard shows calls**

Your AI call system will be fully operational once the webhook is properly configured! 📞