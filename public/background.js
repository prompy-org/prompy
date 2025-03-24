// Initialize extension when installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Prompy extension installed');
  
  // Set default options
  chrome.storage.sync.get({
    apiUrl: 'https://api.prompy.app',
    theme: 'system',
    syncFrequency: 15
  }, (items) => {
    if (!items.apiUrl) {
      chrome.storage.sync.set({
        apiUrl: 'https://api.prompy.app',
        theme: 'system',
        syncFrequency: 15
      });
    }
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPrompts') {
    // In a real implementation, this would fetch from an API
    // For now, return dummy data
    sendResponse({
      success: true,
      prompts: [
        {
          id: '1',
          title: 'Code Review',
          content: 'Please review this code and suggest improvements...',
          createdAt: '2023-01-01T12:00:00Z',
          updatedAt: '2023-01-01T12:00:00Z'
        },
        {
          id: '2',
          title: 'Blog Post Ideas',
          content: 'Generate 5 blog post ideas about React development...',
          createdAt: '2023-01-02T12:00:00Z',
          updatedAt: '2023-01-02T12:00:00Z'
        }
      ]
    });
    return true; // Required for async response
  }
});