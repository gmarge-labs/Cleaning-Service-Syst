import { Router } from 'express';
import { createBooking, getBookings, updateBooking, sendInvoice, claimJob, completeJob, notifyArrival, createPaymentIntent } from '../controllers/booking.controller';

const router = Router();

router.post('/', createBooking);
router.get('/', getBookings);
router.patch('/:id', updateBooking);
router.patch('/:id/claim', claimJob);
router.patch('/:id/complete', completeJob);
router.post('/:id/arrive', notifyArrival);
router.post('/create-payment-intent', createPaymentIntent);
router.post('/send-invoice', sendInvoice);

export default router;
