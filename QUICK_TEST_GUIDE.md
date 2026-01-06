# Quick Test Guide - API Configuration System

## 🧪 Test It Right Now!

Follow these steps to verify everything is working.

---

## Step 1: Start Your Server

```bash
cd /home/aisha/Documents/projects/Gmerge/sparkleville/server
npm run dev
```

**Expected Output:**
```
🔧 Initializing API configurations...
📊 API Configuration Status:
  SendGrid:        ⚠️  Not configured
  Payment:         ⚠️  Not configured
  Google Calendar: ⚠️  Not configured
⚠️  WARNING: The following services are not configured:
   ...
Server is running on port 5000
```

✅ **Success if**: You see the initialization message

---

## Step 2: Test GET Configurations

Check what's currently configured:

```bash
curl http://localhost:5000/api/settings/api-configs
```

**Expected Response:**
```json
{
  "sendgrid": {
    "enabled": false,
    "apiKey": "",
    "configured": false
  },
  "payment": {
    "enabled": false,
    "apiKey": "",
    "configured": false
  },
  "googleCalendar": {
    "enabled": false,
    "apiKey": "",
    "configured": false
  }
}
```

✅ **Success if**: You get JSON response with all services listed

---

## Step 3: Add SendGrid Configuration

```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "apiKey": "SG.test_key_12345678901234567890",
    "fromEmail": "noreply@sparkleville.com"
  }'
```

**Expected Response:**
```json
{
  "enabled": true,
  "apiKey": "SG.test_key...",
  "fromEmail": "noreply@sparkleville.com",
  "configured": true
}
```

✅ **Success if**: API key is masked and configured shows true

---

## Step 4: Verify It Was Saved

Fetch configurations again:

```bash
curl http://localhost:5000/api/settings/api-configs
```

**Expected Output:** `sendgrid` should now show `configured: true`

✅ **Success if**: SendGrid configuration is still there

---

## Step 5: Add Payment Provider

```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/payment \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "apiKey": "sk_test_12345678901234567890",
    "provider": "stripe"
  }'
```

**Expected Response:**
```json
{
  "enabled": true,
  "apiKey": "sk_test_...",
  "provider": "stripe",
  "configured": true
}
```

✅ **Success if**: Payment provider configuration saved

---

## Step 6: Add Google Calendar

```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/googleCalendar \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "apiKey": "AIza_12345678901234567890",
    "calendarId": "primary"
  }'
```

**Expected Response:**
```json
{
  "enabled": true,
  "apiKey": "AIza_...",
  "calendarId": "primary",
  "configured": true
}
```

✅ **Success if**: Google Calendar configuration saved

---

## Step 7: Check Health Status

View overall status of all APIs:

```bash
curl http://localhost:5000/api/settings/integrations/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "services": {
    "sendgrid": true,
    "payment": true,
    "googleCalendar": true
  },
  "timestamp": "2026-01-04T12:00:00Z"
}
```

✅ **Success if**: All services show true and status is "healthy"

---

## Step 8: Test Individual Configuration

Test if SendGrid is working:

```bash
curl -X POST http://localhost:5000/api/settings/api-configs/sendgrid/test
```

**Expected Response:**
```json
{
  "service": "sendgrid",
  "valid": true,
  "message": "sendgrid configuration is valid"
}
```

✅ **Success if**: valid is true (means format is correct)

---

## Step 9: Restart Server and Verify Persistence

1. Stop your server (Ctrl+C)
2. Start it again: `npm run dev`
3. Check if configurations are still there:

```bash
curl http://localhost:5000/api/settings/api-configs
```

**Expected:** All three services should still be configured

✅ **Success if**: Configurations persist after restart

---

## Step 10: Test Update/Edit

Change SendGrid's from email:

```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "fromEmail": "notifications@sparkleville.com"
  }'
```

Verify it was updated:

```bash
curl http://localhost:5000/api/settings/api-configs/sendgrid
```

**Expected:** fromEmail should be the new value

✅ **Success if**: Configuration was updated

---

## Step 11: Test Disable/Enable

Disable SendGrid temporarily:

```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": false
  }'
```

Check health status:

```bash
curl http://localhost:5000/api/settings/integrations/health
```

**Expected:** `sendgrid` should now be false

Re-enable it:

```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true
  }'
```

✅ **Success if**: Enable/disable toggle works

---

## All Tests Complete! ✅

If you've completed all 11 steps and got the expected responses, your API configuration system is **fully functional**!

---

## Next: Test with Real API Keys

Once you verify everything works with test keys, add real API keys:

### Get SendGrid Key
1. Go to https://app.sendgrid.com/settings/api_keys
2. Create a new API key
3. Copy it
4. Use in command:
```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "apiKey": "SG.YOUR_REAL_KEY_HERE",
    "fromEmail": "noreply@sparkleville.com"
  }'
```

### Get Stripe Key
1. Go to https://dashboard.stripe.com/apikeys
2. Copy Secret Key (not Publishable)
3. Use in command:
```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/payment \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "apiKey": "sk_test_YOUR_REAL_KEY_HERE",
    "provider": "stripe"
  }'
```

### Get Google Calendar Key
1. Go to https://console.cloud.google.com/apis/credentials
2. Create API Key or OAuth credentials
3. Use in command:
```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/googleCalendar \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "apiKey": "AIza_YOUR_REAL_KEY_HERE",
    "calendarId": "primary"
  }'
```

---

## Troubleshooting

### Connection Refused
- Make sure server is running on port 5000
- Check: `curl http://localhost:5000/api/health`

### Database Error
- Verify database is running
- Check DATABASE_URL in .env

### Invalid JSON
- Make sure JSON is valid (use JSON validator)
- Check for missing quotes or commas

### Key Format Error
- SendGrid: Must start with "SG."
- Stripe: Must start with "sk_test_" or "sk_live_"
- Google: Must start with "AIza"

### Configuration Not Saving
- Check API response for error message
- Verify database connection
- Check server logs for errors

---

## Useful cURL Tips

### Pretty print JSON response:
```bash
curl http://localhost:5000/api/settings/api-configs | json_pp
```

Or install jq:
```bash
curl http://localhost:5000/api/settings/api-configs | jq .
```

### Save response to file:
```bash
curl http://localhost:5000/api/settings/api-configs > config.json
```

### Get just one API config:
```bash
curl http://localhost:5000/api/settings/api-configs/sendgrid
```

---

## System is Ready! 🎉

Your API configuration system is working correctly. You can now:

✅ Add API keys via cURL
✅ Update configurations
✅ Test configurations
✅ Check health status
✅ Have persistence across restarts

**Next Step**: Build the admin panel UI to make this user-friendly!
See `ADMIN_PANEL_INTEGRATION.md` for React component examples.

---

## Quick Copy-Paste Commands

Save these for quick testing:

```bash
# View all configs
curl http://localhost:5000/api/settings/api-configs

# Add SendGrid (test key)
curl -X PATCH http://localhost:5000/api/settings/api-configs/sendgrid -H "Content-Type: application/json" -d '{"enabled": true, "apiKey": "SG.test_key", "fromEmail": "test@example.com"}'

# Add Payment (test key)
curl -X PATCH http://localhost:5000/api/settings/api-configs/payment -H "Content-Type: application/json" -d '{"enabled": true, "apiKey": "sk_test_key", "provider": "stripe"}'

# Add Google Calendar (test key)
curl -X PATCH http://localhost:5000/api/settings/api-configs/googleCalendar -H "Content-Type: application/json" -d '{"enabled": true, "apiKey": "AIza_test_key", "calendarId": "primary"}'

# Check health
curl http://localhost:5000/api/settings/integrations/health

# Test SendGrid
curl -X POST http://localhost:5000/api/settings/api-configs/sendgrid/test
```

**That's it! Go test it out!** 🚀
