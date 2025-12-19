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
} from '../controllers/user.controller';

const router = Router();

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/:userId', getProfile);
router.patch('/:userId', updateProfile);
router.post('/:userId/password', changePassword);

// Address routes
router.post('/:userId/addresses', addAddress);
router.delete('/addresses/:addressId', deleteAddress);

// Payment method routes
router.post('/:userId/payment-methods', addPaymentMethod);
router.delete('/payment-methods/:paymentMethodId', deletePaymentMethod);

export default router;
