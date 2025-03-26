
import { getAuthToken } from './auth';

const API_URL = 'http://localhost:5000/api';

export const fetchPrompts = async () => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('Not authenticated');
    
    const response = await fetch(`${API_URL}/prompts`, {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch prompts');
    return await response.json();
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
      body: JSON.stringify(promptData),
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
      body: JSON.stringify(promptData),
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
