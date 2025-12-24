import { Router } from 'express';
import { getSettings, updateSettings, getQualifiedUsersCount } from '../controllers/settings.controller';

const router = Router();

router.get('/', getSettings);
router.patch('/', updateSettings);
router.get('/qualified-count', getQualifiedUsersCount);

export default router;
