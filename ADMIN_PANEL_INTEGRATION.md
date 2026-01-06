# Admin Panel Integration Guide

## Overview
This guide shows you how to create admin panel UI components to manage API configurations without using curl commands.

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/settings/api-configs` | Get all API configurations |
| GET | `/api/settings/api-configs/:name` | Get specific API configuration |
| PATCH | `/api/settings/api-configs/:name` | Update API configuration |
| POST | `/api/settings/api-configs/:name/test` | Test API configuration |
| GET | `/api/settings/integrations/health` | Check health of all integrations |

## Frontend Implementation Examples

### React Hook for API Configuration Management

```typescript
import { useState, useEffect } from 'react';

interface APIConfig {
  enabled: boolean;
  apiKey: string;
  configured: boolean;
  [key: string]: any;
}

export function useAPIConfig(apiName: 'sendgrid' | 'payment' | 'googleCalendar') {
  const [config, setConfig] = useState<APIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ valid: boolean; message: string } | null>(null);

  // Fetch current configuration
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings/api-configs/${apiName}`);
      const data = await response.json();
      setConfig(data);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch ${apiName} configuration`);
    } finally {
      setLoading(false);
    }
  };

  // Update configuration
  const updateConfig = async (updates: Partial<APIConfig>) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings/api-configs/${apiName}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      setConfig(data);
      setError(null);
      return data;
    } catch (err) {
      setError(`Failed to update ${apiName} configuration`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Test configuration
  const testConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings/api-configs/${apiName}/test`, {
        method: 'POST'
      });
      const result = await response.json();
      setTestResult(result);
      return result;
    } catch (err) {
      setError(`Failed to test ${apiName} configuration`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [apiName]);

  return {
    config,
    loading,
    error,
    testResult,
    updateConfig,
    testConfig,
    refetch: fetchConfig
  };
}
```

### SendGrid Configuration Component

```tsx
import React, { useState } from 'react';
import { useAPIConfig } from './useAPIConfig';

export function SendGridConfig() {
  const { config, loading, error, testResult, updateConfig, testConfig } = useAPIConfig('sendgrid');
  const [apiKey, setApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateConfig({
        apiKey,
        fromEmail,
        enabled: true
      });
      alert('SendGrid configuration updated successfully!');
    } catch (err) {
      alert('Failed to update configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTest = async () => {
    const result = await testConfig();
    if (result.valid) {
      alert('✅ SendGrid configuration is valid!');
    } else {
      alert('❌ SendGrid configuration is invalid. Please check your API key.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <div>
        <h3 className="text-lg font-semibold">SendGrid Configuration</h3>
        <p className="text-gray-600">Configure email service for sending notifications</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {config?.configured && (
        <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700">
          ✅ SendGrid is configured
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Get your API key from: https://app.sendgrid.com/settings/api_keys
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">From Email</label>
          <input
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="noreply@sparkleville.com"
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Configuration'}
          </button>
          <button
            type="button"
            onClick={handleTest}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            Test Configuration
          </button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg ${testResult.valid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {testResult.message}
          </div>
        )}
      </form>
    </div>
  );
}
```

### Payment Configuration Component

```tsx
export function PaymentConfig() {
  const { config, loading, error, testResult, updateConfig, testConfig } = useAPIConfig('payment');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'stripe' | 'square'>('stripe');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateConfig({
        apiKey,
        provider,
        enabled: true
      });
      alert('Payment configuration updated successfully!');
    } catch (err) {
      alert('Failed to update configuration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <div>
        <h3 className="text-lg font-semibold">Payment Provider Configuration</h3>
        <p className="text-gray-600">Configure payment processing for customer payments</p>
      </div>

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

      {config?.configured && (
        <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700">
          ✅ {config.provider?.toUpperCase()} is configured
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as any)}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="stripe">Stripe</option>
            <option value="square">Square</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={provider === 'stripe' ? 'sk_test_xxxxx' : 'sq_xxxxx'}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            {provider === 'stripe' 
              ? 'Get your Secret Key from: https://dashboard.stripe.com/apikeys'
              : 'Get your API Key from: https://developer.squareup.com/apps'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Configuration'}
          </button>
          <button
            type="button"
            onClick={() => testConfig()}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            Test Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
```

### Integration Health Dashboard

```tsx
export function IntegrationHealth() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/settings/integrations/health');
        const data = await response.json();
        setHealth(data);
      } catch (err) {
        console.error('Failed to fetch integration health');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">API Integration Status</h3>

      <div className="grid grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg ${health?.services.sendgrid ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={health?.services.sendgrid ? 'text-green-700' : 'text-red-700'}>
            <span className={health?.services.sendgrid ? '✅' : '❌'}</span> SendGrid
          </div>
          <p className="text-xs text-gray-600 mt-1">Email Service</p>
        </div>

        <div className={`p-4 rounded-lg ${health?.services.payment ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={health?.services.payment ? 'text-green-700' : 'text-red-700'}>
            <span className={health?.services.payment ? '✅' : '❌'}</span> Payment
          </div>
          <p className="text-xs text-gray-600 mt-1">Payment Processing</p>
        </div>

        <div className={`p-4 rounded-lg ${health?.services.googleCalendar ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={health?.services.googleCalendar ? 'text-green-700' : 'text-red-700'}>
            <span className={health?.services.googleCalendar ? '✅' : '❌'}</span> Google Calendar
          </div>
          <p className="text-xs text-gray-600 mt-1">Calendar Management</p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-600">
        Overall Status: <strong>{health?.status}</strong>
      </div>
    </div>
  );
}
```

### Complete Admin Settings Page

```tsx
export function AdminAPISettings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">API Configuration</h1>
        <p className="text-gray-600">Manage your third-party API integrations</p>
      </div>

      <IntegrationHealth />

      <SendGridConfig />
      <PaymentConfig />
      {/* Add GoogleCalendarConfig component similarly */}
    </div>
  );
}
```

## Key Points for Admin Panel

1. **Always mask API keys** - Never display full keys
2. **Provide test functionality** - Let admins test before saving
3. **Show health status** - Display which services are configured
4. **Graceful error handling** - Show user-friendly error messages
5. **Link to provider dashboards** - Help admins get their keys
6. **Support readonly view** - Show what's configured without exposing keys

## Integration with Existing Admin Routes

If you have existing admin routes, add this configuration page:

```tsx
// In your admin routes configuration
{
  path: '/admin/api-settings',
  component: AdminAPISettings,
  requiresAdmin: true,
  label: 'API Configuration'
}
```

This setup provides a complete admin interface for managing API configurations!
