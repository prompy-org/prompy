import React, { useState } from 'react';
import PromptList from './components/PromptList';
import PromptForm from './components/PromptForm';
import './App.css';

// Dummy data
const dummyPrompts = [
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
];

function App() {
  const [prompts, setPrompts] = useState(dummyPrompts);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleEdit = (prompt) => {
    setCurrentPrompt(prompt);
    setIsFormVisible(true);
  };

  const handleDelete = (id) => {
    setPrompts(prompts.filter(prompt => prompt.id !== id));
  };

  const handleSave = (prompt) => {
    if (currentPrompt) {
      // Edit existing prompt
      setPrompts(prompts.map(p => p.id === prompt.id ? prompt : p));
    } else {
      // Add new prompt
      setPrompts([...prompts, prompt]);
    }
    setCurrentPrompt(null);
    setIsFormVisible(false);
  };

  return (
    <div className="app">
      <header>
        <h1>Prompy</h1>
        <button onClick={() => {
          setCurrentPrompt(null);
          setIsFormVisible(true);
        }}>
          New Prompt
        </button>
      </header>
      
      <main>
        {isFormVisible ? (
          <PromptForm 
            prompt={currentPrompt} 
            onSave={handleSave} 
            onCancel={() => {
              setCurrentPrompt(null);
              setIsFormVisible(false);
            }} 
          />
        ) : (
          <PromptList 
            prompts={prompts} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
