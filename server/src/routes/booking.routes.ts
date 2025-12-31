import { Router } from 'express';
import { createBooking, getBookings, updateBooking, sendInvoice, claimJob, notifyArrival } from '../controllers/booking.controller';

const router = Router();

router.post('/', createBooking);
router.get('/', getBookings);
router.patch('/:id', updateBooking);
router.patch('/:id/claim', claimJob);
router.post('/:id/arrive', notifyArrival);
router.post('/send-invoice', sendInvoice);

export default router;
