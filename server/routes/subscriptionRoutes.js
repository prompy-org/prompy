import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { 
  createSubscriptionOrder, 
  handleWebhook, 
  verifyPayment,
  getSubscriptionStatus
} from '../controllers/subscriptionController.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/create-order', verifyToken, createSubscriptionOrder);
router.get('/status', verifyToken, getSubscriptionStatus);
router.get('/verify/:orderId', verifyToken, verifyPayment);

// Webhook doesn't need authentication but should verify signature
router.post('/webhook', handleWebhook);

export default router;