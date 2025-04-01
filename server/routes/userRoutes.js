import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getUserStats } from '../controllers/userController.js';

const router = express.Router();

// Protected routes (require authentication)
router.get('/stats', verifyToken, getUserStats);

export default router;