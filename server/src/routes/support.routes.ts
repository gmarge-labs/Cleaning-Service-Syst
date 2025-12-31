import { Router } from 'express';
import { submitContactForm } from '../controllers/support.controller';

const router = Router();

router.post('/contact', submitContactForm);

export default router;
