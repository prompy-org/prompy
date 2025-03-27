import React from 'react';

const PromptList = ({ prompts, onEdit, onDelete, isLoading, lastFetchTime }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getLastFetchInfo = () => {
    if (!lastFetchTime) return '';
    const date = new Date(lastFetchTime);
    return `Last updated: ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="prompt-list">
      <div className="prompt-list-header">
        <h2>Your Prompts</h2>
        <span className="last-fetch-info">{getLastFetchInfo()}</span>
      </div>
      
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
                <button onClick={() => onEdit(prompt)} className="edit-button">
                  Edit
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this prompt?')) {
                      onDelete(prompt._id);
                    }
                  }} 
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
