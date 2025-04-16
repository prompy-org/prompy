/**
 * API utility functions for making requests to the backend server
 */

// Base URL for the backend API
const API_BASE_URL = process.env.NODE_ENV === 'PROD' ? process.env.NEXT_PUBLIC_PROD_API_URL : process.env.NEXT_PUBLIC_DEV_API_URL;

/**
 * Make a request to the backend API
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
export async function fetchFromAPI(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Make an authenticated request to the backend API
 * @param {string} endpoint - API endpoint path
 * @param {Object} options - Fetch options
 * @param {string} token - Authentication token
 * @returns {Promise<any>} - Response data
 */
export async function fetchWithAuth(endpoint, options = {}, token) {
  // Get token from parameter or localStorage (client-side only)
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
  
  if (!authToken) {
    throw new Error('Authentication token is required');
  }
  
  return fetchFromAPI(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${authToken}`,
    },
  });
}
