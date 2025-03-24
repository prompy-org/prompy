import React, { useState, useEffect } from 'react';
import PromptList from './components/PromptList';
import PromptForm from './components/PromptForm';
import { fetchPrompts, createPrompt, updatePrompt, deletePrompt } from './services/api';
import './App.css';

function App() {
  const [prompts, setPrompts] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPrompts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPrompts();
      setPrompts(data);
    } catch (err) {
      setError('Failed to load prompts. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const handleEdit = (prompt) => {
    setCurrentPrompt(prompt);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      setIsLoading(true);
      try {
        await deletePrompt(id);
        await loadPrompts();
      } catch (err) {
        setError('Failed to delete prompt. Please try again.');
        console.error('Error deleting prompt: ',err)
      } finally {
        setIsLoading(false);
      }
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
      await loadPrompts();
      setCurrentPrompt(null);
      setIsFormVisible(false);
    } catch (err) {
      setError('Failed to save prompt. Please try again.');
      console.error('Error saving prompt: ',err)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Prompy</h1>
        <div className="header-actions">
          <button 
            onClick={loadPrompts} 
            disabled={isLoading}
            className="refresh-button"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
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
        </div>
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
          />
        )}
      </main>
    </div>
  );
}

export default App;
