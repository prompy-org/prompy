/* eslint-disable no-undef */
import React, { useState } from 'react';
import { testLogin } from '../services/auth';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await testLogin();
      onLoginSuccess();
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Get the API URL from storage
    chrome.storage.sync.get(['apiUrl'], (result) => {
      const apiUrl = result.apiUrl || 'http://localhost:5000/api';
      
      // Generate a random state value for security
      const state = Math.random().toString(36).substring(2, 15);
      
      // Store state temporarily for verification
      chrome.storage.local.set({ oauthState: state }, () => {
        // Open auth window
        chrome.tabs.create({
          url: `${apiUrl}/auth/google?state=${state}&extension_id=${chrome.runtime.id}`
        });
      });
    });
  };

  return (
    <div className="login-container">
      <h2>Welcome to Prompy</h2>
      <p>Please log in to access your prompts</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="login-buttons">
        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="google-login-button"
        >
          <span className="google-icon">G</span>
          Sign in with Google
        </button>
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button 
          onClick={handleTestLogin}
          disabled={isLoading}
          className="test-login-button"
        >
          {isLoading ? 'Logging in...' : 'Use Test Account'}
        </button>
      </div>
    </div>
  );
}

export default Login;
