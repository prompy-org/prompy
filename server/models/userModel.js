import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: false
  },
  planId: String,
  startDate: Date,
  endDate: Date,
  subscriptionId: String,
  orderId: String,
  paymentId: String,
  lastPaymentDate: Date
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
  }
});

const User = mongoose.model('User', userSchema);

export default User;
