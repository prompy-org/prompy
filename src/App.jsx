import React, { useState, useEffect } from 'react';
import PromptList from './components/PromptList';
import PromptForm from './components/PromptForm';
import Login from './components/Login';
import { fetchPrompts, createPrompt, updatePrompt, deletePrompt } from './services/api';
import { isAuthenticated as isAuthenticatedService, logout } from './services/auth';
import { clearCachedPrompts, getCachedPrompts, getSyncFrequency } from './services/storageService';
import './App.css';

function App() {
  const [prompts, setPrompts] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

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

  if (isCheckingAuth) {
    return <div className="loading">Checking authentication...</div>;
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
              onClick={handleRefresh} 
              disabled={isRefreshing || isLoading}
              className="refresh-button"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              onClick={() => {
                setCurrentPrompt(null);
                setIsFormVisible(true);
              }}
              disabled={isLoading}
              className="new-button"
            >
              New Prompt
            </button>
            <button 
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
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
        ) : (
          <PromptList 
            prompts={prompts} 
            onEdit={handleEdit} 
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
