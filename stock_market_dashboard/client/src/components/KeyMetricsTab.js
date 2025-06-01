import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  INITIAL_METRICS_DISPLAY_COUNT, // Max metrics to show before "View More" in a collapsible category
  PEER_COMPANIES_DISPLAY_COUNT  // Max peer companies to show in the table
} from '../constants';
import './KeyMetricsTab/MetricItem.css'; // Styles for MetricItem and related list elements

/**
 * @file KeyMetricsTab.js
 * 
 * @description This component renders the "Key Metrics" tab within the stock dashboard.
 * It is responsible for displaying a comprehensive set of categorized financial metrics
 * for the selected stock. Features include:
 *  - Grouping metrics into categories (e.g., Profitability, Valuation).
 *  - Collapsible sections for categories with many metrics.
 *  - Display of metric values, units, and explanatory tooltips.
 *  - Peer average comparisons and Year-over-Year (YoY) growth figures where applicable.
 *  - A separate table comparing key metrics of peer companies.
 * It receives categorized metric data, display configurations, and utility functions as props from App.js.
 */

/**
 * Internal functional component for the Key Metrics Tab.
 * Wrapped with React.memo for performance optimization to prevent unnecessary re-renders.
 * @param {object} props - The component's props.
 * @param {object} props.stockData - Main stock data object (used for context, e.g., company name, peer list).
 * @param {object} props.categorizedMetrics - Object where keys are category names and values are arrays of metric objects.
 * @param {string[]} props.categoryOrder - Array defining the order in which metric categories should be displayed.
 * @param {object} props.categoryDisplayTitles - Object mapping category keys to user-friendly display titles.
 * @param {string[]} props.COLLAPSIBLE_CATEGORIES - Array of category keys that support expand/collapse functionality.
 * @param {object} props.expandedMetricCategories - State object from App.js tracking which categories are currently expanded.
 * @param {function} props.toggleMetricCategoryExpansion - Callback function from App.js to toggle a category's expansion state.
 * @param {string} props.DEFAULT_NA_STRING - Default string to display for N/A (Not Available) values.
 * @param {function} props.getSafe - Utility to safely access nested object properties.
 * @param {function} props.formatCurrency - Utility to format numbers as currency.
 * @param {function} props.formatToCrores - Utility to format numbers to Crores representation.
 * @param {function} props.formatRatio - Utility to format numbers as ratios (e.g., "2.5x").
 * @param {function} props.formatPercentage - Utility to format numbers as percentages.
 * @param {string} props.tabId - The ID of the tab.
 * @param {function} props.onContentLoaded - Callback function to signal content loaded.
 */
const KeyMetricsTabInternal = ({
  stockData,                    
  categorizedMetrics,           
  categoryOrder,                
  categoryDisplayTitles,        
  COLLAPSIBLE_CATEGORIES,       
  expandedMetricCategories,     
  toggleMetricCategoryExpansion,
  DEFAULT_NA_STRING,            
  getSafe,                      
  formatCurrency,               
  formatToCrores,               
  formatRatio,                  
  formatPercentage,             
  tabId,
  onContentLoaded,
}) => {

  useEffect(() => {
    // Signal content loaded if categorizedMetrics has entries and stockData is present
    if (stockData && categorizedMetrics && Object.keys(categorizedMetrics).length > 0 && onContentLoaded) {
      onContentLoaded(tabId);
    }
    // If stockData is present but categorizedMetrics is empty (e.g., no metrics calculated), still signal ready 
    // as the "No Metrics Calculated" message is considered the content for this state.
    else if (stockData && categorizedMetrics && Object.keys(categorizedMetrics).length === 0 && onContentLoaded) {
      onContentLoaded(tabId);
    }
    // If no stockData (initial state), don't signal yet, wait for data or the no-data message to render.
    // The main conditional rendering in the return statement handles the display for !stockData.
    // We can consider the component "ready" for scrolling once stockData is checked.
    else if (!stockData && onContentLoaded) { // If no stockData, the placeholder message is the content
        onContentLoaded(tabId);
    }

  }, [stockData, categorizedMetrics, tabId, onContentLoaded]);

  const getRatingClass = (rating) => {
    if (!rating || typeof rating !== 'string') return ''; // Default: no specific class
    const ratingLower = rating.toLowerCase();
    if (ratingLower.includes('bullish')) return 'sentiment-value sentiment-positive';
    if (ratingLower.includes('bearish')) return 'sentiment-value sentiment-negative';
    if (ratingLower.includes('neutral')) return 'sentiment-value sentiment-neutral'; // Standardize Neutral to use warning color
    // For any other unhandled ratings, return empty string to use default text color.
    return ''; 
  };

  /**
   * Renders a single metric item as a row within a metric category card.
   * Displays the metric's label, its calculated value with appropriate units and styling,
   * an optional info icon with a tooltip for explanations, peer average comparison, and YoY growth.
   * Dynamic classes are applied for styling based on value (e.g., N/A) or peer comparison status.
   * @param {object} metric - The metric object containing label, value, unit, explanation, peerAverage, yoyGrowth, etc.
   * @param {number} index - The index of the metric, used for the React key.
   * @param {string} categoryKey - The key of the current metric category (e.g., 'overallSentiment').
   * @returns {JSX.Element} A div element representing the metric item.
   */
  const renderMetricItem = (metric, index, categoryKey) => (
    <div key={index} className="metric-item">
      {/* Metric Label and Info Tooltip */}
      <span className="metric-label">
        <strong>{metric.label}</strong>
        {metric.explanation && (
          <span className="info-icon-container" aria-label={metric.explanation} tabIndex={0} /* Tooltip accessible via focus */>
            <span className="info-icon" /> {/* Visual icon */}
            <span className="tooltip-text">{metric.explanation}</span> {/* Actual tooltip content */}
          </span>
        )}
      </span>
      {/* Metric Value, Unit, Peer Comparison, and YoY Growth */}
      <span 
        className={`metric-value-container ${metric.colorClass || ''} ${ 
                    (metric.peerComparison && metric.peerComparison.status === 'better') ? 'peer-better' : 
                    (metric.peerComparison && metric.peerComparison.status === 'worse') ? 'peer-worse' : '' 
                  } ${ 
                    (metric.value === DEFAULT_NA_STRING || metric.isNAOverride) ? 'metric-value-na-parent' : '' 
                  }`}
      >
        <div className="primary-metric-display">
          <span className={`value-main ${ 
              (metric.value === DEFAULT_NA_STRING || metric.isNAOverride) ? 'metric-value-na' : '' 
            } ${categoryKey === 'overallSentiment' ? getRatingClass(metric.value) : ''}`}>
        {metric.symbolPrefix && metric.value !== DEFAULT_NA_STRING && !metric.isNAOverride ? metric.unit : ''}
            {metric.value}
        {!metric.symbolPrefix && metric.value !== DEFAULT_NA_STRING && !metric.isNAOverride && metric.unit ? <span className="unit"> {metric.unit}</span> : ''}
          </span>
        </div>
        
        {metric.peerAverage && metric.peerAverage.value !== DEFAULT_NA_STRING && (
          <div className="peer-comparison-details">
            <span className="peer-average-label">Peer Avg:</span>
            <span className="peer-average-value">
              {metric.peerAverage.symbolPrefix && metric.peerAverage.value !== DEFAULT_NA_STRING ? metric.peerAverage.unit : ''}
            {metric.peerAverage.value}
            {!metric.peerAverage.symbolPrefix && metric.peerAverage.value !== DEFAULT_NA_STRING && metric.peerAverage.unit ? <span className="unit"> {metric.peerAverage.unit}</span> : ''}
            </span>
            {metric.peerComparison && metric.peerComparison.status !== 'neutral' && metric.peerComparison.text && (
              <span className={`peer-comparison-text status-${metric.peerComparison.status}`}>
                {metric.peerComparison.text}
              </span>
            )}
          </div>
        )}
        {metric.yoyGrowth && metric.yoyGrowth.value !== DEFAULT_NA_STRING && (
          <div className={`metric-yoy-growth ${metric.yoyGrowth.colorClass || ''}`}>
            (YoY: {metric.yoyGrowth.value}{metric.yoyGrowth.unit})
          </div>
        )}
      </span>
    </div>
  );

  return (
    <div 
      id="panel-keyMetrics" 
      role="tabpanel" 
      aria-labelledby="tab-keyMetrics" 
      className="tab-panel cards-grid-area" // Main container for key metrics, uses CSS grid for card layout.
      // The `ref` for focus management and `tabIndex` are handled in App.js.
    >
      {/* Conditional Rendering based on data availability */}

      {/* Case 1: No stock data loaded yet (initial state or after clearing search) */}
      {!stockData ? (
        <div className="card centered-message-card">
          <h3>📊 Key Metrics Await</h3>
          <p>Please search for a stock symbol to view its key financial metrics, peer comparisons, and more.</p>
        </div>

      /* Case 2: Stock data is loaded, but no metrics could be calculated (e.g., API missing financial data for the stock) */
      ) : Object.keys(categorizedMetrics).length === 0 && stockData ? (
        <div className="card centered-message-card">
          <h3><span className="shrug-icon">🤷</span> No Metrics Calculated</h3>
          <p>Metrics could not be calculated for {getSafe(() => stockData.companyName, "the selected stock")}. This might be due to missing financial data from the API.</p>
        </div>

      /* Case 3: Metrics are available - Render categorized metric cards */
      ) : (
        <>
          {/* Iterate over categoryOrder to display metric categories in a predefined sequence */}
          {categoryOrder.map(categoryKey => { 
            const metricsForCategory = categorizedMetrics[categoryKey] || [];
            const isCollapsible = COLLAPSIBLE_CATEGORIES.includes(categoryKey);
            const isExpanded = !!expandedMetricCategories[categoryKey];
            
            // Determine the subset of metrics to show initially for collapsible categories, or all metrics if expanded/not collapsible.
            const itemsToShow = isCollapsible && !isExpanded && metricsForCategory.length > INITIAL_METRICS_DISPLAY_COUNT
              ? metricsForCategory.slice(0, INITIAL_METRICS_DISPLAY_COUNT) // Show initial count if collapsed and has more
              : metricsForCategory; // Show all if expanded or not collapsible
              
            // Do not render a card for a category if it has no metrics AND no specific title is defined (e.g. for an empty state message).
            if (metricsForCategory.length === 0 && !categoryDisplayTitles[categoryKey]) {
              return null;
            }

            return (
              <div key={categoryKey} className="card metric-category-card">
                {/* Category Title: Use predefined display title or generate one from the categoryKey */}
                <h3>{categoryDisplayTitles[categoryKey] || categoryKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                
                {/* Metrics List or "No data" message */}
                {metricsForCategory.length > 0 ? (
                  <>
                    <div className="metrics-list">
                      {/* Render each metric item using the helper function */}
                      {itemsToShow.map((metricItem, itemIndex) => renderMetricItem(metricItem, itemIndex, categoryKey))}
                    </div>
                    {/* "View More" / "View Less" button for collapsible categories with more items than initially displayed */}
                    {isCollapsible && metricsForCategory.length > INITIAL_METRICS_DISPLAY_COUNT && (
                      <button 
                        onClick={() => toggleMetricCategoryExpansion(categoryKey)} 
                        className={`card-internal-button view-more-less-button ${isExpanded ? 'expanded' : 'collapsed'}`}
                      >
                        {isExpanded ? 'View Less' : `View More (${metricsForCategory.length - INITIAL_METRICS_DISPLAY_COUNT} more)`}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="no-data-message">No metrics available for this category.</p>
                )}
              </div>
            );
          })} 
        </>
      )}

      {/* Peer Companies Comparison Table Section */}
      {/* This section is displayed if stockData and companyProfile (which contains peer data) are available. */}
      {stockData && stockData.companyProfile && (
        <div className="card peer-companies-section">
          <h3>🤝 Peer Companies</h3>
          {/* Wrapper to allow horizontal scrolling for the table on smaller screens */}
          <div className="table-scroll-wrapper">
            {(() => {
              const peersToDisplay = getSafe(() => stockData.companyProfile.peerCompaniesForDisplay, []);
              if (peersToDisplay.length > 0) {
                return (
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Price (₹)</th>
                        <th>Mkt Cap (Cr)</th>
                        <th>P/E</th>
                        <th>P/B</th>
                        <th>Div Yield</th>
                        <th>% Change</th>
                        <th>Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Map over peer companies (up to PEER_COMPANIES_DISPLAY_COUNT) and render a row for each */}
                      {peersToDisplay.slice(0, PEER_COMPANIES_DISPLAY_COUNT).map((peer, index) => (
                        <tr key={index}>
                          <td className="text-left">{getSafe(() => peer.companyName)}</td>
                          {/* Use formatting utilities for currency, crores, ratios, and percentages */}
                          <td className="text-right">{formatCurrency(getSafe(() => peer.price)).value}</td>
                          <td className="text-right">{formatToCrores(getSafe(() => peer.marketCap)).value}</td>
                          <td className="text-right">{formatRatio(getSafe(() => peer.priceToEarningsValueRatio)).value}</td>
                          <td className="text-right">{formatRatio(getSafe(() => peer.priceToBookValueRatio)).value}</td>
                          <td className="text-right">{formatPercentage(getSafe(() => peer.dividendYieldIndicatedAnnualDividend), DEFAULT_NA_STRING, {colorOnPositiveNegative: true}).value}</td>
                          {/* Apply text color (positive/negative) based on netChange value */}
                          <td className={`text-right ${parseFloat(getSafe(() => peer.netChange, 0)) >= 0 ? 'text-positive' : 'text-negative'}`}> 
                            {formatPercentage(getSafe(() => peer.percentChange), DEFAULT_NA_STRING, {colorOnPositiveNegative: false}).value} %
                          </td>
                          <td className={`text-right ${getRatingClass(getSafe(() => peer.overallRating, DEFAULT_NA_STRING))}`}>
                            {getSafe(() => peer.overallRating, DEFAULT_NA_STRING)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              }
              // If no peer companies are available, display a message.
              return <p className="no-data-message">No peer companies listed for comparison.</p>;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes for type checking and documentation
KeyMetricsTabInternal.propTypes = {
  /** Main stock data object from App.js (transformed by apiAdapter) */
  stockData: PropTypes.object,
  /** Object containing metrics grouped by category */
  categorizedMetrics: PropTypes.object.isRequired,
  /** Array defining the display order of metric categories */
  categoryOrder: PropTypes.array.isRequired,
  /** Object mapping category keys to display-friendly titles */
  categoryDisplayTitles: PropTypes.object.isRequired,
  /** Array of category keys that should be collapsible */
  COLLAPSIBLE_CATEGORIES: PropTypes.array.isRequired,
  /** Object tracking which collapsible categories are currently expanded */
  expandedMetricCategories: PropTypes.object.isRequired,
  /** Function to toggle the expansion state of a metric category */
  toggleMetricCategoryExpansion: PropTypes.func.isRequired,
  /** Default string for N/A values */
  DEFAULT_NA_STRING: PropTypes.string.isRequired,
  /** Utility function to safely access nested object properties */
  getSafe: PropTypes.func.isRequired,
  /** Utility function to format numbers as currency */
  formatCurrency: PropTypes.func.isRequired,
  /** Utility function to format numbers to Crores */
  formatToCrores: PropTypes.func.isRequired,
  /** Utility function to format numbers as ratios (e.g., 2.5x) */
  formatRatio: PropTypes.func.isRequired,
  /** Utility function to format numbers as percentages */
  formatPercentage: PropTypes.func.isRequired,
  tabId: PropTypes.string.isRequired,
  onContentLoaded: PropTypes.func.isRequired,
};

// Default props for the component
KeyMetricsTabInternal.defaultProps = {
  stockData: null,
  // No defaults for isRequired props as they are expected to be passed from App.js.
};

// Display name for React DevTools for easier debugging.
KeyMetricsTabInternal.displayName = 'KeyMetricsTab';

// Memoize the KeyMetricsTab component using React.memo.
// This is a performance optimization that prevents re-rendering if the props have not changed.
// Given the potentially large amount of data and mapping, this is beneficial.
const KeyMetricsTab = React.memo(KeyMetricsTabInternal);

export default KeyMetricsTab; 