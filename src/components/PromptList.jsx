import React, { useState, useEffect, useRef } from 'react';
import { FiEdit, FiTrash2, FiCopy, FiSearch, FiX, FiList, FiGrid, FiChevronDown, FiChevronUp, FiFilter, FiArrowUp, FiArrowDown } from 'react-icons/fi';
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
  const [isCompactView, setIsCompactView] = useState(false);
  const [sortOption, setSortOption] = useState({ field: null, direction: null });
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef(null);
  
  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setIsSortMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Load compact view preference from storage on component mount
  useEffect(() => {
    chrome.storage.sync.get(['compactView'], (result) => {
      if (result.compactView !== undefined) {
        setIsCompactView(result.compactView);
      }
    });
  }, []);
  
  // Update storage when compact view preference changes
  const toggleCompactView = () => {
    const newValue = !isCompactView;
    setIsCompactView(newValue);
    chrome.storage.sync.set({ compactView: newValue });
  };
  
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
    filterAndSortPrompts(searchTerm, selectedTags, sortOption);
  }, [prompts]);
  
  // Filter and sort prompts when search term, selected tags, or sort option changes
  useEffect(() => {
    filterAndSortPrompts(searchTerm, selectedTags, sortOption);
  }, [searchTerm, selectedTags, sortOption, prompts]);
  
  const filterAndSortPrompts = (term, tags, sort) => {
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
    
    // Apply sorting if a sort option is selected
    if (sort.field && sort.direction) {
      results.sort((a, b) => {
        let valueA, valueB;
        
        if (sort.field === 'title') {
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
        } else if (sort.field === 'updatedAt') {
          valueA = new Date(a.updatedAt).getTime();
          valueB = new Date(b.updatedAt).getTime();
        }
        
        if (valueA < valueB) return sort.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
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

  const handleSortOptionClick = (field) => {
    setSortOption(prevSort => {
      // If clicking the same field, cycle through: asc -> desc -> null
      if (prevSort.field === field) {
        if (prevSort.direction === 'asc') return { field, direction: 'desc' };
        if (prevSort.direction === 'desc') return { field: null, direction: null };
        return { field, direction: 'asc' };
      }
      // If clicking a different field, start with ascending
      return { field, direction: 'asc' };
    });
    setIsSortMenuOpen(false);
  };
  
  const getSortIcon = (field) => {
    if (sortOption.field !== field) return null;
    return sortOption.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />;
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
          <div className="search-actions">
            {searchTerm && (
              <button onClick={clearSearch} className="clear-search">
                <FiX />
              </button>
            )}
            <button 
              onClick={toggleCompactView} 
              className="view-toggle-button"
              data-tooltip-id="view-toggle-tooltip"
              data-tooltip-content={isCompactView ? "Switch to normal view" : "Switch to compact view"}
            >
              {isCompactView ? <FiGrid /> : <FiList />}
            </button>
            <Tooltip id="view-toggle-tooltip" />
          </div>
        </div>
        
        <div className="filter-sort-container">
          {allTags.length > 0 && (
            <div className="tag-filters">
              <div className="tag-filters-header">
              <div className="sort-container" ref={sortMenuRef}>
            <button 
              className={`sort-button ${sortOption.field ? 'active' : ''}`}
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              data-tooltip-id="sort-tooltip"
              data-tooltip-content="Sort prompts"
            >
              <FiFilter /> 
              {sortOption.field && (
                <span className="sort-indicator">
                  {sortOption.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                </span>
              )}
              {isSortMenuOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            <Tooltip id="sort-tooltip" />
            
            {isSortMenuOpen && (
              <div className="sort-menu">
                <div 
                  className={`sort-option ${sortOption.field === 'title' ? 'active' : ''}`}
                  onClick={() => handleSortOptionClick('title')}
                >
                  <span>Title</span>
                  {getSortIcon('title')}
                </div>
                <div 
                  className={`sort-option ${sortOption.field === 'updatedAt' ? 'active' : ''}`}
                  onClick={() => handleSortOptionClick('updatedAt')}
                >
                  <span>Last Updated</span>
                  {getSortIcon('updatedAt')}
                </div>
              </div>
            )}
          </div>
                <span>Filter by tags:</span>
            
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

              {selectedTags.length > 0 && (
                <button onClick={clearFilters} className="clear-filters">
                  Clear filters
                </button>
              )}
            </div>
            
            <div 
              className="tag-list-container" 
              onWheel={(e) => {
                // Prevent default scrolling behavior
                // e.preventDefault();
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
        <ul className={isCompactView ? "compact-view" : ""}>
          {filteredPrompts.map(prompt => (
            <li key={prompt._id} className={`prompt-item ${isCompactView ? "compact" : ""}`} onClick={() => onView(prompt)}>
              <div className="prompt-header">
                <h3 className="prompt-title">{prompt.title}</h3>
                {!isCompactView && (
                  <div className="prompt-meta">
                    <span className="prompt-date">
                      Updated: {formatDate(prompt.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
              {!isCompactView && (
                <p className="prompt-content">
                  {prompt.content.length > 100 
                    ? `${prompt.content.substring(0, 100)}...` 
                    : prompt.content}
                </p>
              )}
              {!isCompactView && prompt.tags && prompt.tags.length > 0 && (
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
    </div>
  );
};

export default PromptList;
