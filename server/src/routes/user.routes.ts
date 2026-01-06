import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  addAddress,
  deleteAddress,
  addPaymentMethod,
  deletePaymentMethod,
  getAllUsers,
  createUser,
  updatePushToken,
  getCleaningStats,
} from '../controllers/user.controller';

const router = Router();

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/by-email/:email/cleaning-stats', getCleaningStats);
router.get('/:userId', getProfile);
router.get('/:userId/cleaning-stats', getCleaningStats);
router.patch('/:userId', updateProfile);
router.patch('/:userId/push-token', updatePushToken);
router.post('/:userId/password', changePassword);

// Address routes
router.post('/:userId/addresses', addAddress);
router.delete('/addresses/:addressId', deleteAddress);

// Payment method routes
router.post('/:userId/payment-methods', addPaymentMethod);
router.delete('/payment-methods/:paymentMethodId', deletePaymentMethod);

export default router;
