import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: false
  },
  planId: String,
  startDate: Date,
  endDate: Date,
  orderId: String,
  paymentId: String,
  lastPaymentDate: Date,
  promptLimit: {
    type: Number,
    default: 50 // Default limit for free tier
  },
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
  subscription: {
    type: subscriptionSchema,
    default: () => ({})
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

export default User;
