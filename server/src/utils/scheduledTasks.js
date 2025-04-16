import { cleanupExpiredSessions } from './sessionUtils.js';

/**
 * Set up scheduled tasks for the application
 * @param {Object} app - Express app instance
 */
export const setupScheduledTasks = (app) => {
  // Schedule session cleanup to run periodically
  const sessionCleanupInterval = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
  
  // Initial delay before first cleanup
  const initialDelay = 10 * 60 * 1000; // 10 minutes in milliseconds
  
  // Set up the interval for session cleanup
  setTimeout(() => {
    // Run the first cleanup after initial delay
    runSessionCleanup(app);
    
    // Then set up the regular interval
    setInterval(() => {
      runSessionCleanup(app);
    }, sessionCleanupInterval);
  }, initialDelay);
  
  console.log('Scheduled session cleanup task initialized');
};

/**
 * Run the session cleanup task
 * @param {Object} app - Express app instance
 */
const runSessionCleanup = (app) => {
  if (!app || !app.get) {
    console.error('Invalid app instance for session cleanup');
    return;
  }
  
  // Get the session store from the app
  const sessionStore = app.get('sessionStore');
  
  if (!sessionStore) {
    console.error('Session store not available for cleanup');
    return;
  }
  
  console.log('Running scheduled session cleanup...');
  
  cleanupExpiredSessions(sessionStore)
    .then(count => {
      console.log(`Session cleanup completed. Removed ${count} expired sessions.`);
    })
    .catch(err => {
      console.error('Error during scheduled session cleanup:', err);
    });
};
