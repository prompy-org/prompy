/* eslint-disable no-undef */

// Store prompts in Chrome's local storage
export const storePrompts = async (prompts) => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ 
      cachedPrompts: prompts,
      lastFetchTime: Date.now()
    }, () => {
      resolve();
    });
  });
};

// Get cached prompts from Chrome's local storage
export const getCachedPrompts = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['cachedPrompts', 'lastFetchTime'], (result) => {
      resolve({
        prompts: result.cachedPrompts || [],
        lastFetchTime: result.lastFetchTime || 0
      });
    });
  });
};

// Clear cached prompts
export const clearCachedPrompts = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['cachedPrompts', 'lastFetchTime'], () => {
      resolve();
    });
  });
};

// Get sync frequency from options (in minutes)
export const getSyncFrequency = async () => {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['syncFrequency'], (result) => {
      resolve(result.syncFrequency || 15); // Default to 15 minutes
    });
  });
};