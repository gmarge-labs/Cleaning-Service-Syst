import { Router } from 'express';
import { createReview, getReviews, getPublishedReviews, updateReviewStatus } from '../controllers/review.controller';

const router = Router();

router.post('/', createReview);
router.get('/', getReviews);
router.get('/published', getPublishedReviews);
router.patch('/:id/status', updateReviewStatus);

export default router;
