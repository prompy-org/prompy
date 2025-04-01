import User from '../models/userModel.js';
import Prompt from '../models/promptModel.js';

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Count prompts
    const promptCount = await Prompt.countDocuments({ userId });
    
    // Get last activity (most recent prompt update)
    const lastPrompt = await Prompt.findOne({ userId })
      .sort({ updatedAt: -1 })
      .limit(1);
    
    // Prepare stats
    const stats = {
      promptCount,
      lastActivity: lastPrompt?.updatedAt || null,
      createdAt: user.createdAt,
      subscription: {
        isActive: user.subscription?.isActive || false,
        plan: user.subscription?.planId || null,
        expiresAt: user.subscription?.endDate || null
      }
    };
    
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};