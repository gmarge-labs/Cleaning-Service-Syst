import { Router } from 'express';
import { submitApplication, getApplications, updateApplicationStatus, getCleaners } from '../controllers/cleaner.controller';

const router = Router();

router.get('/', getCleaners);
router.post('/apply', submitApplication);
router.get('/applications', getApplications);
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;
