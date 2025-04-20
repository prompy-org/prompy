import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { deleteUser, getUserStats, getUserSubscriptionDetails } from '../controllers/userController.js';

const router = express.Router();

// Protected routes (require authentication)
router.get('/stats', verifyToken, getUserStats);
router.get('/subscription-details', verifyToken, getUserSubscriptionDetails);
router.delete('/', verifyToken, deleteUser);

export default router;