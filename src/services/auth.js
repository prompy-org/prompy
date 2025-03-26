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

// Login with test credentials (for development)
export const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/test-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const data = await response.json();
    await storeToken(data.token);
    return data.token;
  } catch (error) {
    console.error('Test login error:', error);
    throw error;
  }
};

// Logout user
export const logout = async () => {
  await removeToken();
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