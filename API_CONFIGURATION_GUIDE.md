# API Configuration System Documentation

## Overview

The API Configuration System allows you to manage third-party API integrations (SendGrid, Payment Provider, Google Calendar) through the admin panel without hardcoding credentials in the codebase.

## Architecture

### Components

1. **APIConfigService** (`server/src/utils/api-config.service.ts`)
   - Core service for managing API configurations
   - Stores configs in the database (`SystemSettings.integrations`)
   - Provides fallback to environment variables

2. **APIInitializationService** (`server/src/utils/api-initialization.service.ts`)
   - Initializes and validates API configs on server startup
   - Checks health status of all integrations
   - Ensures APIs are properly configured before use

3. **Settings Controller** (`server/src/controllers/settings.controller.ts`)
   - Handles API configuration CRUD operations
   - Provides endpoints for testing API connections
   - Returns masked API keys for security

4. **Settings Routes** (`server/src/routes/settings.routes.ts`)
   - REST endpoints for managing API configurations

## Supported APIs

### 1. SendGrid (Email Service)
```typescript
{
  sendgrid: {
    enabled: boolean,
    apiKey: string,        // Must start with "SG."
    fromEmail?: string     // Default sender email
  }
}
```

### 2. Payment Provider
```typescript
{
  payment: {
    enabled: boolean,
    apiKey: string,        // Stripe: starts with "sk_test_" or "sk_live_"
    secretKey?: string,    // Additional secret if needed
    provider: 'stripe' | 'square' | 'other'
  }
}
```

### 3. Google Calendar
```typescript
{
  googleCalendar: {
    enabled: boolean,
    apiKey?: string,                    // API key approach (starts with "AIza")
    clientId?: string,                  // OAuth approach
    clientSecret?: string,              // OAuth approach
    calendarId?: string,                // Specific calendar ID
    refreshToken?: string               // OAuth refresh token
  }
}
```

## API Endpoints

### Get All Configurations (Admin Only)
```
GET /api/settings/api-configs
Response:
{
  sendgrid: {
    enabled: true,
    apiKey: "SG.abc123...",     // Masked for security
    fromEmail: "noreply@example.com",
    configured: true
  },
  payment: {
    enabled: true,
    apiKey: "sk_test_abc...",   // Masked for security
    provider: "stripe",
    configured: true
  },
  googleCalendar: {
    enabled: true,
    apiKey: "AIza_abc...",      // Masked for security
    calendarId: "primary",
    configured: true
  }
}
```

### Get Specific Configuration
```
GET /api/settings/api-configs/:name
Params: name = 'sendgrid' | 'payment' | 'googleCalendar'

Response:
{
  enabled: true,
  apiKey: "SG.abc123...",  // Masked
  configured: true,
  ...otherFields
}
```

### Update Configuration
```
PATCH /api/settings/api-configs/:name
Body:
{
  apiKey: "SG.new_key_here",
  enabled: true,
  fromEmail: "noreply@example.com"    // For SendGrid
}

Response:
{
  enabled: true,
  apiKey: "SG.new_key...",  // Masked
  configured: true
}
```

### Test Configuration
```
POST /api/settings/api-configs/:name/test

Response:
{
  service: "sendgrid",
  valid: true,
  message: "sendgrid configuration is valid"
}
```

### Check Integration Health
```
GET /api/settings/integrations/health

Response:
{
  status: "healthy" | "degraded",
  services: {
    sendgrid: true,
    payment: true,
    googleCalendar: false
  },
  timestamp: "2026-01-04T12:00:00Z"
}
```

## Database Storage

Configurations are stored in the `SystemSettings` model under the `integrations` JSON field:

```typescript
model SystemSettings {
  id           String   @id @default("default")
  integrations Json     // Stores API configurations
  updatedAt    DateTime @updatedAt
}
```

## Usage in Services

### Getting API Configuration in Your Service

```typescript
import { APIConfigService } from '../utils/api-config.service';

// Get specific configuration
const sendgridConfig = await APIConfigService.getConfig('sendgrid');

// Use the API key
if (sendgridConfig?.enabled && sendgridConfig?.apiKey) {
  sgMail.setApiKey(sendgridConfig.apiKey);
}
```

### With Validation

```typescript
import { getSecureAPIConfig, ensureAPIConfigured } from '../utils/api-initialization.service';

// This will throw an error if not configured
try {
  const config = await getSecureAPIConfig('sendgrid');
  sgMail.setApiKey(config.apiKey);
} catch (error) {
  console.error('SendGrid not configured:', error.message);
}
```

### Checking Health Status

```typescript
import { APIConfigService } from '../utils/api-config.service';

const health = await APIConfigService.checkHealthStatus();

if (!health.sendgrid) {
  // SendGrid is not configured, handle gracefully
  console.warn('Email service is not available');
}
```

## Security Features

1. **Masked Keys in Responses**: API keys are never returned in full. Only the first 10 characters are shown followed by "..."

2. **Key Format Validation**: 
   - SendGrid: Must start with "SG."
   - Stripe: Must start with "sk_test_" or "sk_live_"
   - Google Calendar: Must start with "AIza"

3. **Fallback to Environment Variables**: 
   - If configuration is missing from database, the system falls back to environment variables
   - Ensures backward compatibility

4. **Environment Variable Support**:
   ```bash
   SENDGRID_API_KEY=SG.your_key_here
   SENDGRID_FROM_EMAIL=noreply@example.com
   STRIPE_SECRET_KEY=sk_test_your_key_here
   GOOGLE_CALENDAR_API_KEY=AIza_your_key_here
   GOOGLE_CALENDAR_ID=primary
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

## Server Startup Logging

When the server starts, it checks all API configurations:

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

## Implementation Steps

1. **Add API Keys via Admin Panel**
   - Make a PATCH request to `/api/settings/api-configs/sendgrid`
   - Include your API key in the request body

2. **Test Configuration**
   - Use POST `/api/settings/api-configs/sendgrid/test` to validate
   - Check `/api/settings/integrations/health` for overall status

3. **Use in Your Services**
   - Import `APIConfigService` or use helper functions
   - Call `getConfig()` to retrieve the API key
   - The system automatically falls back to .env if needed

## Error Handling

The system is designed to be graceful with missing configurations:

1. **Missing Configuration**: Service will log a warning but not crash
2. **Invalid Key**: Validation will return `false`, service should handle gracefully
3. **Database Error**: Falls back to environment variables
4. **API Validation Failure**: Returns error message with service name

## Example: Setting Up SendGrid

```bash
# 1. Make API request to configure SendGrid
curl -X PATCH http://localhost:5000/api/settings/api-configs/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "apiKey": "SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "fromEmail": "noreply@sparkleville.com"
  }'

# 2. Test the configuration
curl -X POST http://localhost:5000/api/settings/api-configs/sendgrid/test

# 3. Check health
curl http://localhost:5000/api/settings/integrations/health
```

## Troubleshooting

### "Service not configured" Error
- Check if API key is added via Admin Panel
- Verify key format matches expected pattern
- Check environment variables as fallback

### "Configuration appears to be invalid"
- Verify API key is correct
- Check key format (e.g., SendGrid should start with "SG.")
- Log in to API provider's dashboard to verify key is active

### Keys not persisting
- Check database connection
- Verify `SystemSettings` table exists in database
- Check for database permission issues

## Future Enhancements

1. Encrypt sensitive data at rest in database
2. Add audit logging for configuration changes
3. Implement configuration versioning
4. Add more API providers (Twilio, etc.)
5. Support for multiple API keys per provider
