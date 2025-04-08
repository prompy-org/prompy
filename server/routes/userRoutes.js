import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getUserStats, getUserSubscriptionDetails } from '../controllers/userController.js';

const router = express.Router();

// Protected routes (require authentication)
router.get('/stats', verifyToken, getUserStats);
router.get('/subscription-details', verifyToken, getUserSubscriptionDetails);

export default router;