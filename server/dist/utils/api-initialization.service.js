"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeAPIConfigs = initializeAPIConfigs;
exports.ensureAPIConfigured = ensureAPIConfigured;
exports.getSecureAPIConfig = getSecureAPIConfig;
const api_config_service_1 = require("./api-config.service");
/**
 * Initialize and validate all API configurations on server startup
 * Logs warnings if critical APIs are misconfigured
 */
function initializeAPIConfigs() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🔧 Initializing API configurations...');
            const health = yield api_config_service_1.APIConfigService.checkHealthStatus();
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
            const missing = [];
            if (!health.sendgrid)
                missing.push('SendGrid (email service)');
            if (!health.payment)
                missing.push('Payment Provider');
            if (!health.googleCalendar)
                missing.push('Google Calendar');
            if (missing.length > 0) {
                console.warn('⚠️  WARNING: The following services are not configured:');
                missing.forEach(service => console.warn(`   - ${service}`));
                console.warn('   Please configure these from the Admin Panel to enable full functionality.');
            }
            else {
                console.log('✅ All critical APIs are configured and ready!');
            }
            return health;
        }
        catch (error) {
            console.error('❌ Error initializing API configurations:', error);
            console.warn('⚠️  Some features may not work without proper API configuration.');
            return {
                sendgrid: false,
                payment: false,
                googleCalendar: false
            };
        }
    });
}
/**
 * Validate specific API before using it
 * Throws error if API is not properly configured
 */
function ensureAPIConfigured(apiName) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = yield api_config_service_1.APIConfigService.getConfig(apiName);
        if (!config || !config.enabled || !config.apiKey) {
            throw new Error(`${apiName} is not configured. Please add your API key from the Admin Panel.`);
        }
        const isValid = yield api_config_service_1.APIConfigService.validateConfig(apiName);
        if (!isValid) {
            throw new Error(`${apiName} configuration appears to be invalid. Please check your API key and settings.`);
        }
    });
}
/**
 * Get secure API configuration for use in services
 * Returns full config with unmasked keys
 */
function getSecureAPIConfig(apiName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ensureAPIConfigured(apiName);
        return api_config_service_1.APIConfigService.getConfig(apiName);
    });
}
