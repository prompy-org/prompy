import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import * as process from 'node:process';
import dotenv from 'dotenv';
import { createGoogleStrategy } from '../config/passport.js';

dotenv.config();

const router = express.Router();

// Google OAuth login route
router.get('/google', (req, res, next) => {
  // Store state and extension ID in session
  req.session.oauthState = req.query.state;
  req.session.extensionId = req.query.extension_id;

  // Use the dynamic strategy
  passport.authenticate(createGoogleStrategy(req), {
    scope: ['profile', 'email']
  })(req, res, next);
});

// Google OAuth callback route
router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate(createGoogleStrategy(req), {
      failureRedirect: '/login-failed',
      session: false
    })(req, res, next);
  },
  (req, res) => {
    // console.log('OAuth callback - User authenticated:', req.user.id);

    // Create JWT token
    const jwtSecret = process.env.ENV === 'PROD' ? process.env.PROD_JWT_SECRET : process.env.DEV_JWT_SECRET;
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        name: req.user.displayName
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Get extension ID from session
    const extensionId = req.session.extensionId;

    // Redirect to a page that will communicate with the extension
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Success</title>
      </head>
      <body>
        <h2>Authentication Successful</h2>
        <p>Redirecting back to extension...</p>
        <script>
          // Send message to extension with the token
          chrome.runtime.sendMessage("${extensionId}",
            { action: "auth_success", token: "${token}" },
            function(response) {
              if (chrome.runtime.lastError) {
                document.body.innerHTML += '<p>Error: Could not communicate with extension. Please close this tab and try again.</p>' + '<p>Error details: ' + chrome.runtime.lastError.message + '</p>';
              } else {
                document.body.innerHTML += '<p>Success! You can close this tab now.</p>';
              }
            }
          );
        </script>
      </body>
      </html>
    `);
  }
);

// Add this route to handle web app authentication
router.get('/google/web', (req, res, next) => {
  // Store state and redirect URL in session
  req.session.oauthState = req.query.state;
  req.session.redirectUrl = req.query.redirect_url;
  // console.log('redirectUrl ===========>', req.session.redirectUrl);

  // Use the dynamic strategy
  passport.authenticate(createGoogleStrategy(req), {
    scope: ['profile', 'email']
  })(req, res, next);
});

// Add web callback route
router.get('/google/web/callback',
  (req, res, next) => {
    passport.authenticate(createGoogleStrategy(req), {
      failureRedirect: '/login-failed',
      session: false
    })(req, res, next);
  },
  (req, res) => {
    // console.log('Web OAuth callback - User authenticated:', req.user.id);

    // Create JWT token
    const jwtSecret = process.env.ENV === 'PROD' ? process.env.PROD_JWT_SECRET : process.env.DEV_JWT_SECRET;
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        name: req.user.displayName
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Get redirect URL from session
    const redirectUrl = req.session.redirectUrl;
    // console.log('redirectUrl callback ===========>', req.session.redirectUrl);

    // Redirect to the web app with the token
    res.redirect(`${redirectUrl}?token=${token}&state=${req.session.oauthState}`);
  }
);

// Login failed route
router.get('/login-failed', (req, res) => {
  res.status(401).json({ message: 'Login failed' });
});

// Logout route
router.post('/logout', (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Failed to logout', error: err.message });
    }

    // Clear the session cookie
    res.clearCookie('connect.sid');

    // Send success response
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

export default router;
