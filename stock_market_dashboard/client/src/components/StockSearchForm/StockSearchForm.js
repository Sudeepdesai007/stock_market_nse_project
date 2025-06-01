import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for createPortal
import PropTypes from 'prop-types';
import { PLACEHOLDER_TEXTS, TYPING_SPEED, DELETING_SPEED, HOLD_DURATION } from '../../constants';
import './StockSearchForm.css';

// Helper function to highlight matching text
const getHighlightedText = (text, highlight) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <strong key={i} className="suggestion-highlight">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </span>
  );
};

const StockSearchForm = ({ symbol, onSymbolChange, onSubmit, loading, showHint }) => {
  const [animateSearch, setAnimateSearch] = useState(true);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const [stockListData, setStockListData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [suggestionsStyle, setSuggestionsStyle] = useState({});

  const formRef = useRef(null); // Renamed from wrapperRef for clarity
  const inputRef = useRef(null); // Ref for the input field to get its dimensions/position
  const suggestionsRef = useRef(null); // Ref for the suggestions list (if needed for click outside)
  const debounceTimeoutRef = useRef(null);

  // Fetch and parse CSV data
  useEffect(() => {
    fetch('/EQUITY_L.csv')
      .then(response => response.text())
      .then(csvText => {
        const lines = csvText.split('\n');
        if (lines.length < 2) {
          console.error('CSV is empty or has no header');
          setStockListData([]);
          return;
        }
        const headers = lines[0].split(',').map(header => header.trim());
        const symbolIndex = headers.indexOf('SYMBOL');
        const nameIndex = headers.indexOf('NAME OF COMPANY');

        if (symbolIndex === -1 || nameIndex === -1) {
          console.error('CSV headers SYMBOL or NAME OF COMPANY not found');
          setStockListData([]);
          return;
        }

        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          const stockSymbol = values[symbolIndex]?.trim();
          // Attempt to correctly parse company name even if it contains commas
          const companyName = values.slice(nameIndex, values.length - (headers.length - 1 - nameIndex)).join(',').trim().replace(/^"|"$/g, '');

          if (stockSymbol && companyName) {
            return { symbol: stockSymbol, name: companyName };
          }
          return null;
        }).filter(item => item !== null && item.symbol && item.name);
        setStockListData(data);
      })
      .catch(error => {
        console.error('Error fetching or parsing stock list CSV:', error);
        setStockListData([]);
      });
  }, []);

  // Placeholder animation logic
  useEffect(() => {
    if (!animateSearch) {
      setAnimatedPlaceholder(PLACEHOLDER_TEXTS[0]);
      return;
    }
    let timeoutId;
    const currentText = PLACEHOLDER_TEXTS[placeholderIndex];
    if (isDeleting) {
      if (animatedPlaceholder.length > 0) {
        timeoutId = setTimeout(() => {
          setAnimatedPlaceholder(currentText.substring(0, animatedPlaceholder.length - 1));
        }, DELETING_SPEED);
      } else {
        setIsDeleting(false);
        setPlaceholderIndex((prevIndex) => (prevIndex + 1) % PLACEHOLDER_TEXTS.length);
      }
    } else {
      if (animatedPlaceholder.length < currentText.length) {
        timeoutId = setTimeout(() => {
          setAnimatedPlaceholder(currentText.substring(0, animatedPlaceholder.length + 1));
        }, TYPING_SPEED);
      } else {
        timeoutId = setTimeout(() => setIsDeleting(true), HOLD_DURATION);
      }
    }
    return () => clearTimeout(timeoutId);
  }, [animatedPlaceholder, animateSearch, isDeleting, placeholderIndex]);

  // Control animation and suggestions based on symbol input
  useEffect(() => {
    if (symbol.trim() === '') {
      if (!animateSearch) setAnimateSearch(true);
      setAnimatedPlaceholder('');
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    } else {
      if (animateSearch) setAnimateSearch(false);
    }
  }, [symbol, animateSearch]);

  // Calculate position for suggestions portal
  useLayoutEffect(() => {
    const calculateStyle = () => {
      if (inputRef.current) { // Calculate style only if inputRef is available
        const inputRect = inputRef.current.getBoundingClientRect();
        setSuggestionsStyle({
          position: 'fixed',
          top: `${inputRect.bottom}px`, // Use inputRect.bottom directly, fixed position handles scroll
          left: `${inputRect.left}px`,  // Use inputRect.left directly
          width: `${inputRect.width - 2}px`,
        });
      }
    };

    if (showSuggestions) {
      calculateStyle(); // Calculate on show
      window.addEventListener('resize', calculateStyle);
      window.addEventListener('scroll', calculateStyle, true); // Add scroll listener, capture phase
      return () => {
        window.removeEventListener('resize', calculateStyle);
        window.removeEventListener('scroll', calculateStyle, true); // Remove scroll listener
      };
    } else {
      // Optionally clear styles or set them to default if needed when not shown
      // setSuggestionsStyle({}); // This might cause a flicker if not handled carefully
    }
  }, [showSuggestions]); // Re-run when showSuggestions changes

  // Handle click outside to close suggestions (now considers both form and portaled list)
  useEffect(() => {
    function handleClickOutside(event) {
      // Close if click is outside the form AND outside the suggestions list (if it exists)
      const isOutsideForm = formRef.current && !formRef.current.contains(event.target);
      const isOutsideSuggestions = suggestionsRef.current && !suggestionsRef.current.contains(event.target);
      
      if (showSuggestions && isOutsideForm && isOutsideSuggestions) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions, formRef, suggestionsRef]); // Added showSuggestions and suggestionsRef

  const fetchSuggestions = useCallback((value) => {
    if (value.length >= 3 && stockListData.length > 0) {
      const lowercasedValue = value.toLowerCase();
      const filteredSuggestions = stockListData.filter(stock =>
        stock.symbol.toLowerCase().includes(lowercasedValue) ||
        stock.name.toLowerCase().includes(lowercasedValue)
      );
      setSuggestions(filteredSuggestions.slice(0, 10));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [stockListData]);

  const debouncedFetchSuggestions = useCallback((value) => {
    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 250);
  }, [fetchSuggestions]);

  const handleInputChangeInternal = (event) => {
    const { value } = event.target;
    onSymbolChange(value);
    setActiveSuggestionIndex(-1);
    if (value.length === 0) {
      clearTimeout(debounceTimeoutRef.current);
      setSuggestions([]);
      setShowSuggestions(false);
    } else if (value.length < 3) {
      clearTimeout(debounceTimeoutRef.current);
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      debouncedFetchSuggestions(value);
    }
  };

  const handleSuggestionClick = useCallback((suggestion) => {
    onSymbolChange(suggestion.symbol);
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    onSubmit(suggestion.symbol.trim());
  }, [onSymbolChange, onSubmit]);

  const handleKeyDown = (event) => {
    if (!showSuggestions || suggestions.length === 0) {
      // If suggestions are not shown or empty, but Escape is pressed, clear input
      if (event.key === 'Escape') {
        event.preventDefault();
        // Optionally clear symbol or just hide (current behavior is to clear symbol via onSymbolChange(''))
        // handleClearInput(); // If you want to clear the input fully
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestionIndex(prevIndex =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestionIndex(prevIndex =>
        prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
      );
    } else if (event.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        event.preventDefault();
        const selectedSymbol = suggestions[activeSuggestionIndex].symbol.trim();
        onSymbolChange(selectedSymbol);
        onSubmit(selectedSymbol);
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        return;
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleClearInput = () => {
    onSymbolChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
  };

  const renderSuggestions = () => {
    if (!showSuggestions) return null;

    return ReactDOM.createPortal(
      <ul 
        className="suggestions-list" 
        role="listbox" 
        id="suggestions-listbox" 
        style={suggestionsStyle}
        ref={suggestionsRef} // Assign ref to the suggestions list
      >
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.symbol}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`suggestion-item ${index === activeSuggestionIndex ? 'active' : ''}`}
              role="option"
              aria-selected={index === activeSuggestionIndex}
              id={`suggestion-${index}`}
            >
              {getHighlightedText(suggestion.name, symbol)} <span className="suggestion-symbol">({getHighlightedText(suggestion.symbol, symbol)})</span>
            </li>
          ))
        ) : (
          symbol.length >=3 && (
            <li className="suggestion-item no-results">No matching companies found.</li>
          )
        )}
      </ul>,
      document.body // Render suggestions into the body
    );
  };

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      className={`stock-form ${showSuggestions && suggestions.length > 0 ? 'suggestions-are-active' : ''}`}
      ref={formRef} // Changed from wrapperRef
    >
      <div className="stock-input-wrapper">
        <input
          ref={inputRef} // Add ref to input
          type="text"
          value={symbol}
          onChange={handleInputChangeInternal}
          onKeyDown={handleKeyDown}
          placeholder={animateSearch ? animatedPlaceholder : PLACEHOLDER_TEXTS[0]}
          className={`stock-input ${animateSearch ? 'animated-placeholder' : ''} ${symbol.trim() !== '' ? 'has-value' : ''}`}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-controls="suggestions-listbox"
          aria-activedescendant={activeSuggestionIndex >= 0 ? `suggestion-${activeSuggestionIndex}` : undefined}
        />
        {symbol && (
          <button
            type="button"
            className="clear-input-button"
            onClick={handleClearInput}
            aria-label="Clear search input"
          >
            &times;
          </button>
        )}
        {/* Suggestions are now rendered via portal */}
      </div>
      <button type="submit" disabled={loading || !symbol.trim()} className="fetch-button">
        {loading ? 'Searching...' : 'Get Stock Data'}
      </button>
      {showHint && !showSuggestions && (
        <span className="enter-hint">Press Enter ↵ to search</span>
      )}
      {renderSuggestions()} {/* Call the portal render function */}
    </form>
  );
};

StockSearchForm.propTypes = {
  symbol: PropTypes.string.isRequired,
  onSymbolChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  showHint: PropTypes.bool.isRequired,
};

export default StockSearchForm; 