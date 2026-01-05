# API Configuration System - Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Your Application                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Frontend Services (Email, Payment, Calendar)            │
│           ↓                                               │
│  APIConfigService.getConfig('service_name')             │
│           ↓                                               │
│  Database (SystemSettings.integrations) OR .env          │
│           ↓                                               │
│  ✅ Returns configured API keys ready to use            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Data Flow: Adding an API Key

```
Step 1: Admin enters API key in form
        │
        ▼
Step 2: POST /api/settings/api-configs/sendgrid
        │
        ▼
Step 3: Settings Controller receives request
        │
        ▼
Step 4: APIConfigService validates key format
        │
        ├─ ✅ Valid → Continue
        └─ ❌ Invalid → Return error
        │
        ▼
Step 5: Save to Database (SystemSettings)
        │
        ▼
Step 6: Return masked response to admin
        (SG.abc123... instead of full key)
        │
        ▼
Step 7: Services can now use the API key
```

## Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│           API Configuration System                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────┐            │
│  │ APIConfigService (Core)                  │            │
│  ├─────────────────────────────────────────┤            │
│  │ • getConfigs()                           │            │
│  │ • getConfig(name)                        │            │
│  │ • updateConfigs(updates)                 │            │
│  │ • updateConfig(name, config)             │            │
│  │ • validateConfig(name)                   │            │
│  │ • checkHealthStatus()                    │            │
│  └─────────────────────────────────────────┘            │
│                    ↓                                      │
│  ┌─────────────────────────────────────────┐            │
│  │ APIInitializationService                 │            │
│  ├─────────────────────────────────────────┤            │
│  │ • initializeAPIConfigs()                 │            │
│  │ • ensureAPIConfigured(name)              │            │
│  │ • getSecureAPIConfig(name)               │            │
│  └─────────────────────────────────────────┘            │
│                    ↓                                      │
│  ┌─────────────────────────────────────────┐            │
│  │ Settings Controller + Routes             │            │
│  ├─────────────────────────────────────────┤            │
│  │ • getAPIConfigs()                        │            │
│  │ • getAPIConfig(:name)                    │            │
│  │ • updateAPIConfig(:name)                 │            │
│  │ • testAPIConfig(:name)                   │            │
│  │ • getIntegrationHealth()                 │            │
│  └─────────────────────────────────────────┘            │
│                    ↓                                      │
│  ┌─────────────────────────────────────────┐            │
│  │ Database + Environment Variables         │            │
│  ├─────────────────────────────────────────┤            │
│  │ • SystemSettings.integrations (JSON)     │            │
│  │ • .env file (fallback)                   │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Configuration Storage Structure

```
Database (PostgreSQL)
├── SystemSettings table
│   ├── id: "default"
│   ├── integrations: JSON
│   │   ├── sendgrid: {
│   │   │   ├── enabled: true
│   │   │   ├── apiKey: "SG.xxx..."
│   │   │   └── fromEmail: "noreply@example.com"
│   │   ├── payment: {
│   │   │   ├── enabled: true
│   │   │   ├── apiKey: "sk_test_xxx..."
│   │   │   └── provider: "stripe"
│   │   └── googleCalendar: {
│   │       ├── enabled: true
│   │       ├── apiKey: "AIza_xxx..."
│   │       └── calendarId: "primary"
│   └── updatedAt: timestamp
```

## API Request Flow

```
Admin Panel UI
    │
    ├─ Form Submission
    │       │
    │       ▼
    │  PATCH /api/settings/api-configs/sendgrid
    │  {
    │    "apiKey": "SG.xxx...",
    │    "enabled": true,
    │    "fromEmail": "noreply@example.com"
    │  }
    │       │
    │       ▼
    │  Settings Controller
    │       │
    │       ├─ Validate API key format
    │       ├─ Merge with existing config
    │       ├─ Save to database
    │       │
    │       ▼
    │  Response (masked key)
    │  {
    │    "enabled": true,
    │    "apiKey": "SG.abc123...",
    │    "fromEmail": "noreply@example.com",
    │    "configured": true
    │  }
    │       │
    │       ▼
    │  UI shows success message
    │       │
    │       ▼
    │  Services can now use it!
```

## Service Integration Pattern

```
Your Email Service
    │
    ├─ import { APIConfigService } from '../utils/api-config.service'
    │
    ├─ async function sendEmail(...) {
    │     try {
    │       // 1. Get configuration
    │       const config = await APIConfigService.getConfig('sendgrid')
    │       
    │       // 2. Validate it exists and is enabled
    │       if (!config?.enabled || !config?.apiKey) {
    │         throw new Error('SendGrid not configured')
    │       }
    │       
    │       // 3. Use the API key
    │       sgMail.setApiKey(config.apiKey)
    │       await sgMail.send({ ... })
    │       
    │     } catch (error) {
    │       // Handle errors gracefully
    │       console.error('Email service unavailable:', error)
    │     }
    │   }
```

## Status Check Timeline

```
Server Start
    │
    ▼
Load dotenv variables
    │
    ▼
Initialize Express app
    │
    ▼
🔧 Initialize API Configurations
    │
    ├─ Check SendGrid... ✅ Configured
    ├─ Check Payment...   ✅ Configured
    └─ Check Google Cal.. ⚠️  Not configured
    │
    ▼
📊 Display Status Report
    │
    ▼
🚀 Server Ready
    │
    ├─ All endpoints available
    ├─ Health check endpoint active
    └─ Services can use APIs
```

## Key Features at a Glance

```
┌──────────────────────────────────────────┐
│         API Configuration System          │
├──────────────────────────────────────────┤
│                                            │
│ ✅ Multi-API Support                      │
│    • SendGrid (email)                     │
│    • Payment Providers (stripe, square)   │
│    • Google Calendar (bookings)           │
│                                            │
│ ✅ Secure Storage                         │
│    • Database storage with JSON           │
│    • Masked keys in responses             │
│    • Format validation                    │
│                                            │
│ ✅ Flexible Configuration                 │
│    • Database first (recommended)         │
│    • Environment variables fallback       │
│    • Easy switching between sources       │
│                                            │
│ ✅ Health Monitoring                      │
│    • Server startup checks                │
│    • Runtime health status                │
│    • Configuration validation             │
│                                            │
│ ✅ Easy Integration                       │
│    • Simple getConfig() calls             │
│    • Automatic error handling             │
│    • Service ready checks                 │
│                                            │
└──────────────────────────────────────────┘
```

## Supported API Configurations

```
╔════════════════════════════════════════════════════════╗
║ SENDGRID (Email Service)                               ║
╠════════════════════════════════════════════════════════╣
║ ✅ Stores API key securely                             ║
║ ✅ Validates key format (must start with SG.)          ║
║ ✅ Configures from email address                       ║
║ ✅ Can be toggled on/off                               ║
╚════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════╗
║ PAYMENT PROVIDER (Stripe, Square, etc)                 ║
╠════════════════════════════════════════════════════════╣
║ ✅ Supports multiple providers                         ║
║ ✅ Stores secret key securely                          ║
║ ✅ Validates key format per provider                   ║
║ ✅ Supports additional secret keys                     ║
╚════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════╗
║ GOOGLE CALENDAR (Booking Management)                   ║
╠════════════════════════════════════════════════════════╣
║ ✅ API Key approach supported                          ║
║ ✅ OAuth approach supported                            ║
║ ✅ Multiple authentication methods                     ║
║ ✅ Calendar ID configuration                           ║
╚════════════════════════════════════════════════════════╝
```

## File Structure

```
server/
├── src/
│   ├── controllers/
│   │   └── settings.controller.ts ✏️ (Modified)
│   │       ├── getAPIConfigs()
│   │       ├── getAPIConfig(:name)
│   │       ├── updateAPIConfig(:name)
│   │       ├── testAPIConfig(:name)
│   │       └── getIntegrationHealth()
│   │
│   ├── routes/
│   │   └── settings.routes.ts ✏️ (Modified)
│   │       ├── GET /api/settings/api-configs
│   │       ├── GET /api/settings/api-configs/:name
│   │       ├── PATCH /api/settings/api-configs/:name
│   │       ├── POST /api/settings/api-configs/:name/test
│   │       └── GET /api/settings/integrations/health
│   │
│   ├── utils/
│   │   ├── api-config.service.ts ✨ (New)
│   │   │   └── Core configuration management
│   │   │
│   │   ├── api-initialization.service.ts ✨ (New)
│   │   │   └── Server startup initialization
│   │   │
│   │   └── prisma.ts (Existing)
│   │       └── Database access
│   │
│   └── index.ts ✏️ (Modified)
│       └── Calls initializeAPIConfigs() on startup
│
├── prisma/
│   └── schema.prisma (Existing)
│       └── Uses SystemSettings.integrations JSON field
│
└── docs/ 📚 (New Documentation)
    ├── API_CONFIGURATION_GUIDE.md
    ├── ADMIN_API_CONFIG_SETUP.md
    ├── ADMIN_PANEL_INTEGRATION.md
    └── API_CONFIG_SETUP_COMPLETE.md
```

## Quick Reference: All Endpoints

```
METHOD  ENDPOINT                              PURPOSE
───────────────────────────────────────────────────────────────
GET     /api/settings/api-configs             Get all configs
GET     /api/settings/api-configs/:name       Get single config
PATCH   /api/settings/api-configs/:name       Update config
POST    /api/settings/api-configs/:name/test  Test config
GET     /api/settings/integrations/health     Check health
───────────────────────────────────────────────────────────────

:name values:
  • sendgrid
  • payment
  • googleCalendar
```

---

## You're All Set! 🎉

The API configuration system is fully implemented and ready to use. Everything is:

✅ Secure - Keys are stored safely in the database
✅ Flexible - Works with database or environment variables
✅ Validated - Keys are checked before saving
✅ Monitored - Health status checked on startup
✅ Documented - Complete guides for setup and integration
✅ Type-Safe - Fully typed TypeScript implementation
✅ Error-Handled - Graceful fallbacks and error messages

Now you can add your API keys through the admin panel or API endpoints, and your services will automatically use them!
