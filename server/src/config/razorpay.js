import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay instance with environment variables
const RAZORPAY_KEY_ID = process.env.NODE_ENV === 'PROD' ? process.env.PROD_RAZORPAY_KEY_ID : process.env.DEV_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.NODE_ENV === 'PROD' ? process.env.PROD_RAZORPAY_KEY_SECRET : process.env.DEV_RAZORPAY_KEY_SECRET;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

export default razorpayInstance;