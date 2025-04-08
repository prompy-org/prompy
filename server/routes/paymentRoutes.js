import express from 'express';
import { cancelSubscription, createOrder, getUserSubscription, verifyPayment, cancelOrder } from '../controllers/paymentController.js';
import { paymentVerificationLimiter, subscriptionLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

router.post('/create-order',subscriptionLimiter , createOrder);
router.post('/cancel-order', subscriptionLimiter, cancelOrder);
router.post('/verify-payment', paymentVerificationLimiter, verifyPayment);
router.post('/status', subscriptionLimiter, getUserSubscription);
router.post('/cancel', subscriptionLimiter, cancelSubscription);

export default router;