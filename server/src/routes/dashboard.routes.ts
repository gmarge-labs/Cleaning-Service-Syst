import { Router } from 'express';
import { getAdminStats, getSupervisorStats, getSupportStats, getActiveJob } from '../controllers/dashboard.controller';

const router = Router();

router.get('/admin/stats', getAdminStats);
router.get('/supervisor/stats', getSupervisorStats);
router.get('/support/stats', getSupportStats);
router.get('/active-job', getActiveJob);

export default router;
