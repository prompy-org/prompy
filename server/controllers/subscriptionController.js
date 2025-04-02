import { Cashfree } from "cashfree-pg";
import User from '../models/userModel.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Constants for subscription plans
const PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic Plan',
    amount: 0,
    currency: 'INR',
    interval: null, // Free plan
    promptLimit: 50
  },
  ADVANCED: {
    id: 'advanced',
    name: 'Advanced Plan',
    amount: 999,
    currency: 'INR',
    interval: null, // One-time payment
    promptLimit: 300
  },
  UNLIMITED_MONTHLY: {
    id: 'unlimited_monthly',
    name: 'Unlimited Monthly Plan',
    amount: 499,
    currency: 'INR',
    interval: 'monthly',
    promptLimit: Infinity,
    durationMonths: 1
  },
  UNLIMITED_QUARTERLY: {
    id: 'unlimited_quarterly',
    name: 'Unlimited Quarterly Plan',
    amount: 1299,
    currency: 'INR',
    interval: 'quarterly',
    promptLimit: Infinity,
    durationMonths: 3
  },
  UNLIMITED_YEARLY: {
    id: 'unlimited_yearly',
    name: 'Unlimited Yearly Plan',
    amount: 4999,
    currency: 'INR',
    interval: 'yearly',
    promptLimit: Infinity,
    durationMonths: 12
  }
};

// Create a payment order with improved security
export const createSubscriptionOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;
    
    // Input validation
    if (!planId || typeof planId !== 'string') {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }
    
    // Validate plan with case-insensitive lookup
    const planKey = Object.keys(PLANS).find(key => 
      PLANS[key].id.toLowerCase() === planId.toLowerCase()
    );
    
    if (!planKey) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }
    
    const plan = PLANS[planKey];
    
    // Free plan doesn't need payment processing
    if (plan.amount === 0) {
      return res.status(400).json({ message: 'Selected plan does not require payment' });
    }
    
    // Find user with projection to limit returned fields
    const user = await User.findById(userId, { 
      displayName: 1, 
      email: 1, 
      subscription: 1 
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate a unique order ID with more entropy
    const randomString = crypto.randomBytes(8).toString('hex');
    const orderId = `order_${Date.now()}_${randomString}`;
    
    // Create order request
    const orderRequest = {
      order_id: orderId,
      order_amount: plan.amount,
      order_currency: plan.currency,
      customer_details: {
        customer_id: userId,
        customer_name: user.displayName,
        customer_email: user.email,
        customer_phone: "1231231234" // Add phone if available
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/dashboard/payment/callback?order_id={order_id}`,
        notify_url: `${process.env.SERVER_URL}/api/subscription/webhook`
      },
      order_note: `Subscription to ${plan.name}`
    };
    
    // Create order with Cashfree
    const response = await Cashfree.PGCreateOrder("2025-01-01", orderRequest);
    
    if (response.data && response.data.payment_session_id) {
      // Store order information in user document
      user.subscription = user.subscription || {};
      user.subscription.orderId = orderId;
      user.subscription.planId = plan.id;
      user.subscription.pendingUpgrade = true;
      user.markModified('subscription');
      await user.save();
      
      // Return payment link to frontend
      return res.status(200).json({
        orderId: orderId,
        paymentSessionId: response.data.payment_session_id,
      });
    } else {
      return res.status(500).json({ message: 'Failed to create payment order' });
    }
  } catch (error) {
    console.error('Error creating subscription order:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Verify payment webhook with improved security
export const handleWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    
    // Verify webhook signature - critical security check
    if (!signature || !timestamp) {
      console.error("Missing webhook signature or timestamp");
      return res.status(400).json({ message: "Missing signature or timestamp" });
    }
    
    try {
      // Use Cashfree's official verification method
      Cashfree.PGVerifyWebhookSignature(signature, JSON.stringify(webhookData), timestamp);
    } catch (err) {
      console.error("Invalid webhook signature:", err.message);
      return res.status(400).json({ message: "Invalid signature" });
    }
    
    // Process the webhook data
    const { type } = webhookData;
    const { order_id, order, payment } = webhookData.data;
    
    if (!order_id || !payment) {
      console.error("Invalid webhook payload");
      return res.status(400).json({ message: "Invalid payload" });
    }
    
    // Only process payment success events
    if (type === "PAYMENT_SUCCESS_WEBHOOK" && payment.payment_status === "SUCCESS") {
      // Find user by order ID with projection to limit returned fields
      const user = await User.findOne(
        { "subscription.orderId": order_id },
        { subscription: 1, email: 1, promptCount: 1 }
      );
      
      if (!user) {
        console.error(`User not found for order ${order_id}`);
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get the plan details
      const planKey = Object.keys(PLANS).find(key => 
        PLANS[key].id === user.subscription.planId
      );
      
      if (!planKey) {
        console.error(`Invalid plan ID: ${user.subscription.planId}`);
        return res.status(400).json({ message: "Invalid plan" });
      }
      
      const plan = PLANS[planKey];
      
      // Validate payment amount against expected amount
      if (Number(payment.payment_amount) !== plan.amount) {
        console.error(`Payment amount mismatch for order ${order_id}`);
        // Log this suspicious activity but still proceed
      }
      
      const now = new Date();
      let endDate;
      
      // Handle subscription extension if already active
      if (user.subscription.isActive && 
          user.subscription.endDate && 
          plan.interval) {
        
        // If current subscription is still active, extend from current end date
        const currentEndDate = new Date(user.subscription.endDate);
        if (currentEndDate > now) {
          endDate = new Date(currentEndDate);
        } else {
          endDate = new Date(now);
        }
        
        // Add months based on plan duration
        endDate.setMonth(endDate.getMonth() + plan.durationMonths);
      } else {
        // New subscription
        endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + (plan.durationMonths || 0));
      }
      
      // Update subscription details
      user.subscription.isActive = true;
      user.subscription.startDate = now;
      user.subscription.endDate = endDate;
      user.subscription.subscriptionId = `sub_${order_id}`;
      user.subscription.paymentId = payment.cf_payment_id;
      user.subscription.lastPaymentDate = now;
      user.subscription.planId = plan.id;
      user.subscription.promptLimit = plan.promptLimit;
      user.subscription.pendingUpgrade = false;
      user.markModified('subscription');
      
      await user.save();
      console.log(`Subscription activated for user ${user._id}`);
    }
    
    // Always return 200 to the payment provider
    return res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Still return 200 to prevent retries that might cause duplicate processing
    return res.status(200).json({ message: 'Webhook received' });
  }
};

// Verify payment status with improved security (fallback if webhook hasn't processed)
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    
    // Input validation
    if (!orderId || !orderId.match(/^order_[a-zA-Z0-9_]+$/)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    
    // Verify the user owns this order with projection
    const user = await User.findOne({ 
      _id: userId,
      "subscription.orderId": orderId 
    }, { subscription: 1 });
    
    if (!user) {
      // Use consistent error messages to prevent user enumeration
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    
    // If subscription is already active, webhook has processed successfully
    if (user.subscription.isActive) {
      return res.status(200).json({ 
        success: true,
        subscription: {
          isActive: user.subscription.isActive,
          planId: user.subscription.planId,
          endDate: user.subscription.endDate
        }
      });
    }
    
    // Fallback: Get order details from Cashfree
    const response = await Cashfree.PGFetchOrder("2025-01-01", orderId);
    
    // Validate the response
    if (!response || !response.data) {
      return res.status(500).json({ message: 'Failed to verify payment status' });
    }
    
    if (response.data.order_status === "PAID") {
      // If payment is successful but webhook hasn't processed yet
      const now = new Date();
      
      // Get the plan details
      const plan = Object.values(PLANS).find(p => p.id === user.subscription.planId);
      if (!plan) {
        return res.status(400).json({ message: 'Invalid plan' });
      }
      
      // Validate payment amount against expected plan amount
      if (Number(response.data.order_amount) !== plan.amount) {
        console.error(`Payment amount mismatch for order ${orderId}`);
        return res.status(403).json({ message: 'Payment validation failed' });
      }
      
      // Calculate end date based on plan duration
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + (plan.durationMonths || 0));
      
      // Update subscription details
      user.subscription.isActive = true;
      user.subscription.startDate = now;
      user.subscription.endDate = endDate;
      user.subscription.subscriptionId = `sub_${orderId}`;
      user.subscription.paymentId = response.data.payment_session_id;
      user.subscription.promptLimit = plan.promptLimit;
      user.subscription.lastPaymentDate = now;
      user.subscription.pendingUpgrade = false;
      user.markModified('subscription');
      
      await user.save();
      console.log(`Subscription activated for user ${user._id} via manual verification`);
      
      return res.status(200).json({ 
        success: true,
        subscription: {
          isActive: true,
          planId: user.subscription.planId,
          endDate: endDate
        }
      });
    } else {
      return res.status(200).json({ 
        success: false,
        status: response.data.order_status
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get subscription status
export const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if subscription is active and not expired
    const isActive = user.subscription && 
                    user.subscription.isActive && 
                    new Date(user.subscription.endDate) > new Date();
    
    return res.status(200).json({
      isActive,
      subscription: user.subscription || {}
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upgrade to basic (free) plan
export const upgradeToBasic = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Set basic plan details
    const now = new Date();
    user.subscription = user.subscription || {};
    user.subscription.isActive = true;
    user.subscription.startDate = now;
    user.subscription.endDate = null; // No end date for basic plan
    user.subscription.planId = PLANS.BASIC.id;
    user.subscription.promptLimit = PLANS.BASIC.promptLimit;
    user.markModified('subscription');
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Successfully upgraded to Basic plan',
      subscription: {
        isActive: true,
        planId: PLANS.BASIC.id,
        promptLimit: PLANS.BASIC.promptLimit
      }
    });
  } catch (error) {
    console.error('Error upgrading to basic plan:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.subscription || !user.subscription.isActive) {
      return res.status(400).json({ message: 'No active subscription to cancel' });
    }
    
    // Keep the subscription active until the end date
    // Just mark it as non-renewable
    user.subscription.autoRenew = false;
    user.subscription.canceledAt = new Date();
    user.markModified('subscription');
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Subscription canceled successfully. You can continue using your current plan until it expires.',
      subscription: {
        isActive: user.subscription.isActive,
        planId: user.subscription.planId,
        endDate: user.subscription.endDate,
        autoRenew: false
      }
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
