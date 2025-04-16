import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { requestLogger } from './middleware/requestLogger.js';
import dotenv from 'dotenv';
import session from 'express-session';
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
const PORT = process.env.NODE_ENV === 'PROD' ? process.env.PROD_PORT : process.env.DEV_PORT;

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'PROD' ? process.env.PROD_ALLOWED_ORIGINS.split(',') : process.env.DEV_ALLOWED_ORIGINS.split(',');

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
  secret: process.env.NODE_ENV == 'PROD' ? process.env.PROD_SESSION_SECRET : process.env.DEV_SESSION_SECRET,
  resave: false,
  saveUninitialized: false
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
const MONGODB_URI = process.env.NODE_ENV === 'PROD' ? process.env.PROD_MONGODB_URI : process.env.DEV_MONGODB_URI;
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

