import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';
import * as process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

// Hard-coded values for testing (replace with env variables in production)
const GOOGLE_CLIENT_ID = process.env.ENV === 'PROD' ? process.env.PROD_GOOGLE_CLIENT_ID : process.env.DEV_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.ENV === 'PROD' ? process.env.PROD_GOOGLE_CLIENT_SECRET : process.env.DEV_GOOGLE_CLIENT_SECRET;
const CALLBACK_PATH = process.env.ENV === 'PROD' ? process.env.PROD_CALLBACK_PATH : process.env.DEV_CALLBACK_PATH;
const WEB_CALLBACK_PATH = process.env.ENV === 'PROD' ? process.env.PROD_WEB_CALLBACK_PATH : process.env.DEV_WEB_CALLBACK_PATH;

// Function to dynamically create the callback URL
const createCallbackURL = (req) => {
  // Get protocol (http or https)
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  
  // Get host (e.g., localhost:5000 or your-domain.com)
  const host = req.headers['x-forwarded-host'] || req.get('host');
  
  // Determine if this is a web authentication request
  const isWebAuth = req.path.includes('/web');
  
  // Use the appropriate callback path based on the request type
  const callbackPath = isWebAuth 
    ? WEB_CALLBACK_PATH
    : CALLBACK_PATH;
  
  return `${protocol}://${host}${callbackPath}`;
};

// console.log('Passport config - Google Client ID:', GOOGLE_CLIENT_ID ? 'ID present' : 'No ID');
// console.log('Passport config - Google Client Secret:', GOOGLE_CLIENT_SECRET ? 'Secret present' : 'No secret');
// console.log('Passport config - Callback Path:', CALLBACK_PATH);

// Create a function that returns the strategy with the dynamic callback URL
const createGoogleStrategy = (req) => {
  const callbackURL = createCallbackURL(req);
  // console.log('Passport config - Generated Callback URL:', callbackURL);
  
  return new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    // console.log('Google Strategy - Profile received:', profile.id);
    try {
      // Check if user exists
      let user = await User.findOne({ googleId: profile.id });
      // console.log('Google Strategy - User found:', user ? 'Yes' : 'No');
      
      if (!user) {
        // console.log('Google Strategy - Creating new user');
        // Create new user if doesn't exist
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          avatar: profile.photos[0].value
        });
        // console.log('Google Strategy - New user created:', user.id);
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Google Strategy - Error:', error.message);
      return done(error, null);
    }
  });
};

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export { createGoogleStrategy };
export default passport;
