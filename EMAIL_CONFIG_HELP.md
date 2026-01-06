# Email Configuration Issues & Solutions

## Current Problem
The email service is not sending emails to users regarding activities (booking confirmations, reminders, notifications, etc.). This is because the `.env` file is missing the email service configuration.

## How Email Service Works

The system supports **three email methods** in order of priority:

1. **Mailtrap** (Development/Testing) - If you want to test emails without sending real emails
2. **SendGrid** (Production) - For real email sending

### Method 1: Using Mailtrap (Recommended for Development)

Mailtrap is a free service for testing emails. No real emails are sent, perfect for development.

**Steps:**
1. Go to https://mailtrap.io and sign up for free
2. Create a new inbox
3. Go to "Integrations" > "NodeJS Nodemailer"
4. You'll see credentials like:
   ```
   Host: sandbox.smtp.mailtrap.io
   Port: 2525
   Username: xxxxx (copy this)
   Password: xxxxx (copy this)
   ```
5. Add these to your `.env` file:
   ```
   MAILTRAP_USER=your_username_here
   MAILTRAP_PASS=your_password_here
   ```
6. Restart your server

### Method 2: Using SendGrid (Recommended for Production)

SendGrid is for sending real emails. You can use their free tier for up to 100 emails/day.

**Steps:**
1. Go to https://sendgrid.com and sign up for free
2. Create an API key:
   - Go to "Settings" > "API Keys"
   - Click "Create API Key"
   - Give it a name like "Sparkleville"
   - Copy the generated key (it starts with `SG.`)
3. Add this to your `.env` file:
   ```
   SENDGRID_API_KEY=SG.your_api_key_here
   ```
4. Also ensure the "From" email in your database settings is a verified sender in SendGrid:
   - Go to "Sender Authentication" in SendGrid
   - Verify your sender email (the one in your database settings as general.email)

## Current `.env` Status

Your `.env` file is missing these variables. You need to add at least one of the above methods.

## Checking If It's Working

1. Check server logs for messages like:
   - `✅ Mailtrap transporter initialized` (for Mailtrap)
   - `✅ SendGrid initialized with API key from environment variable` (for SendGrid)

2. Or error messages like:
   - `⚠️ Email transport not initialized, skipping email send` (no configuration found)

## Database Settings

You can also configure SendGrid API key in the database via the Admin Dashboard:
- Go to Admin Dashboard > Settings > Integrations
- Look for SendGrid configuration
- Enable it and paste your API key

However, **environment variables take priority**, so adding it to `.env` is the recommended approach.

## What's Currently In .env

```
DATABASE_URL="postgresql://postgres:123456@localhost:5432/sparkleville"
PORT=5000
VITE_API_URL=http://localhost:5000/api
GOOGLE_DRIVE_*=*** (Google Drive credentials)
GOOGLE_SHARED_DRIVE_ID=""
```

**Missing:**
- `SENDGRID_API_KEY` or `MAILTRAP_USER`/`MAILTRAP_PASS`

## Quick Fix

Pick one method above and add the credentials to your `.env` file, then restart your server.
