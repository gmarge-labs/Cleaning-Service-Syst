import { Router } from 'express';
import { submitApplication, getApplications, updateApplicationStatus } from '../controllers/cleaner.controller';

const router = Router();

router.post('/apply', submitApplication);
router.get('/applications', getApplications);
router.patch('/applications/:id/status', updateApplicationStatus);

export default router;
