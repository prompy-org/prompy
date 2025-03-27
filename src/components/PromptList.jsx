import React from 'react';
import { FiEdit, FiTrash2, FiEye, FiCopy } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';

const PromptList = ({ prompts, onEdit, onView, onDelete, isLoading, lastFetchTime }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const handleCopy = (content, e) => {
    e.stopPropagation(); // Prevent triggering the view action
    navigator.clipboard.writeText(content);
    
    // Show temporary success message on the button
    const button = e.currentTarget;
    const originalText = button.innerHTML;
    button.innerHTML = '<span>Copied!</span>';
    setTimeout(() => {
      button.innerHTML = originalText;
    }, 2000);
  };

  return (
    <div className="prompt-list">
      <h2>Your Prompts</h2>
      
      {lastFetchTime && (
        <div className="last-sync">
          Last synced: {formatDate(lastFetchTime)}
        </div>
      )}
      
      {isLoading ? (
        <div className="loading">Loading prompts...</div>
      ) : prompts.length === 0 ? (
        <p className="empty-state">No prompts yet. Create your first one!</p>
      ) : (
        <ul>
          {prompts.map(prompt => (
            <li key={prompt._id} className="prompt-item" onClick={() => onView(prompt)}>
              <div className="prompt-header">
                <h3 className="prompt-title">{prompt.title}</h3>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(prompt);
                  }} 
                  className="icon-button edit-button"
                  data-tooltip-id={`edit-tooltip-${prompt._id}`}
                  data-tooltip-content="Edit prompt"
                >
                  <FiEdit />
                </button>
                <Tooltip id={`edit-tooltip-${prompt._id}`} />
                
                <button 
                  onClick={(e) => handleCopy(prompt.content, e)} 
                  className="icon-button copy-button"
                  data-tooltip-id={`copy-tooltip-${prompt._id}`}
                  data-tooltip-content="Copy to clipboard"
                >
                  <FiCopy />
                </button>
                <Tooltip id={`copy-tooltip-${prompt._id}`} />
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this prompt?')) {
                      onDelete(prompt._id);
                    }
                  }} 
                  className="icon-button delete-button"
                  data-tooltip-id={`delete-tooltip-${prompt._id}`}
                  data-tooltip-content="Delete prompt"
                >
                  <FiTrash2 />
                </button>
                <Tooltip id={`delete-tooltip-${prompt._id}`} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PromptList;
