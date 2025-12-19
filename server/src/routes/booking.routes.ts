import { Router } from 'express';
import { createBooking, getBookings, updateBooking } from '../controllers/booking.controller';

const router = Router();

router.post('/', createBooking);
router.get('/', getBookings);
router.patch('/:id', updateBooking);

export default router;
