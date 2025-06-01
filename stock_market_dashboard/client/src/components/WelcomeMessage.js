/**
 * @file WelcomeMessage.js
 * @description Component to display a welcome message and example search terms to the user.
 * It is shown when the application loads initially or when no stock data is currently displayed.
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal functional component for the Welcome Message.
 * Renders a card with a welcome greeting, instructions, and clickable example search terms.
 * The example buttons can be disabled via the `loading` prop (e.g., during an API call).
 * @param {object} props - The component's props.
 * @param {boolean} props.loading - Indicates if data is currently being loaded (disables example buttons).
 * @param {function} props.handleExampleClick - Callback function to handle clicks on example search terms.
 */
const WelcomeMessageInternal = ({ loading, handleExampleClick }) => {
  return (
    <div className="card welcome-card">
      <h1>👋 Welcome to the Indian Stock Market Dashboard!</h1>
      <p>Enter a stock symbol or company name in the search bar above to get detailed insights, key metrics, and recent news.</p>
      <p className="example-searches-container">
        <span>For example, try:</span>
        <div className="example-buttons-wrapper">
          <button className="example-search-button" onClick={() => handleExampleClick('Reliance Industries')} disabled={loading}>Reliance Industries</button>
          <button className="example-search-button" onClick={() => handleExampleClick('INFY')} disabled={loading}>INFY</button>
          <button className="example-search-button" onClick={() => handleExampleClick('Tata Steel')} disabled={loading}>Tata Steel</button>
        </div>
      </p>
    </div>
  );
};

// PropTypes for type-checking the component's props.
WelcomeMessageInternal.propTypes = {
  /** Indicates if the application is in a loading state (e.g., fetching data), which disables example buttons. */
  loading: PropTypes.bool,
  /** Function to be called when an example search term button is clicked. Receives the example symbol as an argument. */
  handleExampleClick: PropTypes.func.isRequired,
};

WelcomeMessageInternal.displayName = 'WelcomeMessage';

// Memoize the WelcomeMessage component using React.memo to prevent unnecessary re-renders
// if its props (loading, handleExampleClick) do not change. This is a performance optimization.
const WelcomeMessage = React.memo(WelcomeMessageInternal);

export default WelcomeMessage; 