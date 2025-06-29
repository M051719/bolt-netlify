# 🚨 Fix Application Error - Complete Solution

## The Problem
"Application error" means your Supabase function either:
1. Isn't deployed properly
2. Has environment variable issues
3. Has code errors
4. Database connection problems

## 🔧 Step-by-Step Fix

### Step 1: Deploy Function Properly
```bash
# First, make sure you're logged into Supabase
supabase login

# Link to your project
supabase link --project-ref ptqawicbwbenjhjkhcb

# Deploy the function
supabase functions deploy ai-voice-handler

# Verify deployment
supabase functions list
```

### Step 2: Set All Required Environment Variables
```bash
# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=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

# Set Twilio credentials
supabase secrets set TWILIO_ACCOUNT_SID=ACe525412ae7e0751b4d9533d48b348066
supabase secrets set TWILIO_AUTH_TOKEN=4f1f31f680db649380efc82b041129a0

# Set phone numbers
supabase secrets set AGENT_PHONE_NUMBER=+18778064677
supabase secrets set SCHEDULING_PHONE_NUMBER=+18778064677

# Set OpenAI model
supabase secrets set OPENAI_MODEL=gpt-3.5-turbo

# Verify all secrets are set
supabase secrets list
```

### Step 3: Test Function Directly
```bash
# Test the function endpoint
curl -X POST https://ptqawicbwbenjhjkhcb.functions.supabase.co/ai-voice-handler \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=test123&From=%2B15551234567&To=%2B18778064677&CallStatus=ringing&Direction=inbound"
```

**Expected Response**: Should return TwiML XML, not an error

### Step 4: Check Function Logs
```bash
# Watch logs in real-time
supabase functions logs ai-voice-handler --follow

# In another terminal, make a test call or curl request
# Check what errors appear in the logs
```

### Step 5: Verify Database Tables Exist
```bash
# Check if AI call tables exist
supabase db reset

# Or manually check tables
psql "postgresql://postgres:[PASSWORD]@db.ptqawicbwbenjhjkhcb.supabase.co:5432/postgres" -c "\dt"
```

### Step 6: Fix Common Issues

#### Issue A: Function Code Errors
If there are syntax errors in the function, redeploy:
```bash
# Check function exists
ls supabase/functions/ai-voice-handler/

# Redeploy
supabase functions deploy ai-voice-handler --debug
```

#### Issue B: Database Connection
```bash
# Test database connection
supabase db ping

# If connection fails, check your database password
```

#### Issue C: Missing Dependencies
The function might be missing imports. Let's check the function code:
```bash
# View function content
cat supabase/functions/ai-voice-handler/index.ts
```

### Step 7: Alternative Simple Test Function

If the main function has issues, let's deploy a simple test function first:

```bash
# Create a simple test function
mkdir -p supabase/functions/test-webhook
```

Create `supabase/functions/test-webhook/index.ts`:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  console.log('Webhook called!', req.method)
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  // Simple TwiML response
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello! This is a test from RepMotivatedSeller. Your webhook is working!</Say>
</Response>`

  return new Response(twiml, {
    headers: { 'Content-Type': 'text/xml' }
  })
})
```

Deploy test function:
```bash
supabase functions deploy test-webhook
```

Test it:
```bash
curl -X POST https://ptqawicbwbenjhjkhcb.functions.supabase.co/test-webhook
```

### Step 8: Update Twilio to Use Test Function

Temporarily update Twilio webhook to:
```
https://ptqawicbwbenjhjkhcb.functions.supabase.co/test-webhook
```

Make a test call - you should hear "Hello! This is a test..."

## 🔍 Debugging Commands

```bash
# Check project status
supabase status

# Check function deployment
supabase functions list

# Check secrets
supabase secrets list

# View recent logs
supabase functions logs ai-voice-handler --limit 50

# Test database
supabase db ping
```

## 🎯 Expected Results

After fixing:
- ✅ Function deploys without errors
- ✅ Curl test returns TwiML (not application error)
- ✅ Phone call plays greeting (not music)
- ✅ Function logs show successful execution
- ✅ No "application error" messages

## 🚨 If Still Getting Errors

1. **Check function logs**: `supabase functions logs ai-voice-handler --follow`
2. **Try the simple test function first**
3. **Verify all environment variables are set**
4. **Make sure database tables exist**
5. **Check Supabase project status**

Let me know what you see in the function logs and I'll help debug further!