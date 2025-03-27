
import { getAuthToken } from './auth';
import { getCachedPrompts, storePrompts, getSyncFrequency } from './storageService';

// Use environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'https://prompy.onrender.com/api';

export const fetchPrompts = async (forceRefresh = false) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    
    // Check if we have cached prompts and if they're still valid
    if (!forceRefresh) {
      const { prompts, lastFetchTime } = await getCachedPrompts();
      const syncFrequency = await getSyncFrequency();
      const cacheAge = Date.now() - lastFetchTime;
      const cacheMaxAge = syncFrequency * 60 * 1000; // Convert minutes to milliseconds
      
      // If cache is valid and not empty, return cached prompts
      if (prompts.length > 0 && cacheAge < cacheMaxAge) {
        console.log('Using cached prompts');
        return prompts;
      }
    }
    
    // If cache is invalid or empty, fetch from API
    console.log('Fetching prompts from API');
    const response = await fetch(`${API_URL}/prompts`, {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch prompts');
    const prompts = await response.json();
    
    // Cache the fetched prompts
    await storePrompts(prompts);
    
    return prompts;
  } catch (error) {
    console.error('Error fetching prompts:', error);
    throw error;
  }
};

export const createPrompt = async (promptData) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_URL}/prompts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(promptData)
    });
    
    if (!response.ok) throw new Error('Failed to create prompt');
    return await response.json();
  } catch (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }
};

export const updatePrompt = async (id, promptData) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_URL}/prompts/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(promptData)
    });
    
    if (!response.ok) throw new Error('Failed to update prompt');
    return await response.json();
  } catch (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }
};

export const deletePrompt = async (id) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_URL}/prompts/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });
    
    if (!response.ok) throw new Error('Failed to delete prompt');
    return await response.json();
  } catch (error) {
    console.error('Error deleting prompt:', error);
    throw error;
  }
};
