/* eslint-disable no-undef */
// Initialize extension when installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Prompy extension installed');
  
  // Set default options
  chrome.storage.sync.get({
    apiUrl: 'http://localhost:5000/api',
    theme: 'system',
    syncFrequency: 15
  }, (items) => {
    if (!items.apiUrl) {
      chrome.storage.sync.set({
        apiUrl: 'http://localhost:5000/api',
        theme: 'system',
        syncFrequency: 15
      });
    }
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPrompts') {
    chrome.storage.sync.get(['apiUrl'], async (items) => {
      try {
        const response = await fetch(`${items.apiUrl}/prompts?userId=test-user-1`);
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
