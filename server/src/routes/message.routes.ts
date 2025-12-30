import { Router } from 'express';
import { getConversations, getMessages, sendMessage, getAvailableContacts } from '../controllers/message.controller';
import { authenticate } from '../utils/auth';

const router = Router();

router.use(authenticate);

router.get('/conversations', getConversations);
router.get('/contacts', getAvailableContacts);
router.get('/:partnerId', getMessages);
router.post('/', sendMessage);

export default router;
