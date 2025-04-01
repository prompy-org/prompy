import { Cashfree } from "cashfree-pg";
import User from '../models/userModel.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Constants for subscription plans
const PLANS = {
  UNLIMITED: {
    id: 'unlimited',
    name: 'Unlimited Plan',
    amount: 353,
    currency: 'INR',
    interval: 'monthly'
  }
};

// Create a payment order
export const createSubscriptionOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;
    
    // Validate plan
    if (!PLANS[planId.toUpperCase()]) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }
    
    const plan = PLANS[planId.toUpperCase()];
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate a unique order ID
    const orderId = `order_${Date.now()}_${userId.substring(0, 5)}`;
    
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
    const response = await Cashfree.PGCreateOrder("2023-08-01", orderRequest);
    
    if (response.data && response.data.payment_session_id) {
      // Store order information in user document
      // Update subscription fields directly
      user.subscription.orderId = orderId;
      user.subscription.planId = plan.id;
      console.log("User:", user);
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
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify payment webhook
export const handleWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    const signature = req.headers["x-webhook-signature"];
    
    // Verify webhook signature
    const computedSignature = crypto
      .createHmac("sha256", process.env.CASHFREE_SECRET_KEY)
      .update(JSON.stringify(webhookData))
      .digest("base64");
    
    if (computedSignature !== signature) {
      console.error("Invalid webhook signature");
      return res.status(400).json({ message: "Invalid signature" });
    }
    
    // Process the webhook data
    const { order_id, order, payment } = webhookData.data;
    
    if (payment.payment_status === "SUCCESS") {
      // Find user by order ID
      const user = await User.findOne({ "subscription.orderId": order_id });
      
      if (!user) {
        console.error(`User not found for order ${order_id}`);
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update subscription details
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
      
      user.subscription = {
        isActive: true,
        planId: user.subscription.planId,
        startDate: now,
        endDate: endDate,
        subscriptionId: `sub_${order_id}`, // Generate subscription ID
        orderId: order_id,
        paymentId: payment.payment_id,
        lastPaymentDate: now
      };
      
      await user.save();
      console.log(`Subscription activated for user ${user._id}`);
    }
    
    return res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify payment status
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    console.log("Verifying payment for User:", userId, req.user);
    
    // Verify the user owns this order
    const user = await User.findOne({ 
      _id: userId,
      "subscription.orderId": orderId 
    });
    
    if (!user) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }
    
    // Get order details from Cashfree
    const response = await Cashfree.PGFetchOrder("2023-08-01", orderId);
    
    if (response.data && response.data.order_status === "PAID") {
      // If payment is successful but webhook hasn't processed yet
      if (!user.subscription.isActive) {
        const now = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        console.log("Activating subscription for user:", response.data);
        
        user.subscription.isActive = true;
        user.subscription.planId = user.subscription.planId;
        user.subscription.startDate = now;
        user.subscription.endDate = endDate;
        user.subscription.subscriptionId = `sub_${orderId}`;
        user.subscription.orderId = orderId;
        user.subscription.paymentId = response.data.payment_session_id;
        user.subscription.lastPaymentDate = now;
        
        await user.save();
      }
      
      return res.status(200).json({ 
        success: true,
        subscription: user.subscription
      });
    } else {
      return res.status(200).json({ 
        success: false,
        status: response.data.order_status
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
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
