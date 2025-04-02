import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import * as process from 'node:process';
import session from 'express-session';
import passport from './config/passport.js';
import promptRoutes from './routes/promptRoutes.js';
import authRoutes from './routes/authRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { verifyToken } from './middleware/auth.js';
import { Cashfree } from "cashfree-pg"; 

// Load environment variables
dotenv.config();

// Configure Cashfree
Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = process.env.NODE_ENV === 'production' 
  ? Cashfree.Environment.PRODUCTION 
  : Cashfree.Environment.SANDBOX;

// Log environment variables (without exposing secrets)
// console.log('Server - Environment variables:');
// console.log('  PORT:', process.env.PORT || '5000 (default)');
// console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || '* (default)');
// console.log('  SESSION_SECRET:', process.env.SESSION_SECRET ? 'Set' : 'Using default');
// console.log('  JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Using default');
// console.log('  MONGODB_URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/prompy (default)');
// console.log('  USE_TEST_DATA:', process.env.USE_TEST_DATA || 'false (default)');
// console.log('  GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
// console.log('  GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
// console.log('  CALLBACK_URL:', process.env.CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback (default)');
// console.log('  CASHFREE_CLIENT_ID:', process.env.CASHFREE_CLIENT_ID ? 'Set' : 'Not set');
// console.log('  CASHFREE_SECRET_KEY:', process.env.CASHFREE_SECRET_KEY ? 'Set' : 'Not set');
// console.log('  SERVER_URL:', process.env.SERVER_URL || 'http://localhost:5000 (default)');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'test-session-secret',
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', verifyToken, promptRoutes); // Protected routes
app.use('/api/subscription', subscriptionRoutes); // Subscription routes
app.use('/api/user', userRoutes); // User routes

// Root route
app.get('/', (req, res) => {
  res.send('Prompy API is running');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prompy')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
  });

