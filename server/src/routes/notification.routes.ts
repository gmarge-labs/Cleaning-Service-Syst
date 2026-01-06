import { Router } from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCountsByType,
  markAllByTypeAsRead,
} from '../controllers/notification.controller';

const router = Router();

router.get('/:userId', getUserNotifications);
router.get('/:userId/unread-count', getUnreadCount);
router.get('/:userId/unread-counts-by-type', getUnreadCountsByType);
router.patch('/:notificationId/read', markAsRead);
router.patch('/:userId/read-all', markAllAsRead);
router.patch('/:userId/read-all-by-type', markAllByTypeAsRead);
router.delete('/:notificationId', deleteNotification);

export default router;
