/**
 * User-related API services
 */

/**
 * Fetch user statistics
 * @returns {Promise<Object>} User statistics data
 */
export async function getUserStats() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/api/user/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch user stats: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
}

/**
 * Fetch user subscription details
 * @returns {Promise<Object>} User subscription details
 */
export async function getUserSubscriptionDetails() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/api/user/subscription-details', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch subscription details: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    throw error;
  }
}


/**
 * Delete user account
 * @returns {Promise<Object>} User deletion response
 */
export async function deleteUser() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/api/user/delete', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete user: ${response.status}`);
    }
    localStorage.removeItem('authToken');

    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
