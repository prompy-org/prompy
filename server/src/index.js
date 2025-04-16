import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { requestLogger } from './middleware/requestLogger.js';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from './config/passport.js';
import promptRoutes from './routes/promptRoutes.js';
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { verifyToken } from './middleware/auth.js';

// Load environment variables
dotenv.config();

// Configure Express app
const app = express();
const PORT = process.env.ENV === 'PROD' ? process.env.PROD_PORT : process.env.DEV_PORT;

// Define MongoDB URI
const MONGODB_URI = process.env.ENV === 'PROD' ? process.env.PROD_MONGODB_URI : process.env.DEV_MONGODB_URI;

// Middleware
const allowedOrigins = process.env.ENV === 'PROD' ? process.env.PROD_ALLOWED_ORIGINS.split(',') : process.env.DEV_ALLOWED_ORIGINS.split(',');

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Enable CORS with the specified options
app.use(cors(corsOptions));

// Apply security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('dev'));
app.use(requestLogger);

app.set('trust proxy', 3);

app.use(express.json());

// Session setup
app.use(session({
  secret: process.env.ENV === 'PROD' ? process.env.PROD_SESSION_SECRET : process.env.DEV_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    ttl: 7 * 24 * 60 * 60, // = 7 days. Default
    autoRemove: 'native', // Default
    touchAfter: 24 * 3600, // time period in seconds to update session in database only once in a period regardless of how many times the session is accessed
    crypto: {
      secret: process.env.ENV === 'PROD' ? process.env.PROD_SESSION_SECRET : process.env.DEV_SESSION_SECRET
    },
    collectionName: 'sessions' // Collection name for sessions
  }),
  cookie: {
    secure: process.env.ENV === 'PROD', // Use secure cookies in production
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/prompts', verifyToken, promptRoutes); // Protected routes
app.use('/api/payment', verifyToken, paymentRoutes); // Payment routes
app.use('/api/user', userRoutes); // User routes

// Root route
app.get('/', (req, res) => {
  res.send('Prompy API is running');
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('MongoDB connection error:', error);
  });

