import { APIConfigService } from './api-config.service';

/**
 * Initialize and validate all API configurations on server startup
 * Logs warnings if critical APIs are misconfigured
 */
export async function initializeAPIConfigs() {
  try {
    console.log('🔧 Initializing API configurations...');

    const health = await APIConfigService.checkHealthStatus();

    const results = {
      sendgrid: health.sendgrid ? '✅ Configured' : '⚠️  Not configured',
      payment: health.payment ? '✅ Configured' : '⚠️  Not configured',
      googleCalendar: health.googleCalendar ? '✅ Configured' : '⚠️  Not configured'
    };

    console.log('📊 API Configuration Status:');
    console.log(`  SendGrid:       ${results.sendgrid}`);
    console.log(`  Payment:        ${results.payment}`);
    console.log(`  Google Calendar: ${results.googleCalendar}`);

    // Log which services are missing
    const missing: string[] = [];
    if (!health.sendgrid) missing.push('SendGrid (email service)');
    if (!health.payment) missing.push('Payment Provider');
    if (!health.googleCalendar) missing.push('Google Calendar');

    if (missing.length > 0) {
      console.warn('⚠️  WARNING: The following services are not configured:');
      missing.forEach(service => console.warn(`   - ${service}`));
      console.warn('   Please configure these from the Admin Panel to enable full functionality.');
    } else {
      console.log('✅ All critical APIs are configured and ready!');
    }

    return health;
  } catch (error) {
    console.error('❌ Error initializing API configurations:', error);
    console.warn('⚠️  Some features may not work without proper API configuration.');
    return {
      sendgrid: false,
      payment: false,
      googleCalendar: false
    };
  }
}

/**
 * Validate specific API before using it
 * Throws error if API is not properly configured
 */
export async function ensureAPIConfigured(apiName: 'sendgrid' | 'payment' | 'googleCalendar'): Promise<void> {
  const config = await APIConfigService.getConfig(apiName);

  if (!config || !config.enabled || !config.apiKey) {
    throw new Error(
      `${apiName} is not configured. Please add your API key from the Admin Panel.`
    );
  }

  const isValid = await APIConfigService.validateConfig(apiName);
  if (!isValid) {
    throw new Error(
      `${apiName} configuration appears to be invalid. Please check your API key and settings.`
    );
  }
}

/**
 * Get secure API configuration for use in services
 * Returns full config with unmasked keys
 */
export async function getSecureAPIConfig(apiName: 'sendgrid' | 'payment' | 'googleCalendar'): Promise<any> {
  await ensureAPIConfigured(apiName);
  return APIConfigService.getConfig(apiName);
}
