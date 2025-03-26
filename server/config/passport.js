import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';
import * as process from 'node:process';
import dotenv from 'dotenv';

dotenv.config();

// Hard-coded values for testing (replace with env variables in production)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-test-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-test-client-secret';
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

console.log('Passport config - Google Client ID:', GOOGLE_CLIENT_ID ? 'ID present' : 'No ID');
console.log('Passport config - Google Client Secret:', GOOGLE_CLIENT_SECRET ? 'Secret present' : 'No secret');
console.log('Passport config - Callback URL:', CALLBACK_URL);

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log('Google Strategy - Profile received:', profile.id);
    try {
      // Check if user exists
      let user = await User.findOne({ googleId: profile.id });
      console.log('Google Strategy - User found:', user ? 'Yes' : 'No');
      
      if (!user) {
        console.log('Google Strategy - Creating new user');
        // Create new user if doesn't exist
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          avatar: profile.photos[0].value
        });
        console.log('Google Strategy - New user created:', user.id);
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Google Strategy - Error:', error.message);
      return done(error, null);
    }
  }
));

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

export default passport;
