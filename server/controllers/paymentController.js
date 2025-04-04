import crypto from 'crypto';
import User from '../models/userModel.js';
import dotenv from 'dotenv';
import razorpayInstance from '../config/razorpay.js';
import PLANS from '../constants/plans.js';

dotenv.config();

// Create order
export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;
    
    // Input validation
    if (!planId) {
      return res.status(400).json({ message: 'Plan ID is required' });
    }
    
    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.subscription && user.subscription.isActive && planId === "one_time_payment_plan") {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }
    
    // Get plan details (replace with your plan logic)
    const planKey = Object.keys(PLANS).find(key => PLANS[key].id === planId);
    if (!planKey) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    const plan = PLANS[planKey];
    
    // Generate a unique order ID with more entropy
    const randomString = crypto.randomBytes(8).toString('hex');
    const receiptId = `order_${Date.now()}_${randomString}`;
    
    // Create order with Razorpay
    const options = {
      amount: plan.amount * 100, // Convert to paise
      currency: plan.currency || 'INR',
      receipt: receiptId,
      notes: {
        planId: plan.id,
        userId: userId,
        planName: plan.name
      }
    };
    
    const order = await razorpayInstance.orders.create(options);
    
    if (order && order.id) {
      // Store order information in user document
      user.subscription = user.subscription || {};
      user.subscription.orderId = order.id;
      user.subscription.planId = plan.id;
      user.subscription.pendingUpgrade = true;
      user.markModified('subscription');
      await user.save();
      
      // Return order details to frontend
      const orderResponse = {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      }
      return res.status(200).json({ success: true, order: orderResponse});
    } else {
      return res.status(500).json({ message: 'Failed to create payment order' });
    }
  } catch (error) {
    console.error('Error creating subscription order:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Verify payment webhook
export const handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const webhookSignature = req.headers['x-razorpay-signature'];
    
    if (!webhookSignature) {
      console.error("Missing webhook signature");
      return res.status(400).json({ message: "Missing signature" });
    }
    
    // Verify the webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const generatedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');
      
    if (generatedSignature !== webhookSignature) {
      console.error("Invalid webhook signature");
      return res.status(400).json({ message: "Invalid signature" });
    }
    
    // Process the webhook event
    const event = req.body.event;
    const payload = req.body.payload;
    const payment = payload.payment?.entity;
    const order = payload.order?.entity;
    
    if (!payment || !order) {
      return res.status(400).json({ message: "Invalid webhook payload" });
    }
    
    // Handle different event types
    switch(event) {
      case 'payment.authorized':
        // Payment was successful
        await handleSuccessfulPayment(order.id);
        break;
      case 'payment.failed':
        // Payment failed
        await handleFailedPayment(order.id);
        break;
      default:
        // Log unhandled event type
        console.log(`Unhandled webhook event: ${event}`);
    }
    
    // Acknowledge receipt of webhook
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to handle successful payment
const handleSuccessfulPayment = async (orderId) => {
  try {
    // Find user with this order ID
    const user = await User.findOne({ "subscription.orderId": orderId });
    const payment = await razorpayInstance.orders.fetchPayments(orderId);
    const paymentId = payment.items[0].id;
    
    if (!user) {
      console.error(`No user found with order ID: ${orderId}`);
      return;
    }
    
    // Get plan details
    const planKey = Object.keys(PLANS).find(key => PLANS[key].id === user.subscription.planId);
    if (!planKey) {
      console.error(`Plan not found for ID: ${user.subscription.planId}`);
      return;
    }
    
    const plan = PLANS[planKey];
    
    // Update user subscription
    user.subscription.isActive = true;
    user.subscription.paymentId = paymentId;
    user.promptLimit = plan.promptLimit;
    user.subscription.lastPaymentDate = new Date();
    user.isAdvancedUser = user.subscription.planId === 'one_time_payment_plan';
    user.subscription.pendingUpgrade = false;
    if (plan.durationMonths > 0) {
      // extend the current end date of the subscription
      const now = new Date();
      const endDate = user.subscription.endDate || now;
      user.subscription.startDate = now;
      user.subscription.endDate = new Date(endDate.getTime() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000);
    }
    console.log('plan', plan, '/n', user.subscription);
    
    user.markModified('subscription');
    await user.save();
    
    console.log(`Subscription activated for user: ${user._id}`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
};

// Helper function to handle failed payment
const handleFailedPayment = async (orderId) => {
  try {
    // Find user with this order ID
    const user = await User.findOne({ "subscription.orderId": orderId });
    
    if (!user) {
      console.error(`No user found with order ID: ${orderId}`);
      return;
    }
    
    // Reset pending upgrade flag
    user.subscription.pendingUpgrade = false;
    user.subscription.isActive = false;
    user.markModified('subscription');
    await user.save();
    
    console.log(`Payment failed for user: ${user._id}`);
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
};

// Verify payment status (fallback if webhook hasn't processed)
export const verifyPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign, "utf-8")
      .digest('hex');
    
    const orderId = razorpay_order_id;
    // Input validation
    if (!orderId || !orderId.match(/^order_[a-zA-Z0-9_]+$/)) {
      return res.status(400).json({ message: `Invalid order ID format: ${orderId}` });
    }
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    await handleSuccessfulPayment(orderId);
    return res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    await handleFailedPayment(orderId);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Get details for the current subscription of the user
export const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId, { promptCount: 1, promptLimit: 1, subscription: 1 });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.subscription || !user.subscription.isActive) {
      return res.status(200).json({ plan: "plan_basic" });
    }
    return res.status(200).json({ plan: user.subscription.planId });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

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

    user.subscription.isActive = false;
    user.subscription.canceledAt = new Date();
    user.markModified('subscription');
    await user.save();

    return res.status(200).json({ message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};