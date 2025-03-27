import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiEye, FiCopy, FiSearch, FiX } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';
import Fuse from 'fuse.js';

// eslint-disable-next-line no-unused-vars
const PromptList = ({ prompts, onEdit, onView, onDelete, isLoading, lastFetchTime }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [filteredPrompts, setFilteredPrompts] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [filteredTags, setFilteredTags] = useState([]);
  
  // Initialize Fuse for fuzzy search
  const fuseOptions = {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'content', weight: 0.3 }
    ],
    threshold: 0.4,
    includeScore: true
  };
  
  // Extract all unique tags and set up filtered prompts
  useEffect(() => {
    const tags = new Set();
    prompts.forEach(prompt => {
      if (prompt.tags && prompt.tags.length) {
        prompt.tags.forEach(tag => tags.add(tag));
      }
    });
    setAllTags(Array.from(tags).sort());
    
    // Initial filtering
    filterPrompts(searchTerm, selectedTags);
  }, [prompts]);
  
  // Filter prompts when search term or selected tags change
  useEffect(() => {
    filterPrompts(searchTerm, selectedTags);
  }, [searchTerm, selectedTags, prompts]);
  
  const filterPrompts = (term, tags) => {
    let results = [...prompts];
    
    // Filter by tags first if any are selected
    if (tags.length > 0) {
      results = results.filter(prompt => 
        prompt.tags && tags.every(tag => prompt.tags.includes(tag))
      );
    }
    
    // Then apply fuzzy search if there's a search term
    if (term.trim()) {
      const fuse = new Fuse(results, fuseOptions);
      results = fuse.search(term).map(result => result.item);
    }
    
    setFilteredPrompts(results);
  };
  
  const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const clearSearch = () => {
    setSearchTerm('');
  };
  
  const clearFilters = () => {
    setSelectedTags([]);
    setSearchTerm('');
  };

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

  useEffect(() => {
    if (tagSearchTerm.trim() === '') {
      setFilteredTags(allTags);
    } else {
      const filtered = allTags.filter(tag => 
        tag.toLowerCase().includes(tagSearchTerm.toLowerCase())
      );
      setFilteredTags(filtered);
    }
  }, [tagSearchTerm, allTags]);

  const clearTagSearch = () => {
    setTagSearchTerm('');
  };

  return (
    <div className="prompt-list">
      <div className="prompt-filters">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={clearSearch} className="clear-search">
              <FiX />
            </button>
          )}
        </div>
        
        {allTags.length > 0 && (
          <div className="tag-filters">
            <div className="tag-filters-header">
              <span>Filter by tags:</span>
              {selectedTags.length > 0 && (
                <button onClick={clearFilters} className="clear-filters">
                  Clear filters
                </button>
              )}
            
              <div className="tag-search-container">
                <FiSearch className="tag-search-icon" />
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={tagSearchTerm}
                  onChange={(e) => setTagSearchTerm(e.target.value)}
                  className="tag-search-input"
                  />
                {tagSearchTerm && (
                  <button onClick={clearTagSearch} className="clear-tag-search">
                    <FiX />
                  </button>
                )}
              </div>
            </div>
            
            <div 
              className="tag-list-container" 
              onWheel={(e) => {
                // Prevent default scrolling behavior
                e.preventDefault();
                e.stopPropagation();
                
                // Get the container
                const container = e.currentTarget;
                
                // Calculate smooth scrolling amount
                const scrollAmount = e.deltaY * 0.5;
                
                // Smooth scroll horizontally
                container.scrollBy({
                  left: scrollAmount,
                  behavior: 'smooth'
                });
                
                // Stop propagation to prevent parent scrolling
              }}
            >
              <div className="tag-list">
                {filteredTags.map(tag => (
                  <span 
                    key={tag} 
                    className={`filter-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="loading">Loading prompts...</div>
      ) : filteredPrompts.length === 0 ? (
        <p className="empty-state">
          {prompts.length === 0 
            ? "No prompts yet. Create your first one!" 
            : "No prompts match your search criteria."}
        </p>
      ) : (
        <ul>
          {filteredPrompts.map(prompt => (
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
