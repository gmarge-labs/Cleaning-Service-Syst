import { Router } from 'express';
import { createBooking, getBookings, updateBooking, sendInvoice, claimJob } from '../controllers/booking.controller';

const router = Router();

router.post('/', createBooking);
router.get('/', getBookings);
router.patch('/:id', updateBooking);
router.patch('/:id/claim', claimJob);
router.post('/send-invoice', sendInvoice);

export default router;
