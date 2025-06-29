# Finding Your Supabase Project Reference

## 🔍 Multiple Ways to Find Your Project Reference

### Method 1: Check Your .env File
Look for your `VITE_SUPABASE_URL` in your `.env` file:
```bash
# Your URL looks like this:
VITE_SUPABASE_URL=https://[PROJECT_REF].supabase.co

# The PROJECT_REF is the part before .supabase.co
# Example: if URL is https://abcdefghijklmnop.supabase.co
# Then PROJECT_REF is: abcdefghijklmnop
```

### Method 2: Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Look at the URL in your browser: `https://supabase.com/dashboard/project/[PROJECT_REF]`
4. The PROJECT_REF is in the URL

### Method 3: Project Settings
1. In Supabase Dashboard → Settings → General
2. Find "Reference ID" - this is your PROJECT_REF

## 🎯 Your Webhook URL Format

Once you have your PROJECT_REF, your webhook URL will be:
```
https://[PROJECT_REF].functions.supabase.co/ai-voice-handler
```

## 🔧 Complete Twilio Configuration Steps

### Step 1: Get Your Exact Webhook URL
Replace `[PROJECT_REF]` with your actual project reference:
```
https://[PROJECT_REF].functions.supabase.co/ai-voice-handler
```

### Step 2: Configure in Twilio Console

1. **Login to Twilio Console**
   - Go to: https://console.twilio.com
   - Login with your Twilio account

2. **Navigate to Phone Numbers**
   - Click: **Phone Numbers** in left sidebar
   - Click: **Manage** → **Active Numbers**
   - Find and click: `+18778064677`

3. **Configure Voice Webhook**
   ```
   Voice Configuration Section:
   ┌─────────────────────────────────────────┐
   │ A call comes in:                        │
   │ ○ TwiML App                            │
   │ ● Webhook                              │
   │                                        │
   │ URL: [YOUR_WEBHOOK_URL]                │
   │ HTTP: POST ▼                          │
   │                                        │
   │ Primary handler fails:                 │
   │ URL: [SAME_WEBHOOK_URL]               │
   │ HTTP: POST ▼                          │
   └─────────────────────────────────────────┘
   ```

4. **Save Configuration**
   - Click **Save Configuration** at the bottom

### Step 3: Test Your Configuration

#### Test 1: Webhook Connectivity
```bash
# Replace [YOUR_WEBHOOK_URL] with your actual URL
curl -X POST [YOUR_WEBHOOK_URL] \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test123&From=%2B15551234567&To=%2B18778064677&CallStatus=ringing"
```

#### Test 2: Make a Live Call
1. Call: `+18778064677`
2. Listen for AI greeting
3. Say: "foreclosure help"
4. Verify AI responds

#### Test 3: Check Admin Dashboard
1. Go to your app → Admin → AI Calls
2. Verify call appears in real-time

## 🚨 Common Issues and Solutions

### Issue 1: "Webhook URL not accessible"
**Solution**: Ensure your Supabase function is deployed
```bash
supabase functions deploy ai-voice-handler
```

### Issue 2: "Function not found"
**Solution**: Check if function exists
```bash
supabase functions list
```

### Issue 3: "Environment variables missing"
**Solution**: Set required secrets
```bash
supabase secrets set OPENAI_API_KEY=your_key_here
supabase secrets set TWILIO_ACCOUNT_SID=your_sid_here
```

## 📞 Expected Call Flow

1. **Caller dials**: `+18778064677`
2. **Twilio receives**: Incoming call
3. **Twilio sends**: POST request to your webhook
4. **Your function**: Processes request and returns TwiML
5. **Twilio plays**: AI greeting to caller
6. **Caller speaks**: Voice input captured
7. **OpenAI processes**: Speech and generates response
8. **AI responds**: With helpful information
9. **Database logs**: All interactions stored

## 🎯 Quick Setup Checklist

- [ ] Find your PROJECT_REF from Supabase dashboard
- [ ] Construct webhook URL: `https://[PROJECT_REF].functions.supabase.co/ai-voice-handler`
- [ ] Login to Twilio Console
- [ ] Navigate to Phone Numbers → Active Numbers
- [ ] Click on `+18778064677`
- [ ] Set webhook URL in Voice Configuration
- [ ] Set HTTP method to POST
- [ ] Save configuration
- [ ] Test with a phone call
- [ ] Verify in admin dashboard

Need help with any of these steps? Let me know your PROJECT_REF and I can provide the exact webhook URL!