/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import PromptList from './components/PromptList';
import PromptForm from './components/PromptForm';
import PromptView from './components/PromptView';
import PromptLimitIndicator from './components/PromptLimitIndicator';
import Login from './components/Login';
import { fetchPrompts, createPrompt, updatePrompt, deletePrompt, fetchUserStats } from './services/api';
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
  
  // New state variables for user stats
  const [userStats, setUserStats] = useState({
    promptCount: 0,
    promptLimit: 50,
    isPremium: false,
    isAdvancedUser: false,
    subscription: null,
    activeSubscriptions: []
  });

  // Check if dark mode was previously enabled
  useEffect(() => {
    chrome.storage.sync.get(['theme'], (items) => {
      const savedTheme = items.theme;
      if (savedTheme === 'dark') {
        setDarkMode(true);
        document.documentElement.setAttribute('data-theme', 'dark');
      } else if (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    });
  }, []);

  // Toggle dark mode
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    const newTheme = newDarkMode ? 'dark' : 'light';
    
    if (newDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    // Update Chrome sync storage
    chrome.storage.sync.set({ theme: newTheme });
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
      
      // Fetch user stats
      const fetchedUserStats = await fetchUserStats();
      setUserStats(fetchedUserStats);
    } catch (err) {
      if (err.message && err.message.includes('Prompt limit reached')) {
        setError('You have reached your prompt limit. Please upgrade to create more prompts.');
      } else {
        setError('Failed to fetch prompts. Please try again.');
      }
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
    // Check if user has reached prompt limit
    if (!currentPrompt && userStats.promptCount >= userStats.promptLimit && userStats.promptLimit !== -1) {
      setError('You have reached your prompt limit. Please upgrade to create more prompts.');
      return;
    }
    
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
      if (err.message && err.message.includes('Prompt limit reached')) {
        setError('You have reached your prompt limit. Please upgrade to create more prompts.');
      } else {
        setError('Failed to save prompt. Please try again.');
      }
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
        <a href='https://www.prompy.org' target='_blank' rel="noopener noreferrer" className="logo-header"> <img src="/logo.png" className='logo' alt="Prompy logo" /> Prompy</a>
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
        {!isFormVisible && !isPromptViewVisible && <PromptLimitIndicator 
          promptCount={userStats.promptCount} 
          promptLimit={userStats.promptLimit}
          isPremium={userStats.isPremium}
          expiresAt={userStats.subscription?.expiresAt}
          isAdvancedUser={userStats.isAdvancedUser}
          activeSubscriptions={userStats.activeSubscriptions}
        />}
        
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
