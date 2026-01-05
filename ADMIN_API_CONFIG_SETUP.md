# API Configuration Setup Guide for Admin Panel

## Quick Start: Adding Your API Keys

### Step 1: SendGrid Configuration

1. Get your SendGrid API Key:
   - Visit https://app.sendgrid.com/settings/api_keys
   - Create a new API key or copy an existing one
   - Key format: `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. Configure via API:
```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "apiKey": "SG.YOUR_API_KEY_HERE",
    "fromEmail": "noreply@sparkleville.com"
  }'
```

3. Verify configuration:
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

---

### Step 2: Payment Provider Configuration

#### For Stripe:

1. Get your Stripe Secret Key:
   - Visit https://dashboard.stripe.com/apikeys
   - Copy your Secret Key (starts with `sk_test_` for testing or `sk_live_` for production)

2. Configure via API:
```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/payment \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "apiKey": "sk_test_YOUR_SECRET_KEY_HERE",
    "provider": "stripe"
  }'
```

3. Verify configuration:
```bash
curl -X POST http://localhost:5000/api/settings/api-configs/payment/test
```

#### For Square:

```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/payment \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "apiKey": "sq_YOUR_API_KEY_HERE",
    "provider": "square"
  }'
```

---

### Step 3: Google Calendar Configuration

#### Option A: Using API Key

1. Get your Google Calendar API Key:
   - Visit https://console.cloud.google.com/apis/credentials
   - Create an API key (restricted to Google Calendar API)
   - Key format: `AIza_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. Configure via API:
```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/googleCalendar \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "apiKey": "AIza_YOUR_API_KEY_HERE",
    "calendarId": "primary"
  }'
```

#### Option B: Using OAuth Credentials

```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/googleCalendar \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "clientId": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "clientSecret": "YOUR_CLIENT_SECRET_HERE",
    "calendarId": "primary",
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

3. Verify configuration:
```bash
curl -X POST http://localhost:5000/api/settings/api-configs/googleCalendar/test
```

---

## Check Overall Integration Health

View the status of all configured APIs:

```bash
curl http://localhost:5000/api/settings/integrations/health
```

**Response Example:**
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

---

## Viewing Current Configuration

Get all configurations (keys are masked for security):

```bash
curl http://localhost:5000/api/settings/api-configs
```

**Response:**
```json
{
  "sendgrid": {
    "enabled": true,
    "apiKey": "SG.abc123...",
    "fromEmail": "noreply@sparkleville.com",
    "configured": true
  },
  "payment": {
    "enabled": true,
    "apiKey": "sk_test_abc123...",
    "provider": "stripe",
    "configured": true
  },
  "googleCalendar": {
    "enabled": true,
    "apiKey": "AIza_abc123...",
    "calendarId": "primary",
    "configured": true
  }
}
```

---

## Disabling Services

You can disable a service without removing the key:

```bash
curl -X PATCH http://localhost:5000/api/settings/api-configs/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": false
  }'
```

---

## Environment Variable Fallback

If your admin panel isn't ready yet, you can add these to your `.env` file temporarily:

```env
# SendGrid
SENDGRID_API_KEY=SG.YOUR_API_KEY_HERE
SENDGRID_FROM_EMAIL=noreply@sparkleville.com

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Google Calendar
GOOGLE_CALENDAR_API_KEY=AIza_YOUR_API_KEY_HERE
GOOGLE_CALENDAR_ID=primary
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
```

The system will automatically use these if database configurations aren't found.

---

## Server Startup Verification

When your server starts, it will display:

```
🔧 Initializing API configurations...
📊 API Configuration Status:
  SendGrid:        ✅ Configured
  Payment:         ✅ Configured
  Google Calendar: ✅ Configured
✅ All critical APIs are configured and ready!
```

Or if missing:

```
🔧 Initializing API configurations...
📊 API Configuration Status:
  SendGrid:        ✅ Configured
  Payment:         ✅ Configured
  Google Calendar: ⚠️  Not configured
⚠️  WARNING: The following services are not configured:
   - Google Calendar (calendar management)
   Please configure these from the Admin Panel to enable full functionality.
```

---

## Troubleshooting Common Issues

### "Invalid API Key" Error

**SendGrid:**
- Ensure key starts with `SG.`
- Verify key is active in SendGrid dashboard
- Check for extra spaces or characters

**Stripe:**
- Use Secret Key, not Publishable Key
- Key should start with `sk_test_` (test) or `sk_live_` (production)
- Verify it's from the correct account

**Google Calendar:**
- For API key: Must start with `AIza`
- For OAuth: Ensure secrets match your Google Cloud project
- Test in Google Cloud Console first

### Configuration Not Persisting

- Check database connection is working
- Verify `SystemSettings` table exists
- Check for database write permissions
- Try adding to `.env` as temporary workaround

### "Service Enabled but API Key Not Found"

- Make sure full API key is provided, not masked version
- Check for typos in the API endpoint
- Verify you're making PATCH request (not GET or POST)

---

## Getting Your API Keys

### SendGrid
1. Go to https://app.sendgrid.com
2. Sign in to your account
3. Navigate to **Settings → API Keys**
4. Create a new key or copy existing one

### Stripe
1. Go to https://dashboard.stripe.com
2. Sign in to your account
3. Navigate to **Developers → API Keys**
4. Copy your Secret Key (not the Publishable Key)

### Google Calendar
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create credentials (API Key or OAuth)
5. Copy the credentials

---

## Next Steps

1. ✅ Add SendGrid key for email notifications
2. ✅ Add Payment provider key for checkout
3. ✅ Add Google Calendar key for booking management
4. ✅ Run health check to verify all working
5. ✅ Monitor logs on server startup

Once all APIs are configured, your application will have full functionality!
