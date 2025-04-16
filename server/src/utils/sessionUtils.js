/**
 * Utility functions for session management
 */

/**
 * Manually clean up expired sessions in MongoDB
 * @param {Object} sessionStore - The session store instance
 * @returns {Promise<number>} - Number of sessions removed
 */
export const cleanupExpiredSessions = (sessionStore) => {
  return new Promise((resolve, reject) => {
    if (!sessionStore || typeof sessionStore.all !== 'function' || typeof sessionStore.destroy !== 'function') {
      return reject(new Error('Invalid session store'));
    }

    // Get all sessions
    sessionStore.all((err, sessions) => {
      if (err) {
        return reject(err);
      }

      if (!sessions || Object.keys(sessions).length === 0) {
        return resolve(0);
      }

      const now = Date.now();
      let removedCount = 0;
      const promises = [];

      // Check each session for expiration
      Object.keys(sessions).forEach(sid => {
        let session = sessions[sid];

        // Handle case where session might be stored as a string
        if (typeof session === 'string') {
          try {
            session = JSON.parse(session);
          } catch (e) {
            console.error(`Error parsing session ${sid}:`, e);
            return; // Skip this session
          }
        }

        // If session has expired, remove it
        if (session && session.expires && new Date(session.expires) < now) {
          promises.push(
            new Promise((resolveSession) => {
              sessionStore.destroy(sid, (destroyErr) => {
                if (!destroyErr) {
                  removedCount++;
                }
                resolveSession();
              });
            })
          );
        }
      });

      // Wait for all destroy operations to complete
      Promise.all(promises)
        .then(() => resolve(removedCount))
        .catch(error => reject(error));
    });
  });
};
