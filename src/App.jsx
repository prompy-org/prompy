/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import PromptList from './components/PromptList';
import PromptForm from './components/PromptForm';
import PromptView from './components/PromptView';
import Login from './components/Login';
import { fetchPrompts, createPrompt, updatePrompt, deletePrompt } from './services/api';
import { isAuthenticated as isAuthenticatedService, logout } from './services/auth';
import { clearCachedPrompts, getCachedPrompts, getSyncFrequency } from './services/storageService';
import { FiRefreshCw, FiPlus, FiLogOut, FiExternalLink, FiMoon, FiSun } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';
import './App.css';

function App() {
  const [prompts, setPrompts] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isPromptViewVisible, setIsPromptViewVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Check if dark mode was previously enabled
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  // Toggle dark mode
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  // Check authentication status on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticatedService();
        setIsAuthenticated(authenticated);
      } catch (err) {
        console.error('Error checking authentication:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, []);

  const loadPrompts = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const { prompts, lastFetchTime } = await getCachedPrompts();
      
      // If we have cached prompts and aren't forcing a refresh, use them
      if (prompts.length > 0 && !forceRefresh) {
        setPrompts(prompts);
        setLastFetchTime(lastFetchTime);
        
        // Check if we need to refresh based on sync frequency
        const syncFrequency = await getSyncFrequency();
        const cacheAge = Date.now() - lastFetchTime;
        const cacheMaxAge = syncFrequency * 60 * 1000;
        
        if (cacheAge >= cacheMaxAge) {
          // Refresh in background if cache is stale
          fetchPrompts(true).then(freshPrompts => {
            setPrompts(freshPrompts);
            setLastFetchTime(Date.now());
          }).catch(console.error);
        }
      } else {
        // Fetch fresh data
        const data = await fetchPrompts(forceRefresh);
        setPrompts(data);
        setLastFetchTime(Date.now());
      }
    } catch (err) {
      setError('Failed to load prompts. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load prompts when authenticated
  useEffect(() => {
    if (isAuthenticated && !isCheckingAuth) {
      loadPrompts();
    }
  }, [isAuthenticated, isCheckingAuth]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadPrompts(true);
  };

  const handleEdit = (prompt) => {
    setCurrentPrompt(prompt);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await deletePrompt(id);
      await loadPrompts(true); // Force refresh after delete
    } catch (err) {
      setError('Failed to delete prompt. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (promptData) => {
    setIsLoading(true);
    try {
      if (currentPrompt) {
        // Update existing prompt
        await updatePrompt(currentPrompt._id, promptData);
      } else {
        // Create new prompt
        await createPrompt(promptData);
      }
      await loadPrompts(true); // Force refresh after save
      setCurrentPrompt(null);
      setIsFormVisible(false);
    } catch (err) {
      setError('Failed to save prompt. Please try again.');
      console.error('Error saving prompt: ', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      await clearCachedPrompts(); // Clear cache on logout
      setIsAuthenticated(false);
      setPrompts([]);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleView = (prompt) => {
    setCurrentPrompt(prompt);
    setIsPromptViewVisible(true);
    setIsFormVisible(false);
  };

  const handlePopOut = () => {
    if (chrome && chrome.windows) {
      chrome.windows.create({
        url: chrome.runtime.getURL('index.html?popout=true'),
        type: 'popup',
        width: 1200,
        height: 900
      });
      // Close the popup if this is not already a popout
      if (!window.location.href.includes('popout=true')) {
        window.close();
      }
    }
  };

  if (isCheckingAuth) {
    return <div className="loading-container"><div className="loading">Checking authentication...</div></div>;
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <header>
        <h1>Prompy</h1>
        {isAuthenticated && (
          <div className="header-actions">
            <button 
              onClick={toggleTheme} 
              className="icon-button theme-toggle-button"
              data-tooltip-id="theme-tooltip"
              data-tooltip-content={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
            <Tooltip id="theme-tooltip" />
            
            <button 
              onClick={handleRefresh} 
              disabled={isRefreshing || isLoading}
              className="icon-button refresh-button"
              data-tooltip-id="refresh-tooltip"
              data-tooltip-content="Refresh prompts"
            >
              <FiRefreshCw className={isRefreshing ? "icon-spin" : ""} />
            </button>
            <Tooltip id="refresh-tooltip" />
            
            <button 
              onClick={() => {
                setCurrentPrompt(null);
                setIsFormVisible(true);
                setIsPromptViewVisible(false);
              }}
              disabled={isLoading}
              className="icon-button new-button"
              data-tooltip-id="new-tooltip"
              data-tooltip-content="Create new prompt"
            >
              <FiPlus />
            </button>
            <Tooltip id="new-tooltip" />
            
            <button 
              onClick={handlePopOut}
              className="icon-button popout-button"
              data-tooltip-id="popout-tooltip"
              data-tooltip-content="Open in separate window"
            >
              <FiExternalLink />
            </button>
            <Tooltip id="popout-tooltip" />
            
            <button 
              onClick={handleLogout}
              className="icon-button logout-button"
              data-tooltip-id="logout-tooltip"
              data-tooltip-content="Log out"
            >
              <FiLogOut />
            </button>
            <Tooltip id="logout-tooltip" />
          </div>
        )}
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      <main>
        {isFormVisible ? (
          <PromptForm 
            prompt={currentPrompt} 
            onSave={handleSave} 
            onCancel={() => {
              setCurrentPrompt(null);
              setIsFormVisible(false);
            }} 
            isLoading={isLoading}
          />
        ) : isPromptViewVisible ? (
          <PromptView
            prompt={currentPrompt}
            onBack={() => {
              setIsPromptViewVisible(false);
              setCurrentPrompt(null);
            }}
            onEdit={() => {
              setIsFormVisible(true);
              setIsPromptViewVisible(false);
            }}
          />
        ) : (
          <PromptList 
            prompts={prompts} 
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete} 
            isLoading={isLoading}
            lastFetchTime={lastFetchTime}
          />
        )}
      </main>
    </div>
  );
}

export default App;
