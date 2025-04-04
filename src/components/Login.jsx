/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('');

  // Load API URL from storage when component mounts
  useEffect(() => {
    chrome.storage.sync.get(['apiUrl'], (result) => {
      if (result.apiUrl) {
        setApiUrl(result.apiUrl);
      }
    });
  }, []);

  const handleGoogleLogin = () => {
    // Generate a random state value for security
    const state = Math.random().toString(36).substring(2, 15);
    
    // Store state temporarily for verification
    chrome.storage.local.set({ oauthState: state }, () => {
      // Open auth window using the stored apiUrl
      chrome.tabs.create({
        url: `${apiUrl}/auth/google?state=${state}&extension_id=${chrome.runtime.id}`
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
      </div>
    </div>
  );
}

export default Login;
