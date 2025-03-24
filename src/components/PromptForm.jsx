import React, { useState, useEffect } from 'react';

const PromptForm = ({ prompt, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content);
    }
  }, [prompt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: prompt?.id || Date.now().toString(),
      title,
      content,
      createdAt: prompt?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setTitle('');
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="prompt-form">
      <h2>{prompt ? 'Edit Prompt' : 'Create New Prompt'}</h2>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default PromptForm;