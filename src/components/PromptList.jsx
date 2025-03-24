import React from 'react';

const PromptList = ({ prompts, onEdit, onDelete }) => {
  return (
    <div className="prompt-list">
      <h2>Your Prompts</h2>
      {prompts.length === 0 ? (
        <p>No prompts yet. Create your first one!</p>
      ) : (
        <ul>
          {prompts.map(prompt => (
            <li key={prompt.id} className="prompt-item">
              <h3>{prompt.title}</h3>
              <p>{prompt.content.substring(0, 100)}...</p>
              <div className="prompt-actions">
                <button onClick={() => onEdit(prompt)}>Edit</button>
                <button onClick={() => onDelete(prompt.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PromptList;