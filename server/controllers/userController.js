import User from '../models/userModel.js';
import Prompt from '../models/promptModel.js';
import { checkSubscriptionExpiry } from './paymentController.js';

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if subscription has expired before returning details
    await checkSubscriptionExpiry(userId);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Format subscription data
    let subscriptionData = null;
    if (user.subscription && Object.keys(user.subscription).length > 0) {
      subscriptionData = {
        planId: user.subscription.planId,
        isActive: user.subscription.isActive,
        startDate: user.subscription.startDate,
        expiresAt: user.subscription.endDate,
        autoRenew: user.subscription.autoRenew
      };
    } else if (user.isAdvancedUser) {
      // For users with one-time payment but no subscription record
      subscriptionData = {
        planId: "one_time_payment_plan",
        isActive: true
      };
    } else {
      // Basic users
      subscriptionData = {
        planId: "plan_basic",
        isActive: true
      };
    }
    
    // Return user stats
    return res.status(200).json({
      promptCount: user.promptCount || 0,
      promptLimit: user.promptLimit || 50,
      isAdvancedUser: user.isAdvancedUser || false,
      subscription: subscriptionData,
      activeSubscriptions: user.activeSubscriptions || [],
      lastActivity: user.lastLogin,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
