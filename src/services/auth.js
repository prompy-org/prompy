/* eslint-disable no-undef */
// Store token in Chrome storage for persistence across tabs
const storeToken = async (token) => {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ authToken: token }, () => {
      resolve();
    });
  });
};

// Get token from Chrome storage
const getToken = async () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['authToken'], (result) => {
      resolve(result.authToken || null);
    });
  });
};

// Remove token from Chrome storage
const removeToken = async () => {
  return new Promise((resolve) => {
    chrome.storage.sync.remove(['authToken'], () => {
      resolve();
    });
  });
};

// Get API URL from storage
const getApiUrl = async () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiUrl'], (result) => {
      resolve(result.apiUrl);
    });
  });
};

// Logout user
export const logout = async () => {
  try {
    // Get API URL and token
    const [apiUrl, token] = await Promise.all([getApiUrl(), getToken()]);

    if (apiUrl && token) {
      // Call the server-side logout endpoint
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // Always clear the token locally even if server request fails
    await removeToken();
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

// Get current auth token
export const getAuthToken = async () => {
  return await getToken();
};
