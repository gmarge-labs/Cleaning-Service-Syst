"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const router = (0, express_1.Router)();
// General settings
router.get('/', settings_controller_1.getSettings);
router.patch('/', settings_controller_1.updateSettings);
router.get('/qualified-count', settings_controller_1.getQualifiedUsersCount);
// API Configuration Management (Admin Only)
router.get('/api-configs', settings_controller_1.getAPIConfigs);
router.get('/api-configs/:name', settings_controller_1.getAPIConfig);
router.patch('/api-configs/:name', settings_controller_1.updateAPIConfig);
router.post('/api-configs/:name/test', settings_controller_1.testAPIConfig);
// Integration Health Check (Admin Only)
router.get('/integrations/health', settings_controller_1.getIntegrationHealth);
exports.default = router;
