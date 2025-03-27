/* eslint-disable no-undef */
// Initialize extension when installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Prompy extension installed');
  
  // Set default options
  chrome.storage.sync.set({
    apiUrl: 'https://prompy.onrender.com/api',
    theme: 'system',
    syncFrequency: 15
  }, () => {
    console.log('Default settings initialized');
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPrompts') {
    chrome.storage.sync.get(['apiUrl', 'authToken'], async (items) => {
      try {
        const response = await fetch(`${items.apiUrl}/prompts`, {
          headers: {
            'Authorization': `Bearer ${items.authToken}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch prompts');
        const data = await response.json();
        sendResponse({
          success: true,
          prompts: data
        });
      } catch (error) {
        console.error('Error fetching prompts:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      }
    });
    return true; // Required for async response
  }
});

// Listen for OAuth callback
chrome.webNavigation.onCompleted.addListener((details) => {
  // Check if this is our auth success page
  if (details.url.includes('/auth-success')) {
    // Extract token from URL
    const url = new URL(details.url);
    const token = url.searchParams.get('token');
    
    if (token) {
      // Store token in Chrome storage
      chrome.storage.sync.set({ authToken: token }, () => {
        console.log('Token stored in Chrome storage');
        
        // Close the auth tab and open/focus the extension popup
        chrome.tabs.remove(details.tabId);
        
        // Notify any open extension popups about successful login
        chrome.runtime.sendMessage({ action: 'loginSuccess' });
      });
    }
  }
}, { url: [{ urlContains: '/auth-success' }] });

// Listen for messages from web pages
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "auth_success" && request.token) {
      // Store the token
      chrome.storage.sync.set({ authToken: request.token }, function() {
        console.log('Token stored successfully');
        // Notify any open extension popups
        chrome.runtime.sendMessage({ action: 'loginSuccess' });
        sendResponse({ status: "success" });
      });
      return true; // Required for async sendResponse
    }
  }
);
