import Prompt from '../models/promptModel.js';
import * as process from 'node:process';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import PLANS from '../constants/plans.js';

dotenv.config();

// GET all prompts for a user
export const getPrompts = async (req, res) => {
  try {
    // Get userId from authenticated user
    const userId = req.user.id;
    // console.log('getPrompts - User ID:', userId);
    
    // console.log('getPrompts - Using database');
    const prompts = await Prompt.find({ userId }).sort({ updatedAt: -1 });
    // console.log('getPrompts - Found prompts:', prompts.length);
    res.status(200).json(prompts);
  } catch (error) {
    console.error('getPrompts - Error:', error.message);
    res.status(500).json({ message: 'Error fetching prompts', error: error.message });
  }
};

// GET a prompt by ID
export const getPromptById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const prompt = await Prompt.findById(id);
    if (!prompt) return res.status(404).json({ message: 'Prompt not found' });
    
    res.status(200).json(prompt);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prompt', error: error.message });
  }
};

// CREATE a new prompt
export const createPrompt = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    // Get userId from authenticated user
    const userId = req.user.id;
    
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check subscription status
    const hasActiveSubscription = user.subscription && user.subscription.isActive;
    const isSubscriptionExpired = hasActiveSubscription && 
                                 user.subscription.endDate && 
                                 new Date() > new Date(user.subscription.endDate);

    // If subscription has expired, update user record
    if (isSubscriptionExpired) {
      user.subscription.isActive = false;
      
      // Restore previous status after subscription expiry
      if (user.previousStatus) {
        // If user was advanced before subscription, keep them advanced with 300 limit
        if (user.previousStatus.isAdvancedUser) {
          user.promptLimit = PLANS.ONE_TIME_PAYMENT_PLAN.promptLimit; // 300
        } else {
          // Otherwise revert to basic user limit
          user.promptLimit = PLANS.FREE_TIER.promptLimit; // 50
        }
      } else {
        // Fallback if no previous status (shouldn't happen with new logic)
        user.promptLimit = user.isAdvancedUser ? 
          PLANS.ONE_TIME_PAYMENT_PLAN.promptLimit : 
          PLANS.FREE_TIER.promptLimit;
      }
      
      await user.save();
      return res.status(403).json({ message: 'Subscription expired. Please renew to create more prompts.' });
    }
    
    // Check if user has reached prompt limit
    if (user.promptLimit !== -1 && user.promptCount >= user.promptLimit) {
      return res.status(403).json({ 
        message: 'Prompt limit reached',
        currentCount: user.promptCount,
        limit: user.promptLimit,
        needsUpgrade: true
      });
    }

    // Create the new prompt
    const newPrompt = await Prompt.create({
      title,
      content,
      userId,
      tags: tags || []
    });

    // Increment prompt count for the user
    user.promptCount += 1;
    await user.save();

    res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Error creating prompt:', error);
    res.status(400).json({ message: 'Error creating prompt', error: error.message });
  }
};

// UPDATE a prompt
export const updatePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    
    const updatedPrompt = await Prompt.findByIdAndUpdate(
      id,
      { title, content, tags },
      { new: true, runValidators: true }
    );
    
    if (!updatedPrompt) return res.status(404).json({ message: 'Prompt not found' });
    
    res.status(200).json(updatedPrompt);
  } catch (error) {
    res.status(400).json({ message: 'Error updating prompt', error: error.message });
  }
};

// DELETE a prompt
export const deletePrompt = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedPrompt = await Prompt.findByIdAndDelete(id);
    
    if (!deletedPrompt) return res.status(404).json({ message: 'Prompt not found' });
    
    // Decrement prompt count for the user
    const user = await User.findById(req.user.id);
    user.promptCount -= 1;
    await user.save();

    res.status(200).json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting prompt', error: error.message });
  }
};
