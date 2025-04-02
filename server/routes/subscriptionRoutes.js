import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
  createSubscriptionOrder, 
  handleWebhook, 
  verifyPayment,
  getSubscriptionStatus
} from '../controllers/subscriptionController.js';
import { 
  subscriptionLimiter, 
  paymentVerificationLimiter 
} from '../middleware/rateLimit.js';

const router = express.Router();

// Protected routes with rate limiting
router.post('/create-order', verifyToken, subscriptionLimiter, createSubscriptionOrder);
router.get('/status', verifyToken, subscriptionLimiter, getSubscriptionStatus);
router.get('/verify/:orderId', verifyToken, paymentVerificationLimiter, verifyPayment);

// Webhook doesn't need authentication but should verify signature
router.post('/webhook', handleWebhook);

export default router;
