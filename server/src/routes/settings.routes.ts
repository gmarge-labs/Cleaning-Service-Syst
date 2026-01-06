import { Router } from 'express';
import { 
  getSettings, 
  updateSettings, 
  getQualifiedUsersCount,
  getAPIConfigs,
  getAPIConfig,
  updateAPIConfig,
  testAPIConfig,
  getIntegrationHealth
} from '../controllers/settings.controller';

const router = Router();

// General settings
router.get('/', getSettings);
router.patch('/', updateSettings);
router.get('/qualified-count', getQualifiedUsersCount);

// API Configuration Management (Admin Only)
router.get('/api-configs', getAPIConfigs);
router.get('/api-configs/:name', getAPIConfig);
router.patch('/api-configs/:name', updateAPIConfig);
router.post('/api-configs/:name/test', testAPIConfig);

// Integration Health Check (Admin Only)
router.get('/integrations/health', getIntegrationHealth);

export default router;
