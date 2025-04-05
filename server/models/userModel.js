import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: false
  },
  planId: String,
  planName: String,
  startDate: Date,
  endDate: Date,
  orderId: String,
  paymentId: String,
  lastPaymentDate: Date,
  autoRenew: {
    type: Boolean,
    default: true
  },
  canceledAt: Date,
  pendingUpgrade: {
    type: Boolean,
    default: false
  },
  subscriptionId: String
});

const paymentSchema = new mongoose.Schema({
  paymentId: String,
  orderId: String,
  planId: String,
  amount: Number,
  date: {
    type: Date,
    default: Date.now
  }
});

const activeSubscriptionSchema = new mongoose.Schema({
  planId: String,
  planName: String,
  startDate: Date,
  endDate: Date,
  orderId: String,
  paymentId: String,
  purchaseDate: Date
});

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  avatar: String,
  isAdvancedUser: {
    type: Boolean,
    default: false
  },
  advancedUserSince: {
    type: Date,
    default: null
  },
  promptLimit: {
    type: Number,
    default: 50 // Default limit for free tier
  },
  promptCount: {
    type: Number,
    default: 0
  },
  subscription: {
    type: subscriptionSchema,
    default: () => ({})
  },
  // Add this field to track previous status for reverting after subscription expiry
  previousStatus: {
    isAdvancedUser: {
      type: Boolean,
      default: false
    },
    promptLimit: {
      type: Number,
      default: 50
    }
  },
  // Add this field to track multiple active subscriptions
  activeSubscriptions: {
    type: [activeSubscriptionSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  payments: [paymentSchema]
});

const User = mongoose.model('User', userSchema);

export default User;
