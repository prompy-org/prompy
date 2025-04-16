/**
 * Authentication-related API services
 */

/**
 * Check if the user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const token = localStorage.getItem('authToken');
  return !!token;
}

/**
 * Get the authentication token
 * @returns {string|null} The authentication token or null if not authenticated
 */
export function getAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem('authToken');
}

/**
 * Set the authentication token
 * @param {string} token - The authentication token
 */
export function setAuthToken(token) {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem('authToken', token);
}

/**
 * Clear the authentication token (logout)
 */
export function clearAuthToken() {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem('authToken');
}

/**
 * Logout the user
 */
export function logout() {
  clearAuthToken();
  
  // Redirect to home page
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}
