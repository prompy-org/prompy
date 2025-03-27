import React, { useState, useEffect } from 'react';
import { FiCopy, FiArrowLeft, FiEdit } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';

const PromptView = ({ prompt, onBack, onEdit }) => {
  const [processedContent, setProcessedContent] = useState(prompt.content);
  const [variables, setVariables] = useState({});
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Extract variables from the prompt content
  useEffect(() => {
    const variableRegex = /\$\{\{([^}]+)\}\}/g;
    const matches = [...prompt.content.matchAll(variableRegex)];
    
    const extractedVars = {};
    matches.forEach(match => {
      extractedVars[match[1]] = ''; // Initialize with empty string
    });
    
    setVariables(extractedVars);
  }, [prompt.content]);
  
  // Update processed content when variables change
  useEffect(() => {
    let content = prompt.content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\$\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, value);
    });
    setProcessedContent(content);
  }, [variables, prompt.content]);
  
  const handleVariableChange = (varName, value) => {
    setVariables(prev => ({
      ...prev,
      [varName]: value
    }));
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(processedContent);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <div className="prompt-view">
      <div className="prompt-view-header">
        <button 
          onClick={onBack} 
          className="icon-button back-button"
          data-tooltip-id="back-tooltip"
          data-tooltip-content="Back to list"
        >
          <FiArrowLeft />
        </button>
        <Tooltip id="back-tooltip" />
        
        <button 
          onClick={onEdit} 
          className="icon-button edit-button"
          data-tooltip-id="edit-tooltip"
          data-tooltip-content="Edit prompt"
        >
          <FiEdit />
        </button>
        <Tooltip id="edit-tooltip" />
      </div>
      
      <div className="prompt-view-content">
        <h2 className="prompt-title">{prompt.title}</h2>
        
        <div className="prompt-meta">
          <span>Updated: {formatDate(prompt.updatedAt)}</span>
        </div>
        
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="prompt-tags">
            {prompt.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
        
        {Object.keys(variables).length > 0 && (
          <div className="variable-input-container">
            <h3>Variables</h3>
            {Object.entries(variables).map(([varName, value]) => (
              <div key={varName} className="variable-input-group">
                <label htmlFor={`var-${varName}`}>{varName}:</label>
                <textarea
                  id={`var-${varName}`}
                  value={value}
                  onChange={(e) => handleVariableChange(varName, e.target.value)}
                  placeholder={`Enter value for ${varName}`}
                  rows={3}
                />
              </div>
            ))}
          </div>
        )}
        
        <div className="prompt-content-box">
          <pre>{processedContent}</pre>
        </div>
        
        <button 
          onClick={handleCopy} 
          className="copy-button"
          data-tooltip-id="copy-tooltip"
          data-tooltip-content="Copy to clipboard"
        >
          <FiCopy />
          {copySuccess && <span className="copy-success">Copied!</span>}
        </button>
        <Tooltip id="copy-tooltip" />
      </div>
    </div>
  );
};

export default PromptView;
