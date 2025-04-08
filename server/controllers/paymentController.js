import crypto from "crypto";
import User from "../models/userModel.js";
import dotenv from "dotenv";
import razorpayInstance from "../config/razorpay.js";
import PLANS from "../constants/plans.js";

dotenv.config();

// Create order
export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    // Input validation
    if (!planId) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Prevent duplicate purchase of one-time plan
    if (planId === "one_time_payment_plan" && user.isAdvancedUser) {
      return res
        .status(400)
        .json({ message: "User already has an Extended plan" });
    }
    
    // Get plan details
    const planKey = Object.keys(PLANS).find((key) => PLANS[key].id === planId);
    if (!planKey) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const plan = PLANS[planKey];

    // Generate a unique order ID with more entropy
    const randomString = crypto.randomBytes(8).toString("hex");
    const receiptId = `order_${Date.now()}_${randomString}`;

    // Create order with Razorpay
    const options = {
      amount: plan.amount * 100, // Convert to paise
      currency: plan.currency || "INR",
      receipt: receiptId,
      notes: {
        planId: plan.id,
        userId: userId,
        planName: plan.name,
      },
    };

    const order = await razorpayInstance.orders.create(options);

    if (!order || !order.id) {
      return res.status(500).json({ message: "Failed to create payment order" });
    }
    
    // Store order information in user document
    user.subscription = user.subscription || {};
    user.subscription.orderId = order.id;
    
    // Only update planId for subscription plans, not for one-time payment
    if (planId !== "one_time_payment_plan") {
      user.subscription.planId = plan.id;
    }
    
    user.subscription.pendingUpgrade = true;
    
    // For one-time payment plan, mark user as advanced immediately
    // The actual subscription details will be updated after payment verification
    if (planId === "one_time_payment_plan") {
      user.isAdvancedUserOrdered = true;
    }
    
    user.markModified("subscription");
    await user.save();

    // Return order details to frontend
    const orderResponse = {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
    
    return res.status(200).json({ success: true, order: orderResponse });
  } catch (error) {
    console.error("Error creating subscription order:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Verify payment webhook
export const handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const webhookSignature = req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      console.error("Missing webhook signature");
      return res.status(400).json({ message: "Missing signature" });
    }

    // Verify the webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const generatedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

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
    switch (event) {
      case "payment.authorized":
        // Payment was successful
        await handleSuccessfulPayment(order.id);
        break;
      case "payment.failed":
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
    console.error("Error processing webhook:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Helper function to handle successful payment
const handleSuccessfulPayment = async (orderId) => {
  try {
    // Use findOneAndUpdate instead of findOne to avoid concurrency issues
    const user = await User.findOne({ "subscription.orderId": orderId });
    
    if (!user) {
      console.error(`No user found with order ID: ${orderId}`);
      return;
    }

    const payment = await razorpayInstance.orders.fetchPayments(orderId);
    const paymentId = payment.items[0].id;
    const paymentAmount = payment.items[0].amount / 100; // Convert from paise to rupees

    // Get plan details
    const planKey = Object.keys(PLANS).find(
      (key) => PLANS[key].id === user.subscription.planId
    );
    if (!planKey) {
      console.error(`Plan not found for ID: ${user.subscription.planId}`);
      return;
    }

    if (user.isAdvancedUserOrdered) {
      user.isAdvancedUserOrdered = false;
      user.isAdvancedUser = true;
      user.advancedUserSince = new Date();
      user.promptLimit = plan.promptLimit;
      user.previousStatus = {
        isAdvancedUser: true,
        promptLimit: plan.promptLimit
      };
    }

    const plan = PLANS[planKey];
    const now = new Date();
    
    // Prepare update object
    const updateData = {
      $push: { 
        payments: {
          paymentId: paymentId,
          orderId: orderId,
          planId: plan.id,
          amount: plan.amount,
          date: now
        }
      },
      $set: {
        "subscription.paymentId": paymentId,
        "subscription.lastPaymentDate": now,
        "subscription.pendingUpgrade": false,
        promptLimit: plan.promptLimit
      }
    };

    // Store previous status before applying subscription changes
    // Only store if moving to an unlimited plan
    if (plan.promptLimit === -1 && user.promptLimit !== -1) {
      updateData.$set.previousStatus = {
        isAdvancedUser: user.isAdvancedUser,
        promptLimit: user.promptLimit
      };
    }

    // Handle one-time payment plan separately from subscription plans
    if (plan.id === 'one_time_payment_plan') {
      // For one-time payment, just set the user as advanced
      updateData.$set.isAdvancedUser = true;
      updateData.$set.advancedUserSince = now;
      
      // Don't modify subscription.planId or subscription.isActive for one-time payment
      // This keeps subscription plans separate from advanced status
    } 
    else {
      // For subscription plans, update the subscription details
      updateData.$set["subscription.isActive"] = true;
      updateData.$set["subscription.planName"] = plan.name;
      updateData.$set["subscription.planId"] = plan.id;
      
      // Get current active subscriptions and filter out expired ones
      let activeSubscriptions = user.activeSubscriptions || [];
      activeSubscriptions = activeSubscriptions.filter(sub => 
        sub.endDate && new Date(sub.endDate) > now
      );
      
      // Find the latest end date from existing active subscriptions
      let startFromDate = now;
      if (activeSubscriptions.length > 0) {
        // Find the furthest end date from current subscriptions
        const currentLatestEndDate = activeSubscriptions.reduce(
          (latest, sub) => {
            const subEndDate = new Date(sub.endDate);
            return subEndDate > latest ? subEndDate : latest;
          },
          new Date(activeSubscriptions[0].endDate)
        );
        
        // Start the new subscription from the end of the current one
        startFromDate = currentLatestEndDate;
      }
      
      // Calculate end date for new subscription starting from the latest end date
      const newEndDate = new Date(
        startFromDate.getTime() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000
      );
      
      // Create new subscription entry with proper start date
      const newSubscription = {
        planId: plan.id,
        planName: plan.name,
        startDate: startFromDate,
        endDate: newEndDate,
        orderId: orderId,
        paymentId: paymentId,
        purchaseDate: now
      };
      
      // Add new subscription to the list
      activeSubscriptions.push(newSubscription);
      
      // Calculate the furthest end date from all active subscriptions
      const latestEndDate = activeSubscriptions.reduce(
        (latest, sub) => {
          const subEndDate = new Date(sub.endDate);
          return subEndDate > latest ? subEndDate : latest;
        },
        new Date(newSubscription.endDate)
      );
      
      // Update subscription details
      updateData.$set.activeSubscriptions = activeSubscriptions;
      updateData.$set["subscription.startDate"] = now; // Purchase date remains the actual purchase time
      updateData.$set["subscription.endDate"] = latestEndDate; // End date is the furthest date
    }

    // Use findOneAndUpdate with { new: true } to get the updated document
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      updateData,
      { 
        new: true, 
        runValidators: true,
        upsert: false
      }
    );

    if (!updatedUser) {
      console.error(`Failed to update user with ID: ${user._id}`);
      return;
    }

    console.log(`Payment processed for user: ${updatedUser._id}`);
  } catch (error) {
    console.error("Error handling successful payment:", error);
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
    if (user.isAdvancedUserOrdered) {
      user.isAdvancedUserOrdered = false;
    }
    // Reset pending upgrade flag
    user.subscription.pendingUpgrade = false;
    user.subscription.isActive = user.activeSubscriptions.length > 0 ? true : false;
    user.subscription.planId = user.activeSubscriptions.$pop().planId;
    user.markModified("subscription");
    await user.save();

    console.log(`Payment failed for user: ${user._id}`);
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
};

// Verify payment status
export const verifyPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign, "utf-8")
      .digest("hex");

    const orderId = razorpay_order_id;
    // Input validation
    if (!orderId || !orderId.match(/^order_[a-zA-Z0-9_]+$/)) {
      return res
        .status(400)
        .json({ message: `Invalid order ID format: ${orderId}` });
    }
    if (expectedSignature !== razorpay_signature) {
      await handleFailedPayment(orderId);
      return res.status(400).json({ message: "Invalid signature" });
    }

    await handleSuccessfulPayment(orderId);
    return res
      .status(200)
      .json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    await handleFailedPayment(orderId);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get details for the current subscription of the user
export const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if subscription has expired before returning details
    await checkSubscriptionExpiry(userId);
    
    const user = await User.findById(userId, {
      promptCount: 1,
      promptLimit: 1,
      subscription: 1,
      isAdvancedUser: 1,
      advancedUserSince: 1,
      previousStatus: 1,
      payments: 1,
      activeSubscriptions: 1
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Determine plan status
    let response = {
      promptLimit: user.promptLimit,
      isAdvancedUser: user.isAdvancedUser,
      advancedUserSince: user.advancedUserSince,
      payments: user.payments || []
    };
    
    // Add subscription details if user has an active subscription
    if (user.subscription && user.subscription.isActive) {
      response.plan = user.subscription.planId;
      response.subscription = {
        startDate: user.subscription.startDate,
        endDate: user.subscription.endDate,
        isActive: user.subscription.isActive
      };
      response.activeSubscriptions = user.activeSubscriptions || [];
    } 
    // Otherwise, determine plan based on user status
    else {
      response.plan = user.isAdvancedUser ? "one_time_payment_plan" : "plan_basic";
    }
    
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error getting user subscription:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.subscription || !user.subscription.isActive) {
      return res
        .status(400)
        .json({ message: "No active subscription to cancel" });
    }

    user.subscription.isActive = false;
    user.subscription.canceledAt = new Date();
    user.markModified("subscription");
    await user.save();

    return res
      .status(200)
      .json({ message: "Subscription canceled successfully" });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { razorpay_order_id } = req.body;
    const orderId = razorpay_order_id;
    // Input validation
    if (!orderId || !orderId.match(/^order_[a-zA-Z0-9_]+$/)) {
      return res
        .status(400)
        .json({ message: `Invalid order ID format: ${orderId}` });
    }

    await handleFailedPayment(orderId);
    return res
      .status(200)
      .json({ message: "Order canceled successfully" });
  } catch (error) {
    console.error("Error canceling order:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Function to check and handle expired subscriptions
// This can be called from various endpoints or scheduled jobs
export const checkSubscriptionExpiry = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.subscription || !user.subscription.isActive) {
      return false;
    }

    const now = new Date();
    
    // Clean up expired subscriptions
    if (user.activeSubscriptions && user.activeSubscriptions.length > 0) {
      const originalCount = user.activeSubscriptions.length;
      
      // Remove expired subscriptions
      user.activeSubscriptions = user.activeSubscriptions.filter(sub => 
        sub.endDate && new Date(sub.endDate) > now
      );
      
      // If we removed any subscriptions, update the main subscription end date
      if (user.activeSubscriptions.length < originalCount) {
        if (user.activeSubscriptions.length === 0) {
          // All subscriptions expired
          user.subscription.isActive = false;
          
          // Restore previous status
          if (user.previousStatus) {
            if (user.previousStatus.isAdvancedUser) {
              // If user was advanced before subscription, restore advanced limit
              user.promptLimit = PLANS.ONE_TIME_PAYMENT_PLAN.promptLimit;
            } else {
              // Otherwise restore basic limit
              user.promptLimit = PLANS.FREE_TIER.promptLimit;
            }
          } else {
            // Fallback if no previous status
            user.promptLimit = user.isAdvancedUser ? 
              PLANS.ONE_TIME_PAYMENT_PLAN.promptLimit : 
              PLANS.FREE_TIER.promptLimit;
          }
        } else {
          // Some subscriptions still active, update end date to furthest one
          const latestEndDate = user.activeSubscriptions.reduce(
            (latest, sub) => {
              const subEndDate = new Date(sub.endDate);
              return subEndDate > latest ? subEndDate : latest;
            },
            new Date(user.activeSubscriptions[0].endDate)
          );
          
          user.subscription.endDate = latestEndDate;
        }
        
        user.markModified("subscription");
        user.markModified("activeSubscriptions");
        await user.save();
        return true; // Subscription status was updated
      }
    } else {
      // Legacy check for single subscription
      const endDate = user.subscription.endDate ? new Date(user.subscription.endDate) : null;
      
      if (endDate && now > endDate) {
        // Subscription has expired
        user.subscription.isActive = false;
        
        // Restore previous status
        if (user.previousStatus) {
          if (user.previousStatus.isAdvancedUser) {
            user.promptLimit = PLANS.ONE_TIME_PAYMENT_PLAN.promptLimit;
          } else {
            user.promptLimit = PLANS.FREE_TIER.promptLimit;
          }
        } else {
          user.promptLimit = user.isAdvancedUser ? 
            PLANS.ONE_TIME_PAYMENT_PLAN.promptLimit : 
            PLANS.FREE_TIER.promptLimit;
        }
        
        user.markModified("subscription");
        await user.save();
        return true; // Subscription was expired and handled
      }
    }
    
    return false; // Subscription is still active
  } catch (error) {
    console.error("Error checking subscription expiry:", error);
    return false;
  }
};
