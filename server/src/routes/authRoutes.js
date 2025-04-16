import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import * as process from 'node:process';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createGoogleStrategy } from '../config/passport.js';
import { cleanupExpiredSessions } from '../utils/sessionUtils.js';
import { verifyToken } from '../middleware/auth.js';

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

    // Generate a nonce for the inline script
    const nonce = crypto.randomBytes(16).toString('base64');

    // Redirect to a page that will communicate with the extension
    res.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'`);
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Success</title>
      </head>
      <body>
        <h2>Authentication Successful</h2>
        <p>Redirecting back to extension...</p>
        <script nonce="${nonce}">
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
  if (!req.session) {
    // If there's no session, just clear the cookie and return success
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Already logged out' });
  }

  // Get the session ID before destroying it
  const sessionId = req.session.id;
  console.log('Logging out session ID:', sessionId);

  // Access the session store directly
  const sessionStore = req.sessionStore;

  // First destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ message: 'Failed to logout', error: err.message });
    }

    // Clear the session cookie
    res.clearCookie('connect.sid');

    // Then explicitly remove from the store if we have access to it
    if (sessionStore && typeof sessionStore.destroy === 'function') {
      try {
        sessionStore.destroy(sessionId, (storeErr) => {
          if (storeErr) {
            console.error('Error removing session from store:', storeErr);
          } else {
            console.log('Session successfully removed from store');
          }

          // Send success response
          res.status(200).json({ message: 'Logged out successfully' });
        });
      } catch (error) {
        console.error('Exception when removing session from store:', error);
        // Send success response anyway since the session cookie is cleared
        res.status(200).json({ message: 'Logged out successfully' });
      }
    } else {
      // If we can't access the store's destroy method, just return success
      console.log('Session store destroy method not available, session may remain in database');
      res.status(200).json({ message: 'Logged out successfully' });
    }
  });
});

// Admin route to manually clean up expired sessions
router.post('/cleanup-sessions', verifyToken, (req, res) => {
  // Only allow admin users to trigger this
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const sessionStore = req.sessionStore;

  if (!sessionStore) {
    return res.status(500).json({ message: 'Session store not available' });
  }

  cleanupExpiredSessions(sessionStore)
    .then(count => {
      res.status(200).json({
        message: 'Session cleanup completed',
        sessionsRemoved: count
      });
    })
    .catch(err => {
      console.error('Error cleaning up sessions:', err);
      res.status(500).json({
        message: 'Failed to clean up sessions',
        error: err.message
      });
    });
});

export default router;
