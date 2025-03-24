import React from 'react';

const PromptList = ({ prompts, onEdit, onDelete, isLoading }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="prompt-list">
      <h2>Your Prompts</h2>
      {isLoading ? (
        <div className="loading">Loading prompts...</div>
      ) : prompts.length === 0 ? (
        <p className="empty-state">No prompts yet. Create your first one!</p>
      ) : (
        <ul>
          {prompts.map(prompt => (
            <li key={prompt._id} className="prompt-item">
              <div className="prompt-header">
                <h3>{prompt.title}</h3>
                <div className="prompt-meta">
                  <span className="prompt-date">
                    Updated: {formatDate(prompt.updatedAt)}
                  </span>
                </div>
              </div>
              <p className="prompt-content">
                {prompt.content.length > 100 
                  ? `${prompt.content.substring(0, 100)}...` 
                  : prompt.content}
              </p>
              {prompt.tags && prompt.tags.length > 0 && (
                <div className="prompt-tags">
                  {prompt.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              <div className="prompt-actions">
                <button 
                  onClick={() => onEdit(prompt)}
                  disabled={isLoading}
                  className="edit-button"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDelete(prompt._id)}
                  disabled={isLoading}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PromptList;
